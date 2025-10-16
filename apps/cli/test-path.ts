import { existsSync } from "node:fs";
import { getConfigPath, getRouterPath } from "./src/utils/config";

console.log("Current working directory:", process.cwd());
console.log("Router path:", getRouterPath());
console.log("Config path:", getConfigPath());
console.log("Config exists:", existsSync(getConfigPath()));
