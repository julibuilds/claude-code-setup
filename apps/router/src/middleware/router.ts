/**
 * Router Middleware
 *
 * Implements intelligent routing logic based on request characteristics.
 * Routes requests to appropriate providers based on:
 * - Token count (long context)
 * - Model type (background tasks with haiku)
 * - Request features (thinking, web search)
 * - Explicit model override via comma syntax
 */

import type { AppConfig, ClaudeRequest } from "@repo/core";
import { calculateTokenCount } from "@repo/core";
import type { MiddlewareHandler } from "hono";

/**
 * Creates routing middleware that determines which provider and model to use
 * @param config - Application configuration
 * @returns Hono middleware handler
 */
export function routerMiddleware(config: AppConfig): MiddlewareHandler {
	return async (c, next) => {
		try {
			const request: ClaudeRequest = await c.req.json();

			// Calculate token count for routing decisions
			const tokenCount = calculateTokenCount(request.messages, request.system, request.tools);

			// Check for explicit model override using comma syntax: "provider,model"
			if (request.model?.includes(",")) {
				const [providerName, modelName] = request.model.split(",").map((s) => s.trim());
				const provider = config.Providers.find((p) => p.name === providerName);

				if (provider?.models.includes(modelName)) {
					// Explicit override found and valid
					c.set("routingContext", {
						provider,
						model: modelName,
						request,
						transformedRequest: request,
						tokenCount,
					});
					await next();
					return;
				}
				// If explicit override is invalid, fall through to normal routing
			}

			// Determine routing based on request characteristics
			let routeKey: string;

			// Check for long context routing
			const longContextThreshold = config.Router.longContextThreshold || 60000;
			if (tokenCount > longContextThreshold && config.Router.longContext) {
				routeKey = config.Router.longContext;
			}
			// Check for background task (haiku model indicates background work)
			else if (request.model?.toLowerCase().includes("haiku") && config.Router.background) {
				routeKey = config.Router.background;
			}
			// Check for web search capability
			else if (
				request.tools?.some((t) => t.name?.startsWith("web_search")) &&
				config.Router.webSearch
			) {
				routeKey = config.Router.webSearch;
			}
			// Check for thinking/reasoning mode
			else if (request.thinking && config.Router.think) {
				routeKey = config.Router.think;
			}
			// Use default route
			else {
				routeKey = config.Router.default;
			}

			// Parse route key (format: "provider,model")
			const [providerName, modelName] = routeKey.split(",").map((s) => s.trim());
			const provider = config.Providers.find((p) => p.name === providerName);

			if (!provider) {
				return c.json(
					{
						error: {
							type: "routing_error",
							message: `Provider "${providerName}" not found in configuration`,
						},
					},
					404
				);
			}

			// Verify the model exists in the provider's model list
			if (!provider.models.includes(modelName)) {
				return c.json(
					{
						error: {
							type: "routing_error",
							message: `Model "${modelName}" not available for provider "${providerName}"`,
						},
					},
					404
				);
			}

			// Set routing context for downstream middleware
			c.set("routingContext", {
				provider,
				model: modelName,
				request,
				transformedRequest: request, // Will be modified by transformer middleware
				tokenCount,
			});

			await next();
		} catch (error) {
			console.error("Routing error:", error);
			return c.json(
				{
					error: {
						type: "routing_error",
						message: error instanceof Error ? error.message : "Failed to route request",
					},
				},
				500
			);
		}
	};
}
