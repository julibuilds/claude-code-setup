/**
 * Configuration Management Routes
 */

import type { AppConfig } from "@repo/core/browser";
import type { Context } from "hono";
import type { Logger } from "pino";
import { ConfigManager } from "../utils/config-manager";

/**
 * Setup configuration management routes
 */
export function setupConfigRoutes(
	app: any,
	config: AppConfig,
	logger: Logger,
	configPath?: string
) {
	// Initialize config manager if config path is provided
	const configManager = configPath ? new ConfigManager(configPath) : null;

	// GET /api/config - Read current configuration
	app.get("/api/config", async (c: Context) => {
		try {
			// Return the current configuration
			// Note: Sensitive data like API keys should be masked in production
			const sanitizedConfig = {
				...config,
				Providers: config.Providers?.map((p) => ({
					...p,
					api_key: p.api_key ? "***" : undefined, // Mask API keys
				})),
				APIKEY: config.APIKEY ? "***" : undefined, // Mask router API key
			};

			return c.json(sanitizedConfig);
		} catch (error) {
			logger.error(
				{
					error: error instanceof Error ? error.message : "Unknown error",
				},
				"Failed to read configuration"
			);

			return c.json(
				{
					error: {
						type: "config_read_error",
						message: error instanceof Error ? error.message : "Failed to read configuration",
					},
				},
				500
			);
		}
	});

	// POST /api/config - Update configuration
	app.post("/api/config", async (c: Context) => {
		try {
			const newConfig = await c.req.json();

			// Validate the configuration structure
			if (!newConfig || typeof newConfig !== "object") {
				return c.json(
					{
						error: {
							type: "invalid_request_error",
							message: "Configuration must be a valid JSON object",
						},
					},
					400
				);
			}

			// Validate configuration
			if (!configManager) {
				return c.json(
					{
						error: {
							type: "config_error",
							message: "Configuration management is not enabled (no config file path provided)",
						},
					},
					503
				);
			}

			const validation = configManager.validateConfig(newConfig);
			if (!validation.valid) {
				return c.json(
					{
						error: {
							type: "validation_error",
							message: "Configuration validation failed",
							details: validation.errors,
						},
					},
					400
				);
			}

			// Create backup and write new configuration
			const backupPath = configManager.updateConfig(newConfig as AppConfig);

			logger.info(
				{
					backupPath,
				},
				"Configuration updated successfully"
			);

			return c.json({
				success: true,
				message: "Configuration updated successfully. Server restart required to apply changes.",
				backup: backupPath,
			});
		} catch (error) {
			logger.error(
				{
					error: error instanceof Error ? error.message : "Unknown error",
				},
				"Failed to update configuration"
			);

			return c.json(
				{
					error: {
						type: "config_update_error",
						message: error instanceof Error ? error.message : "Failed to update configuration",
					},
				},
				500
			);
		}
	});

	// POST /api/config/backup - Create a backup of current configuration
	app.post("/api/config/backup", async (c: Context) => {
		try {
			if (!configManager) {
				return c.json(
					{
						error: {
							type: "config_error",
							message: "Configuration management is not enabled",
						},
					},
					503
				);
			}

			const backupPath = configManager.createBackup();

			logger.info(
				{
					backupPath,
				},
				"Configuration backup created"
			);

			return c.json({
				success: true,
				backup: backupPath,
			});
		} catch (error) {
			logger.error(
				{
					error: error instanceof Error ? error.message : "Unknown error",
				},
				"Failed to create backup"
			);

			return c.json(
				{
					error: {
						type: "backup_error",
						message: error instanceof Error ? error.message : "Failed to create backup",
					},
				},
				500
			);
		}
	});
}
