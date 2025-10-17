import { existsSync } from "node:fs";
import { join } from "node:path";
import { getRouterPath } from "./config";

export interface SyncResult {
	success: boolean;
	filesChecked: string[];
	filesUpdated: string[];
	errors: string[];
}

/**
 * Verifies that local configuration files are in sync after deployment
 * This doesn't modify files, just reports on their status
 */
export async function verifyLocalFiles(): Promise<SyncResult> {
	const routerPath = getRouterPath();
	const result: SyncResult = {
		success: true,
		filesChecked: [],
		filesUpdated: [],
		errors: [],
	};

	// Check config.json
	const configPath = join(routerPath, "config.json");
	result.filesChecked.push("config.json");
	if (!existsSync(configPath)) {
		result.errors.push("config.json not found");
		result.success = false;
	}

	// Check .dev.vars
	const devVarsPath = join(routerPath, ".dev.vars");
	result.filesChecked.push(".dev.vars");
	if (!existsSync(devVarsPath)) {
		result.errors.push(".dev.vars not found (optional for local development)");
	}

	// Check wrangler.toml
	const wranglerPath = join(routerPath, "wrangler.toml");
	result.filesChecked.push("wrangler.toml");
	if (!existsSync(wranglerPath)) {
		result.errors.push("wrangler.toml not found");
		result.success = false;
	}

	return result;
}

/**
 * Creates a backup of a file before modification
 */
export async function backupFile(filePath: string): Promise<void> {
	if (!existsSync(filePath)) {
		return;
	}

	const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
	const backupPath = `${filePath}.backup-${timestamp}`;

	const content = await Bun.file(filePath).text();
	await Bun.write(backupPath, content);
}

/**
 * Adds a comment to .dev.vars indicating when it was last synced
 */
export async function addSyncTimestamp(routerPath: string): Promise<void> {
	const devVarsPath = join(routerPath, ".dev.vars");

	if (!existsSync(devVarsPath)) {
		return;
	}

	const content = await Bun.file(devVarsPath).text();
	const lines = content.split("\n");

	// Remove old sync timestamp comments
	const filteredLines = lines.filter((line) => !line.includes("# Last synced:"));

	// Add new timestamp
	const timestamp = new Date().toISOString();
	filteredLines.unshift(`# Last synced: ${timestamp}`);

	await Bun.write(devVarsPath, filteredLines.join("\n"));
}
