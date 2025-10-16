/**
 * Transformer Middleware
 *
 * Applies request and response transformations for provider compatibility.
 * Supports chaining multiple transformers for complex transformations.
 */

import type { AppConfig } from "@repo/core/browser";
import { TransformerRegistry } from "@repo/core/browser";
import type { MiddlewareHandler } from "hono";

/**
 * Creates transformer middleware that applies request/response transformations
 * @param config - Application configuration
 * @returns Hono middleware handler
 */
export function transformerMiddleware(config: AppConfig): MiddlewareHandler {
	// Initialize transformer registry once
	const registry = new TransformerRegistry(config);

	return async (c, next) => {
		try {
			// Get routing context set by router middleware
			const routingContext = c.get("routingContext");

			if (!routingContext) {
				// No routing context, skip transformation
				await next();
				return;
			}

			const { provider, model, request } = routingContext;

			// Get transformers for this provider and model
			const transformers = registry.getTransformers(provider, model);

			// Apply request transformations in order
			let transformedRequest = request;
			for (const transformer of transformers) {
				if (transformer.transformRequest) {
					try {
						transformedRequest = await Promise.resolve(
							transformer.transformRequest(transformedRequest, {
								config,
								provider,
								model,
							})
						);
					} catch (error) {
						console.error(`Request transformation error (${transformer.name}):`, error);
						return c.json(
							{
								error: {
									type: "transformation_error",
									message: `Failed to transform request using ${transformer.name}`,
									details: error instanceof Error ? error.message : "Unknown error",
								},
							},
							500
						);
					}
				}
			}

			// Update routing context with transformed request
			c.set("routingContext", {
				...routingContext,
				transformedRequest,
			});

			// Call next middleware/handler
			await next();

			// Apply response transformations in reverse order
			// Get the response from the context (set by the main handler)
			const response = c.get("transformedResponse");

			// If there's no response in context, the handler might have already sent the response
			// (e.g., streaming), so we skip response transformation
			if (!response) {
				return;
			}

			let transformedResponse = response;
			// Apply transformers in reverse order for response
			for (const transformer of transformers.reverse()) {
				if (transformer.transformResponse) {
					try {
						transformedResponse = await Promise.resolve(
							transformer.transformResponse(transformedResponse, {
								config,
								provider,
								model,
							})
						);
					} catch (error) {
						console.error(`Response transformation error (${transformer.name}):`, error);
						return c.json(
							{
								error: {
									type: "transformation_error",
									message: `Failed to transform response using ${transformer.name}`,
									details: error instanceof Error ? error.message : "Unknown error",
								},
							},
							500
						);
					}
				}
			}

			// Update the transformed response in context
			c.set("transformedResponse", transformedResponse);
		} catch (error) {
			console.error("Transformer middleware error:", error);
			return c.json(
				{
					error: {
						type: "transformation_error",
						message: error instanceof Error ? error.message : "Transformation failed",
					},
				},
				500
			);
		}
	};
}
