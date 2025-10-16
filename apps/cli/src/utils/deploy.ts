import { $ } from "zx";
import { getRouterPath } from "./config";

export interface DeployResult {
	success: boolean;
	error?: string;
}

export async function deployToWorkers(
	env: "production" | "staging",
	onOutput?: (line: string) => void
): Promise<DeployResult> {
	try {
		const routerPath = getRouterPath();

		// Change to router directory and deploy
		const command =
			env === "production"
				? "bunx wrangler deploy --env production"
				: "bunx wrangler deploy --env staging";

		onOutput?.(`Running: ${command}`);
		onOutput?.("");

		const result = await $`cd ${routerPath} && ${command}`.quiet();

		const output = result.stdout.toString();
		const lines = output.split("\n");

		for (const line of lines) {
			if (line.trim()) {
				onOutput?.(line);
			}
		}

		return { success: true };
	} catch (err) {
		return {
			success: false,
			error: err instanceof Error ? err.message : "Deployment failed",
		};
	}
}

export async function getDeploymentStatus(): Promise<string> {
	try {
		const routerPath = getRouterPath();

		const result = await $`cd ${routerPath} && bunx wrangler deployments list`.quiet();

		return result.stdout.toString();
	} catch (err) {
		throw new Error(err instanceof Error ? err.message : "Failed to get status");
	}
}
