import { execa } from "execa";
import { getRouterPath } from "./config";

export interface SecretResult {
	success: boolean;
	error?: string;
}

export async function setWorkerSecret(key: string, value: string): Promise<SecretResult> {
	try {
		const routerPath = getRouterPath();

		// Use wrangler to set the secret
		await execa("bunx", ["wrangler", "secret", "put", key], {
			cwd: routerPath,
			input: value,
		});

		return { success: true };
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
