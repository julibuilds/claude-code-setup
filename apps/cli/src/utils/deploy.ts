import { execa } from "execa";
import { getRouterPath, loadConfig } from "./config";
import { verifyLocalFiles } from "./sync";
import { setWorkerSecret } from "./secrets";

export interface DeployResult {
  success: boolean;
  error?: string;
  filesVerified?: boolean;
  verificationWarnings?: string[];
}

export async function deployToWorkers(
  onOutput?: (line: string) => void
): Promise<DeployResult> {
  try {
    const routerPath = getRouterPath();

    onOutput?.("Deploying to Cloudflare Workers...");
    onOutput?.(`Router path: ${routerPath}`);
    onOutput?.("");

    // Verify local files before deployment
    onOutput?.("Verifying local configuration files...");
    const verification = await verifyLocalFiles();

    if (!verification.success) {
      onOutput?.("⚠ Warning: Some configuration files are missing:");
      for (const error of verification.errors) {
        onOutput?.(`  - ${error}`);
      }
      onOutput?.("");
    } else {
      onOutput?.("✓ Local configuration files verified");
      onOutput?.("");
    }

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

    // Post-deployment: Sync CONFIG_JSON secret
    onOutput?.("");
    onOutput?.("Syncing CONFIG_JSON secret to Workers...");

    try {
      const config = await loadConfig();
      const configJson = JSON.stringify(config);
      const secretResult = await setWorkerSecret("CONFIG_JSON", configJson);

      if (secretResult.success) {
        onOutput?.("✓ CONFIG_JSON secret updated");
      } else {
        onOutput?.(
          `⚠ Warning: Failed to update CONFIG_JSON secret: ${secretResult.error}`
        );
      }
    } catch (secretErr) {
      onOutput?.(
        `⚠ Warning: Failed to sync CONFIG_JSON: ${
          secretErr instanceof Error ? secretErr.message : "Unknown error"
        }`
      );
    }

    // Post-deployment verification
    onOutput?.("");
    onOutput?.("Verifying deployment configuration...");
    const postVerification = await verifyLocalFiles();

    return {
      success: true,
      filesVerified: postVerification.success,
      verificationWarnings:
        postVerification.errors.length > 0
          ? postVerification.errors
          : undefined,
    };
  } catch (err: unknown) {
    const error = err as { message?: string; stderr?: string; stdout?: string };
    const errorMessage =
      error.stderr || error.stdout || error.message || "Deployment failed";

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
    throw new Error(
      err instanceof Error ? err.message : "Failed to get status"
    );
  }
}
