/**
 * Server Setup
 *
 * Creates and configures the Hono server with middleware and routes.
 */

import type { AppConfig, ClaudeRequest, ProviderConfig } from "@repo/core/browser";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger as honoLogger } from "hono/logger";
import { authMiddleware } from "./middleware/auth";
import { setupConfigRoutes } from "./routes/config";
import { setupProxyRoutes } from "./routes/proxy";
import { setupTransformerRoutes } from "./routes/transformers";
import { setupUsageRoutes } from "./routes/usage";
import { UsageCache } from "./utils/cache";
import { createLogger } from "./utils/logger";

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
	sessionId?: string;
};

export interface ServerOptions {
	config: AppConfig;
	configPath?: string;
}

export function createServer(options: ServerOptions | AppConfig) {
	// Support both old and new API
	const config = "config" in options ? options.config : options;
	const configPath = "configPath" in options ? options.configPath : undefined;

	const app = new Hono<{ Variables: Variables }>();

	// Initialize logger and usage cache
	const logger = createLogger(config);
	const usageCache = new UsageCache();

	// Log server initialization
	logger.info(
		{
			providers: config.Providers?.map((p) => p.name) || [],
			logLevel: config.LOG_LEVEL || "info",
			loggingEnabled: config.LOG !== false,
			configPath: configPath || "in-memory",
		},
		"Server initialized"
	);

	// Global middleware
	app.use("*", honoLogger());
	app.use("*", cors());

	// Authentication middleware (if API key is configured)
	if (config.APIKEY) {
		app.use("/v1/*", authMiddleware(config.APIKEY));
		app.use("/api/*", authMiddleware(config.APIKEY));
	}

	// Health check endpoint
	app.get("/", (c) => {
		return c.json({
			status: "ok",
			version: "1.0.0",
			service: "claude-code-router",
			providers: config.Providers?.map((p) => p.name) || [],
			configManagement: configPath ? "enabled" : "disabled",
		});
	});

	// Setup route modules
	setupProxyRoutes(app, config, logger, usageCache);
	setupUsageRoutes(app, usageCache, logger);
	setupConfigRoutes(app, config, logger, configPath);
	setupTransformerRoutes(app, config, logger);

	return app;
}
