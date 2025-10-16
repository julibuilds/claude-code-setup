/**
 * Cloudflare Workers Entry Point
 *
 * This file adapts the Claude Code Router for Cloudflare Workers runtime.
 * It handles Workers-specific request/response objects and environment bindings.
 */

import type { AppConfig } from "@repo/core/browser";
import { createServer } from "./server";

// Import Cloudflare Workers types
// These are provided by @cloudflare/workers-types package
type KVNamespace = import("@cloudflare/workers-types").KVNamespace;
type DurableObjectNamespace = import("@cloudflare/workers-types").DurableObjectNamespace;
type AnalyticsEngineDataset = import("@cloudflare/workers-types").AnalyticsEngineDataset;
type ExecutionContext = import("@cloudflare/workers-types").ExecutionContext;

/**
 * Cloudflare Workers Environment Bindings
 * These are injected by the Workers runtime based on wrangler.toml configuration
 */
export interface Env {
	// Secrets (set via: wrangler secret put <KEY>)
	APIKEY?: string;
	OPENROUTER_API_KEY?: string;
	DEEPSEEK_API_KEY?: string;
	GEMINI_API_KEY?: string;
	CONFIG_JSON?: string;

	// Environment variables
	LOG_LEVEL?: string;
	HOST?: string;
	PORT?: string;

	// Optional KV namespace for configuration storage
	CONFIG_STORE?: KVNamespace;

	// Optional Durable Objects for session management
	SESSIONS?: DurableObjectNamespace;

	// Optional Analytics Engine for usage tracking
	ANALYTICS?: AnalyticsEngineDataset;
}

/**
 * Parse configuration from environment
 * Priority: CONFIG_JSON > individual environment variables > defaults
 */
function parseConfig(env: Env): AppConfig {
	// If CONFIG_JSON is provided, use it as the base configuration
	let config: AppConfig;

	if (env.CONFIG_JSON) {
		try {
			config = JSON.parse(env.CONFIG_JSON);
		} catch (error) {
			console.error("Failed to parse CONFIG_JSON:", error);
			config = {
				Providers: [],
				Router: { default: "" },
			};
		}
	} else {
		// Build configuration from individual environment variables
		config = {
			Providers: [],
			Router: { default: "" },
		};
	}

	// Override with individual environment variables if present
	if (env.APIKEY) config.APIKEY = env.APIKEY;
	if (env.LOG_LEVEL) config.LOG_LEVEL = env.LOG_LEVEL as AppConfig["LOG_LEVEL"];
	if (env.HOST) config.HOST = env.HOST;
	if (env.PORT) config.PORT = parseInt(env.PORT, 10);

	// Interpolate API keys in provider configurations
	if (config.Providers) {
		for (const provider of config.Providers) {
			if (provider.api_key === "$OPENROUTER_API_KEY" && env.OPENROUTER_API_KEY) {
				provider.api_key = env.OPENROUTER_API_KEY;
			}
			if (provider.api_key === "$DEEPSEEK_API_KEY" && env.DEEPSEEK_API_KEY) {
				provider.api_key = env.DEEPSEEK_API_KEY;
			}
			if (provider.api_key === "$GEMINI_API_KEY" && env.GEMINI_API_KEY) {
				provider.api_key = env.GEMINI_API_KEY;
			}
		}
	}

	return config;
}

/**
 * Cloudflare Workers fetch handler
 * This is the main entry point for all requests to the Worker
 */
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		try {
			// Parse configuration from environment
			const config = parseConfig(env);

			// Create Hono server instance
			const app = createServer({ config });

			// Forward request to Hono app
			// Hono's fetch handler is compatible with Workers Request/Response
			return await app.fetch(request, env, ctx);
		} catch (error) {
			console.error("Worker error:", error);

			// Return error response
			return new Response(
				JSON.stringify({
					error: {
						type: "internal_error",
						message: error instanceof Error ? error.message : "Unknown error occurred",
					},
				}),
				{
					status: 500,
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
		}
	},
};

/**
 * Optional: Scheduled event handler for periodic tasks
 * Uncomment and configure in wrangler.toml if needed
 */
// export default {
//   async scheduled(
//     event: ScheduledEvent,
//     env: Env,
//     ctx: ExecutionContext
//   ): Promise<void> {
//     // Perform periodic tasks like:
//     // - Cleanup old logs
//     // - Aggregate usage statistics
//     // - Health checks
//     console.log("Scheduled event triggered:", event.cron);
//   },
// };

/**
 * Optional: Durable Object for session management
 * Uncomment and configure in wrangler.toml if needed
 */
// export class SessionManager {
//   state: DurableObjectState;
//   env: Env;
//
//   constructor(state: DurableObjectState, env: Env) {
//     this.state = state;
//     this.env = env;
//   }
//
//   async fetch(request: Request): Promise<Response> {
//     // Handle session-specific requests
//     return new Response("Session manager");
//   }
// }
