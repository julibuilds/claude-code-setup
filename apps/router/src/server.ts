/**
 * Server Setup
 *
 * Creates and configures the Hono server with middleware and routes.
 */

import type { AppConfig, ClaudeRequest, ProviderConfig } from "@repo/core";
import { calculateTokenCount } from "@repo/core";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { stream } from "hono/streaming";
import { authMiddleware } from "./middleware/auth";
import { routerMiddleware } from "./middleware/router";
import { transformerMiddleware } from "./middleware/transformer";

// Define context variables for type safety
type Variables = {
	routingContext?: {
		provider: ProviderConfig;
		model: string;
		request: ClaudeRequest;
		transformedRequest: ClaudeRequest | Record<string, unknown>;
		tokenCount: number;
	};
	transformedResponse?: Record<string, unknown>;
};

export function createServer(config: AppConfig) {
	const app = new Hono<{ Variables: Variables }>();

	// Global middleware
	app.use("*", logger());
	app.use("*", cors());

	// Authentication middleware (if API key is configured)
	if (config.APIKEY) {
		app.use("/v1/*", authMiddleware(config.APIKEY));
	}

	// Health check endpoint
	app.get("/", (c) => {
		return c.json({
			status: "ok",
			version: "1.0.0",
			service: "claude-code-router",
			providers: config.Providers?.map((p) => p.name) || [],
		});
	});

	// Token counting endpoint
	app.post("/v1/messages/count_tokens", async (c) => {
		try {
			const { messages, system, tools } = await c.req.json();

			// Validate required fields
			if (!messages || !Array.isArray(messages)) {
				return c.json(
					{
						error: {
							type: "invalid_request_error",
							message: "messages field is required and must be an array",
						},
					},
					400
				);
			}

			// Calculate token count using Core Library utility
			const tokenCount = calculateTokenCount(messages, system, tools);

			return c.json({
				input_tokens: tokenCount,
			});
		} catch (error) {
			console.error("Token counting error:", error);
			return c.json(
				{
					error: {
						type: "token_counting_error",
						message: error instanceof Error ? error.message : "Failed to count tokens",
					},
				},
				500
			);
		}
	});

	// Main proxy endpoint with routing and transformation middleware
	app.post("/v1/messages", routerMiddleware(config), transformerMiddleware(config), async (c) => {
		try {
			// Get routing context set by middleware
			const routingContext = c.get("routingContext");

			if (!routingContext) {
				return c.json(
					{
						error: {
							type: "routing_error",
							message: "No routing context available",
						},
					},
					500
				);
			}

			const { provider, request, transformedRequest } = routingContext;

			// Prepare request to provider
			const providerUrl = provider.api_base_url;
			const headers: Record<string, string> = {
				"Content-Type": "application/json",
			};

			// Add authorization header if API key is present
			if (provider.api_key) {
				headers.Authorization = `Bearer ${provider.api_key}`;
			}

			// Forward request to provider
			const response = await fetch(providerUrl, {
				method: "POST",
				headers,
				body: JSON.stringify(transformedRequest),
			});

			// Handle streaming responses
			if (request.stream) {
				// Set appropriate headers for SSE
				c.header("Content-Type", "text/event-stream");
				c.header("Cache-Control", "no-cache");
				c.header("Connection", "keep-alive");

				return stream(c, async (stream) => {
					const reader = response.body?.getReader();
					if (!reader) {
						await stream.write('event: error\ndata: {"error": "No response body"}\n\n');
						return;
					}

					const decoder = new TextDecoder();

					try {
						while (true) {
							const { done, value } = await reader.read();
							if (done) break;

							// Decode and forward the chunk
							const chunk = decoder.decode(value, { stream: true });
							await stream.write(chunk);
						}
					} catch (error) {
						console.error("Streaming error:", error);
						await stream.write(
							`event: error\ndata: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`
						);
					} finally {
						reader.releaseLock();
					}
				});
			}

			// Handle non-streaming responses
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({
					error: "Unknown error",
				}));
				return c.json(errorData, response.status as 400 | 401 | 403 | 404 | 500 | 502 | 503);
			}

			const data = (await response.json()) as Record<string, unknown>;

			// Store response for transformer middleware to process
			c.set("transformedResponse", data);

			// The transformer middleware will have already processed this
			// Get the final transformed response
			const transformedResponse = c.get("transformedResponse");

			return c.json(transformedResponse || data);
		} catch (error) {
			console.error("Proxy error:", error);
			return c.json(
				{
					error: {
						type: "proxy_error",
						message: error instanceof Error ? error.message : "Unknown error occurred",
					},
				},
				500
			);
		}
	});

	return app;
}
