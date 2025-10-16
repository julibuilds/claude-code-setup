import { loadEnv } from "./src/utils/env";

console.log("Before loading:");
console.log("OPENROUTER_API_KEY:", process.env.OPENROUTER_API_KEY ? "SET" : "NOT SET");

await loadEnv();

console.log("\nAfter loading:");
console.log("OPENROUTER_API_KEY:", process.env.OPENROUTER_API_KEY ? "SET" : "NOT SET");
if (process.env.OPENROUTER_API_KEY) {
	const key = process.env.OPENROUTER_API_KEY;
	console.log("Key preview:", key.substring(0, 10) + "..." + key.substring(key.length - 4));
}
