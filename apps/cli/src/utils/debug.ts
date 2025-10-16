import { existsSync } from "node:fs";
import { getConfigPath, getRouterPath } from "./config";

export function debugPaths(): void {
	console.log("=== Path Debug Info ===");
	console.log("CWD:", process.cwd());
	console.log("Router Path:", getRouterPath());
	console.log("Config Path:", getConfigPath());
	console.log("Config Exists:", existsSync(getConfigPath()));
	console.log("======================");
}
