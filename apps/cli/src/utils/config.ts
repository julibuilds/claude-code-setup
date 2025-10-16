import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { type Config, ConfigSchema } from "../types/config";

export function getRouterPath(): string {
	// Try multiple possible locations for the router directory
	const cwd = process.cwd();

	// If running from apps/cli
	const fromCli = resolve(cwd, "..", "router");
	if (existsSync(join(fromCli, "config.json"))) {
		return fromCli;
	}

	// If running from project root
	const fromRoot = resolve(cwd, "apps", "router");
	if (existsSync(join(fromRoot, "config.json"))) {
		return fromRoot;
	}

	// If running from apps/router
	if (existsSync(join(cwd, "config.json"))) {
		return cwd;
	}

	// Default to apps/router from cwd
	return fromRoot;
}

export function getConfigPath(): string {
	return join(getRouterPath(), "config.json");
}

export async function loadConfig(): Promise<Config> {
	const configPath = getConfigPath();

	if (!existsSync(configPath)) {
		const cwd = process.cwd();
		throw new Error(
			`Config file not found at ${configPath}\n\n` +
				`Current directory: ${cwd}\n` +
				`Please run this CLI from either:\n` +
				`  - Project root: /path/to/claude-code-setup\n` +
				`  - CLI directory: /path/to/claude-code-setup/apps/cli`
		);
	}

	const configFile = await Bun.file(configPath).text();
	const configData = JSON.parse(configFile);

	return ConfigSchema.parse(configData);
}

export async function saveConfig(config: Config): Promise<void> {
	const configPath = getConfigPath();
	const configJson = JSON.stringify(config, null, 4);

	await Bun.write(configPath, configJson);
}
