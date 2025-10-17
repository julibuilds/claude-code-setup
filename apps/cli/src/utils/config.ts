import { existsSync } from "node:fs";
import { join } from "node:path";
import { type Config, ConfigSchema } from "../types/config";
import { getProjectRoot } from "./project-root";

export function getRouterPath(): string {
	const projectRoot = getProjectRoot();
	return join(projectRoot, "apps", "router");
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
