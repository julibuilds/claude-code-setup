/**
 * Configuration Manager
 * Handles reading, writing, and backing up configuration files
 */

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { AppConfig } from "@repo/core";

export class ConfigManager {
	private configPath: string;
	private backupDir: string;

	constructor(configPath: string) {
		this.configPath = configPath;
		this.backupDir = join(dirname(configPath), ".backups");
	}

	/**
	 * Read the current configuration
	 */
	readConfig(): AppConfig {
		try {
			if (!existsSync(this.configPath)) {
				throw new Error(`Configuration file not found: ${this.configPath}`);
			}

			const content = readFileSync(this.configPath, "utf-8");
			return JSON.parse(content) as AppConfig;
		} catch (error) {
			if (error instanceof SyntaxError) {
				throw new Error(`Invalid JSON in configuration file: ${error.message}`);
			}
			throw error;
		}
	}

	/**
	 * Write configuration to file
	 */
	writeConfig(config: AppConfig): void {
		try {
			// Ensure directory exists
			const dir = dirname(this.configPath);
			if (!existsSync(dir)) {
				mkdirSync(dir, { recursive: true });
			}

			// Write configuration with pretty formatting
			const content = JSON.stringify(config, null, 2);
			writeFileSync(this.configPath, content, "utf-8");
		} catch (error) {
			throw new Error(`Failed to write configuration: ${(error as Error).message}`);
		}
	}

	/**
	 * Create a backup of the current configuration
	 * Returns the backup file path
	 */
	createBackup(): string {
		try {
			if (!existsSync(this.configPath)) {
				throw new Error("Cannot backup: configuration file does not exist");
			}

			// Ensure backup directory exists
			if (!existsSync(this.backupDir)) {
				mkdirSync(this.backupDir, { recursive: true });
			}

			// Create backup filename with timestamp
			const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
			const backupPath = join(this.backupDir, `config.${timestamp}.json`);

			// Copy current config to backup
			copyFileSync(this.configPath, backupPath);

			return backupPath;
		} catch (error) {
			throw new Error(`Failed to create backup: ${(error as Error).message}`);
		}
	}

	/**
	 * Update configuration with automatic backup
	 */
	updateConfig(config: AppConfig): string {
		// Create backup before updating
		const backupPath = this.createBackup();

		// Write new configuration
		this.writeConfig(config);

		return backupPath;
	}

	/**
	 * Validate configuration structure
	 */
	validateConfig(config: unknown): { valid: boolean; errors: string[] } {
		const errors: string[] = [];

		if (!config || typeof config !== "object") {
			errors.push("Configuration must be an object");
			return { valid: false, errors };
		}

		const cfg = config as Record<string, unknown>;

		// Validate Providers
		if (!Array.isArray(cfg.Providers)) {
			errors.push("Providers must be an array");
		} else if (cfg.Providers.length === 0) {
			errors.push("At least one provider must be configured");
		} else {
			cfg.Providers.forEach((provider: unknown, index: number) => {
				if (!provider || typeof provider !== "object") {
					errors.push(`Provider at index ${index} must be an object`);
					return;
				}

				const p = provider as Record<string, unknown>;

				if (!p.name || typeof p.name !== "string") {
					errors.push(`Provider at index ${index} must have a name (string)`);
				}

				if (!p.api_base_url || typeof p.api_base_url !== "string") {
					errors.push(`Provider at index ${index} must have an api_base_url (string)`);
				}

				if (!p.api_key || typeof p.api_key !== "string") {
					errors.push(`Provider at index ${index} must have an api_key (string)`);
				}

				if (!Array.isArray(p.models) || p.models.length === 0) {
					errors.push(`Provider at index ${index} must have at least one model`);
				}
			});
		}

		// Validate Router
		if (!cfg.Router || typeof cfg.Router !== "object") {
			errors.push("Router configuration must be an object");
		} else {
			const router = cfg.Router as Record<string, unknown>;

			if (!router.default || typeof router.default !== "string") {
				errors.push("Router must have a default route (string)");
			}
		}

		return {
			valid: errors.length === 0,
			errors,
		};
	}

	/**
	 * Check if configuration file exists
	 */
	configExists(): boolean {
		return existsSync(this.configPath);
	}
}
