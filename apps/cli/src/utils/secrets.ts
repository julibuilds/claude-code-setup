import { $ } from "zx";
import { getRouterPath } from "./config";

export interface SecretResult {
	success: boolean;
	error?: string;
}

export async function setWorkerSecret(key: string, value: string): Promise<SecretResult> {
	try {
		const routerPath = getRouterPath();

		// Use wrangler to set the secret
		await $`cd ${routerPath} && echo ${value} | bunx wrangler secret put ${key}`.quiet();

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

		const result = await $`cd ${routerPath} && bunx wrangler secret list`.quiet();

		const output = result.stdout.toString();
		const lines = output.split("\n").filter((line) => line.trim());

		return lines;
	} catch (err) {
		throw new Error(err instanceof Error ? err.message : "Failed to list secrets");
	}
}
