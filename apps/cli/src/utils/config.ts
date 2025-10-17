import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { type Config, ConfigSchema } from "../types/config";

export function getRouterPath(): string {
	// Try multiple possible locations for the router directory
	const cwd = process.cwd();

	// For compiled binaries, use import.meta.dir to find the source location
	// import.meta.dir points to the directory containing this source file
	// This file is at apps/cli/src/utils/config.ts
	try {
		const sourceDir = import.meta.dir;
		if (sourceDir) {
			// Go up from apps/cli/src/utils to apps/cli/src
			const srcDir = resolve(sourceDir, "..");
			// Go up from apps/cli/src to apps/cli
			const cliDir = resolve(srcDir, "..");
			// Go up from apps/cli to apps
			const appsDir = resolve(cliDir, "..");
			// Get router path from apps
			const routerFromSource = resolve(appsDir, "router");

			if (existsSync(join(routerFromSource, "config.json"))) {
				return routerFromSource;
			}
		}
	} catch (_err) {
		// Ignore errors finding source path
	}

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

	// Search up directory tree from current directory
	let searchDir = cwd;
	for (let i = 0; i < 5; i++) {
		const routerPath = resolve(searchDir, "apps", "router");
		if (existsSync(join(routerPath, "config.json"))) {
			return routerPath;
		}

		const parent = resolve(searchDir, "..");
		if (parent === searchDir) break; // Reached root
		searchDir = parent;
	}

	// Default to apps/router from cwd (will fail later with helpful error)
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
