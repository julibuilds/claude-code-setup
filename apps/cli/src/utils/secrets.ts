import { existsSync } from "node:fs";
import { join } from "node:path";
import { execa } from "execa";
import { getRouterPath } from "./config";

export interface SecretResult {
	success: boolean;
	error?: string;
	localFileUpdated?: boolean;
}

/**
 * Updates or adds a key-value pair in .dev.vars file
 */
async function updateDevVars(routerPath: string, key: string, value: string): Promise<void> {
	const devVarsPath = join(routerPath, ".dev.vars");

	let content = "";
	if (existsSync(devVarsPath)) {
		content = await Bun.file(devVarsPath).text();
	}

	const lines = content.split("\n");
	let keyFound = false;

	// Update existing key or add new one
	const updatedLines = lines.map((line) => {
		const trimmed = line.trim();
		if (trimmed.startsWith(`${key}=`) || trimmed.startsWith(`${key} =`)) {
			keyFound = true;
			return `${key}=${value}`;
		}
		return line;
	});

	// If key wasn't found, add it
	if (!keyFound) {
		// Add a newline if file doesn't end with one
		if (updatedLines.length > 0 && updatedLines[updatedLines.length - 1] !== "") {
			updatedLines.push("");
		}
		updatedLines.push(`${key}=${value}`);
	}

	await Bun.write(devVarsPath, updatedLines.join("\n"));
}

export async function setWorkerSecret(key: string, value: string): Promise<SecretResult> {
	try {
		const routerPath = getRouterPath();

		// 1. Set the secret in Cloudflare Workers
		await execa("bunx", ["wrangler", "secret", "put", key], {
			cwd: routerPath,
			input: value,
		});

		// 2. Update local .dev.vars file for development
		try {
			await updateDevVars(routerPath, key, value);
			return { success: true, localFileUpdated: true };
		} catch (localErr) {
			// Secret was set in Workers but local file update failed
			return {
				success: true,
				localFileUpdated: false,
				error: `Secret set in Workers, but failed to update .dev.vars: ${localErr instanceof Error ? localErr.message : "Unknown error"}`,
			};
		}
	} catch (err) {
		return {
			success: false,
			error: err instanceof Error ? err.message : "Failed to set secret",
		};
	}
}

export async function listWorkerSecrets(): Promise<string[]> {
	try {
		const routerPath = getRouterPath();

		const result = await execa("bunx", ["wrangler", "secret", "list"], {
			cwd: routerPath,
		});

		const output = result.stdout;
		const lines = output.split("\n").filter((line) => line.trim());

		return lines;
	} catch (err) {
		throw new Error(err instanceof Error ? err.message : "Failed to list secrets");
	}
}
