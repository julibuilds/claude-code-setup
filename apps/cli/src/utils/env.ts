import { existsSync } from "node:fs";
import { join } from "node:path";

export async function loadEnv() {
	// Try to load .env from CLI directory
	const cliDir = join(import.meta.dir, "..", "..");
	const envPath = join(cliDir, ".env");

	if (existsSync(envPath)) {
		const envFile = await Bun.file(envPath).text();
		const lines = envFile.split("\n");

		for (const line of lines) {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith("#")) continue;

			const [key, ...valueParts] = trimmed.split("=");
			if (key && valueParts.length > 0) {
				const value = valueParts.join("=").replace(/^["']|["']$/g, "");
				process.env[key.trim()] = value;
			}
		}
	}

	// Also try router directory
	const routerEnvPath = join(cliDir, "..", "router", ".dev.vars");
	if (existsSync(routerEnvPath)) {
		const envFile = await Bun.file(routerEnvPath).text();
		const lines = envFile.split("\n");

		for (const line of lines) {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith("#")) continue;

			const [key, ...valueParts] = trimmed.split("=");
			if (key && valueParts.length > 0) {
				const value = valueParts.join("=").replace(/^["']|["']$/g, "");
				if (!process.env[key.trim()]) {
					process.env[key.trim()] = value;
				}
			}
		}
	}
}
