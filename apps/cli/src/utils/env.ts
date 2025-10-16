import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

function parseEnvFile(content: string): Record<string, string> {
	const env: Record<string, string> = {};
	const lines = content.split("\n");

	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) continue;

		const [key, ...valueParts] = trimmed.split("=");
		if (key && valueParts.length > 0) {
			const value = valueParts.join("=").replace(/^["']|["']$/g, "");
			env[key.trim()] = value;
		}
	}

	return env;
}

function findEnvFiles(): string[] {
	const cwd = process.cwd();
	const possiblePaths: string[] = [];

	// If running from apps/cli
	possiblePaths.push(resolve(cwd, ".env"));
	possiblePaths.push(resolve(cwd, "..", "router", ".dev.vars"));

	// If running from project root
	possiblePaths.push(resolve(cwd, "apps", "cli", ".env"));
	possiblePaths.push(resolve(cwd, "apps", "router", ".dev.vars"));

	// If running from apps/router
	possiblePaths.push(resolve(cwd, ".dev.vars"));
	possiblePaths.push(resolve(cwd, "..", "cli", ".env"));

	return possiblePaths.filter((path) => existsSync(path));
}

export async function loadEnv() {
	const envFiles = findEnvFiles();

	if (envFiles.length === 0) {
		console.error("Warning: No .env files found. Checked:");
		console.error("  - apps/cli/.env");
		console.error("  - apps/router/.dev.vars");
		console.error(`  Current directory: ${process.cwd()}`);
	}

	for (const envPath of envFiles) {
		try {
			const envFile = await Bun.file(envPath).text();
			const parsed = parseEnvFile(envFile);

			// Only set if not already set (first file wins)
			for (const [key, value] of Object.entries(parsed)) {
				if (!process.env[key]) {
					process.env[key] = value;
				}
			}
		} catch (err) {
			// Silently skip files that can't be read
			console.error(`Warning: Could not read ${envPath}`);
		}
	}
}
