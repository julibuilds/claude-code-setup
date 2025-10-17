import { execa } from "execa";
import { getRouterPath } from "./config";

export interface DeployResult {
	success: boolean;
	error?: string;
}

export async function deployToWorkers(onOutput?: (line: string) => void): Promise<DeployResult> {
	try {
		const routerPath = getRouterPath();

		onOutput?.("Deploying to Cloudflare Workers...");
		onOutput?.(`Router path: ${routerPath}`);
		onOutput?.("");

		const args = ["wrangler", "deploy"];

		onOutput?.(`Running: bunx ${args.join(" ")}`);
		onOutput?.("");

		const result = await execa("bunx", args, {
			cwd: routerPath,
			all: true,
			stdio: "pipe",
		});

		const output = result.all || result.stdout;
		const lines = output.split("\n");

		for (const line of lines) {
			if (line.trim()) {
				onOutput?.(line);
			}
		}

		return { success: true };
	} catch (err: unknown) {
		const error = err as { message?: string; stderr?: string; stdout?: string };
		const errorMessage = error.stderr || error.stdout || error.message || "Deployment failed";

		return {
			success: false,
			error: errorMessage,
		};
	}
}

export async function getDeploymentStatus(): Promise<string> {
	try {
		const routerPath = getRouterPath();

		const result = await execa("bunx", ["wrangler", "deployments", "list"], {
			cwd: routerPath,
		});

		return result.stdout;
	} catch (err) {
		throw new Error(err instanceof Error ? err.message : "Failed to get status");
	}
}
