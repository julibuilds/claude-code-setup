import { existsSync } from "node:fs";
import { join } from "node:path";
import { type Config, ConfigSchema } from "../types/config";

export function getRouterPath(): string {
	// Get the router directory path
	const cliDir = join(import.meta.dir, "..", "..");
	return join(cliDir, "..", "router");
}

export function getConfigPath(): string {
	return join(getRouterPath(), "config.json");
}

export async function loadConfig(): Promise<Config> {
	const configPath = getConfigPath();

	if (!existsSync(configPath)) {
		throw new Error(`Config file not found at ${configPath}`);
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
