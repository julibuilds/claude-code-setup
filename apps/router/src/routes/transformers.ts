/**
 * Transformer Management Routes
 */

import type { AppConfig } from "@repo/core/browser";
import { TransformerRegistry } from "@repo/core/browser";
import type { Context } from "hono";
import type { Logger } from "pino";

/**
 * Setup transformer management routes
 */
export function setupTransformerRoutes(app: any, config: AppConfig, logger: Logger) {
	const transformerRegistry = new TransformerRegistry(config);

	// GET /api/transformers - List all available transformers
	app.get("/api/transformers", async (c: Context) => {
		try {
			// Get list of all available transformers
			const transformerNames = transformerRegistry.listTransformers();

			// Build detailed transformer information
			const transformers = transformerNames.map((name) => {
				const transformer = transformerRegistry.getTransformer(name);

				if (!transformer) {
					return {
						name,
						available: false,
					};
				}

				// Determine transformer type (built-in or custom)
				const isBuiltIn = ["openrouter", "deepseek", "gemini"].includes(name);

				return {
					name,
					available: true,
					type: isBuiltIn ? "built-in" : "custom",
					capabilities: {
						transformRequest: typeof transformer.transformRequest === "function",
						transformResponse: typeof transformer.transformResponse === "function",
						transformStreamChunk: typeof transformer.transformStreamChunk === "function",
					},
				};
			});

			// Get transformer usage from provider configurations
			const providerTransformers: Record<
				string,
				{ provider: string; models: string[]; transformers: string[] }
			> = {};

			if (config.Providers) {
				for (const provider of config.Providers) {
					if (provider.transformer?.use) {
						const transformerList = provider.transformer.use.map((t) =>
							typeof t === "string" ? t : t[0]
						);

						providerTransformers[provider.name] = {
							provider: provider.name,
							models: provider.models || [],
							transformers: transformerList,
						};
					}
				}
			}

			return c.json({
				transformers,
				usage: providerTransformers,
				total: transformers.length,
			});
		} catch (error) {
			logger.error(
				{
					error: error instanceof Error ? error.message : "Unknown error",
				},
				"Failed to list transformers"
			);

			return c.json(
				{
					error: {
						type: "transformer_list_error",
						message: error instanceof Error ? error.message : "Failed to list transformers",
					},
				},
				500
			);
		}
	});
}
