/**
 * Proxy Routes
 * Main Claude API proxy endpoints
 */

import type { AppConfig } from "@repo/core";
import { calculateTokenCount } from "@repo/core";
import type { Context } from "hono";
import { stream } from "hono/streaming";
import type { Logger } from "pino";
import { routerMiddleware } from "../middleware/router";
import { transformerMiddleware } from "../middleware/transformer";
import type { UsageCache } from "../utils/cache";

/**
 * Setup proxy routes
 */
export function setupProxyRoutes(
	app: any,
	config: AppConfig,
	logger: Logger,
	usageCache: UsageCache
) {
	// POST /v1/messages/count_tokens - Token counting endpoint
	app.post("/v1/messages/count_tokens", async (c: Context) => {
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

	// POST /v1/messages - Main proxy endpoint
	app.post(
		"/v1/messages",
		routerMiddleware(config),
		transformerMiddleware(config),
		async (c: Context) => {
			const startTime = Date.now();
			const sessionId = c.req.header("x-session-id") || "default";
			c.set("sessionId", sessionId);

			try {
				// Get routing context set by middleware
				const routingContext = c.get("routingContext");

				if (!routingContext) {
					logger.error("No routing context available");
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

				const { provider, model, request, transformedRequest, tokenCount } = routingContext;

				// Log routing decision
				logger.info(
					{
						sessionId,
						provider: provider.name,
						model,
						tokenCount,
						streaming: request.stream || false,
					},
					"Request routed"
				);

				// Prepare request to provider
				const providerUrl = provider.api_base_url;
				const headers: Record<string, string> = {
					"Content-Type": "application/json",
				};

				// Add authorization header if API key is present
				if (provider.api_key) {
					headers.Authorization = `Bearer ${provider.api_key}`;
				}

				// Log request transformation
				logger.debug(
					{
						sessionId,
						provider: provider.name,
						originalModel: request.model,
						targetModel: model,
					},
					"Request transformed"
				);

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

					logger.error(
						{
							sessionId,
							provider: provider.name,
							model,
							status: response.status,
							error: errorData,
						},
						"Provider request failed"
					);

					return c.json(errorData, response.status as 400 | 401 | 403 | 404 | 500 | 502 | 503);
				}

				const data = (await response.json()) as Record<string, unknown>;

				// Store response for transformer middleware to process
				c.set("transformedResponse", data);

				// The transformer middleware will have already processed this
				// Get the final transformed response
				const transformedResponse = c.get("transformedResponse");

				// Track usage if response contains usage data
				if (transformedResponse && typeof transformedResponse === "object") {
					const usage = (transformedResponse as Record<string, unknown>).usage as
						| { input_tokens?: number; output_tokens?: number }
						| undefined;
					if (usage) {
						const inputTokens = usage.input_tokens || 0;
						const outputTokens = usage.output_tokens || 0;

						usageCache.trackUsage(sessionId, provider.name, inputTokens, outputTokens);

						logger.info(
							{
								sessionId,
								provider: provider.name,
								model,
								inputTokens,
								outputTokens,
								duration: Date.now() - startTime,
							},
							"Request completed"
						);
					}
				}

				return c.json(transformedResponse || data);
			} catch (error) {
				logger.error(
					{
						sessionId: c.get("sessionId"),
						error: error instanceof Error ? error.message : "Unknown error",
						stack: error instanceof Error ? error.stack : undefined,
					},
					"Proxy error"
				);

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
		}
	);
}
