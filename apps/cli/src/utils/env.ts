import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { getProjectRoot } from "./project-root";

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
	const possiblePaths: string[] = [];

	try {
		const projectRoot = getProjectRoot();

		const envFromProject = resolve(projectRoot, "apps", "cli", ".env");
		const varsFromProject = resolve(projectRoot, "apps", "router", ".dev.vars");

		if (existsSync(envFromProject)) {
			possiblePaths.push(envFromProject);
		}
		if (existsSync(varsFromProject)) {
			possiblePaths.push(varsFromProject);
		}
	} catch (_err) {
		// Can't find project root - will be handled by components that need it
		// Don't try to load from current directory as it's likely wrong
	}

	// Remove duplicates
	return [...new Set(possiblePaths)].filter((path) => existsSync(path));
}

export async function loadEnv() {
	const envFiles = findEnvFiles();

	// Silently load env files if found
	// If not found, components will handle the error when they need the API key
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
		} catch (_err) {
			// Silently skip files that can't be read
		}
	}
}
