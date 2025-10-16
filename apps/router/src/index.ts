/**
 * Router Service Entry Point
 *
 * This is the main entry point for the Claude Code Router Service.
 * It initializes the server and starts listening for requests.
 */

import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadConfig } from "@repo/core";
import { createServer } from "./server";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3456;
const HOST = process.env.HOST || "0.0.0.0";

console.log(`Starting Claude Code Router Service...`);
console.log(`Server will listen on ${HOST}:${PORT}`);

// Load configuration from file
const configPath = process.env.CONFIG_PATH || "./config.json";
const absoluteConfigPath = resolve(configPath);

let app: ReturnType<typeof createServer>;

if (existsSync(absoluteConfigPath)) {
	console.log(`Loading configuration from: ${absoluteConfigPath}`);
	try {
		const config = loadConfig(absoluteConfigPath);

		// Override with environment variables if present
		if (process.env.PORT) config.PORT = parseInt(process.env.PORT);
		if (process.env.HOST) config.HOST = process.env.HOST;

		app = createServer({
			config,
			configPath: absoluteConfigPath,
		});

		console.log(`Configuration loaded successfully`);
		console.log(`Providers: ${config.Providers?.map((p) => p.name).join(", ") || "none"}`);
	} catch (error) {
		console.error(
			`Failed to load configuration: ${error instanceof Error ? error.message : error}`
		);
		console.error(`Starting with minimal configuration...`);

		// Fallback to minimal config
		app = createServer({
			config: {
				Providers: [],
				Router: { default: "" },
			},
		});
	}
} else {
	console.warn(`Configuration file not found: ${absoluteConfigPath}`);
	console.warn(`Starting with minimal configuration...`);
	console.warn(`Set CONFIG_PATH environment variable to specify a config file`);

	// Fallback to minimal config
	app = createServer({
		config: {
			Providers: [],
			Router: { default: "" },
		},
	});
}

export default {
	port: PORT,
	hostname: HOST,
	fetch: app.fetch,
};
