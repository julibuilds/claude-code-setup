import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

const CONFIG_DIR = join(homedir(), ".ccr");
const PROJECT_ROOT_FILE = join(CONFIG_DIR, "project-root");

/**
 * Get the project root directory.
 * Priority:
 * 1. Stored project root from global install
 * 2. Search up from current directory
 * 3. Use import.meta.dir (for local development)
 */
export function getProjectRoot(): string {
	// 1. Try stored project root (for global install)
	if (existsSync(PROJECT_ROOT_FILE)) {
		try {
			const storedRoot = readFileSync(PROJECT_ROOT_FILE, "utf-8");
			const root = storedRoot.trim();
			if (root && existsSync(join(root, "apps", "router", "config.json"))) {
				return root;
			}
		} catch (_err) {
			// Ignore and try other methods
		}
	}

	// 2. Search up from current directory
	let searchDir = process.cwd();
	for (let i = 0; i < 10; i++) {
		// Check if this is the project root
		const routerConfig = join(searchDir, "apps", "router", "config.json");
		const packageJson = join(searchDir, "package.json");

		if (existsSync(routerConfig) && existsSync(packageJson)) {
			return searchDir;
		}

		const parent = resolve(searchDir, "..");
		if (parent === searchDir) break; // Reached filesystem root
		searchDir = parent;
	}

	// 3. Use import.meta.dir (for local development)
	try {
		const sourceDir = import.meta.dir;
		if (sourceDir) {
			// This file is at apps/cli/src/utils/project-root.ts
			const srcDir = resolve(sourceDir, ".."); // apps/cli/src
			const cliDir = resolve(srcDir, ".."); // apps/cli
			const appsDir = resolve(cliDir, ".."); // apps
			const projectRoot = resolve(appsDir, ".."); // project root

			if (existsSync(join(projectRoot, "apps", "router", "config.json"))) {
				return projectRoot;
			}
		}
	} catch (_err) {
		// Ignore
	}

	// Fallback: assume we're in the project somewhere
	throw new Error(
		"Could not find project root. Please run 'ccr' from within the project directory,\n" +
			"or run 'bun run link' from apps/cli to configure the global installation."
	);
}

/**
 * Store the project root for global installations.
 * Called during 'bun run link' setup.
 */
export async function storeProjectRoot(root: string): Promise<void> {
	// Create config directory if it doesn't exist
	try {
		if (!existsSync(CONFIG_DIR)) {
			await Bun.$`mkdir -p ${CONFIG_DIR}`;
		}
	} catch (_err) {
		// Directory might already exist, ignore
	}

	await Bun.write(PROJECT_ROOT_FILE, root);
}

/**
 * Get the stored project root path (if any)
 */
export function getStoredProjectRoot(): string | null {
	if (existsSync(PROJECT_ROOT_FILE)) {
		try {
			const content = readFileSync(PROJECT_ROOT_FILE, "utf-8");
			return content.trim();
		} catch (_err) {
			return null;
		}
	}
	return null;
}
