#!/usr/bin/env bun
import { resolve } from "node:path";
import { storeProjectRoot } from "../src/utils/project-root";

// This script runs after 'bun link' to store the project root
const cliDir = import.meta.dir; // scripts directory
const projectRoot = resolve(cliDir, "..", "..", ".."); // Go up to project root

console.log("📍 Storing project root for global CLI access...");
console.log(`   Project root: ${projectRoot}`);

await storeProjectRoot(projectRoot);

console.log("✅ Project root stored successfully!");
console.log("   You can now run 'ccr' from any directory.");
