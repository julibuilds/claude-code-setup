/**
 * Configuration loader utility
 * Loads and validates configuration from JSON files
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";
import type { AppConfig } from "../types/config.js";
import { interpolateEnvVars } from "./env-interpolation.js";

/**
 * Zod schema for validating provider configuration
 */
const ProviderConfigSchema = z.object({
	name: z.string().min(1),
	api_base_url: z.string().url(),
	api_key: z.string().min(1),
	models: z.array(z.string()).min(1),
	transformer: z
		.object({
			use: z.array(z.union([z.string(), z.tuple([z.string(), z.record(z.string(), z.any())])])),
		})
		.catchall(z.any())
		.optional(),
});

/**
 * Zod schema for validating router configuration
 */
const RouterConfigSchema = z.object({
	default: z.string().min(1),
	background: z.string().optional(),
	think: z.string().optional(),
	longContext: z.string().optional(),
	longContextThreshold: z.number().positive().optional(),
	webSearch: z.string().optional(),
	image: z.string().optional(),
});

/**
 * Zod schema for validating application configuration
 */
const AppConfigSchema = z.object({
	APIKEY: z.string().optional(),
	HOST: z.string().optional(),
	PORT: z.number().positive().optional(),
	PROXY_URL: z.string().url().optional(),
	LOG: z.boolean().optional(),
	LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).optional(),
	API_TIMEOUT_MS: z.number().positive().optional(),
	NON_INTERACTIVE_MODE: z.boolean().optional(),
	CUSTOM_ROUTER_PATH: z.string().optional(),
	Providers: z.array(ProviderConfigSchema).min(1),
	Router: RouterConfigSchema,
	transformers: z
		.array(
			z.object({
				path: z.string(),
				options: z.record(z.string(), z.any()).optional(),
			})
		)
		.optional(),
});

/**
 * Load and validate configuration from a JSON file
 *
 * @param configPath - Path to the configuration file (relative or absolute)
 * @returns Validated and interpolated configuration
 * @throws Error if configuration is invalid or file cannot be read
 *
 * @example
 * ```typescript
 * const config = loadConfig("./config.json");
 * console.log(config.Providers[0].name);
 * ```
 */
export function loadConfig(configPath: string): AppConfig {
	try {
		// Resolve the configuration file path
		const absolutePath = resolve(configPath);

		// Read the configuration file
		const fileContent = readFileSync(absolutePath, "utf-8");

		// Parse JSON
		const rawConfig = JSON.parse(fileContent);

		// Apply environment variable interpolation
		const interpolatedConfig = interpolateEnvVars(rawConfig);

		// Validate configuration structure
		const validatedConfig = AppConfigSchema.parse(interpolatedConfig);

		return validatedConfig as AppConfig;
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errorMessages = error.issues
				.map((err: z.ZodIssue) => `${err.path.join(".")}: ${err.message}`)
				.join("\n");
			throw new Error(`Configuration validation failed:\n${errorMessages}`);
		}

		if (error instanceof SyntaxError) {
			throw new Error(`Invalid JSON in configuration file: ${error.message}`);
		}

		if ((error as NodeJS.ErrnoException).code === "ENOENT") {
			throw new Error(`Configuration file not found: ${configPath}`);
		}

		throw new Error(`Failed to load configuration: ${(error as Error).message}`);
	}
}

/**
 * Load configuration with default values
 *
 * @param configPath - Path to the configuration file
 * @param defaults - Default configuration values to merge
 * @returns Validated and interpolated configuration with defaults applied
 */
export function loadConfigWithDefaults(
	configPath: string,
	defaults: Partial<AppConfig>
): AppConfig {
	const config = loadConfig(configPath);

	return {
		...defaults,
		...config,
		// Ensure nested objects are properly merged
		Router: {
			...defaults.Router,
			...config.Router,
		},
	} as AppConfig;
}
