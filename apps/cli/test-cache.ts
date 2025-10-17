import type { OpenRouterModel } from "./src/types/config";
import { getCachedModels, setCachedModels } from "./src/utils/cache";

console.log("=== Cache Test ===\n");

// Test 1: Check if cache exists
console.log("1. Checking for existing cache...");
const cached = await getCachedModels();
if (cached) {
	console.log(`   ✓ Found cached models: ${cached.length} models`);
	const age = Date.now() - (cached as any).timestamp;
	const hours = Math.floor(age / (1000 * 60 * 60));
	console.log(`   Cache age: ${hours} hours`);
} else {
	console.log("   ✗ No cache found");
}

// Test 2: Create a test cache
console.log("\n2. Creating test cache...");
const testModels: OpenRouterModel[] = [
	{
		id: "test/model-1",
		name: "Test Model 1",
		context_length: 100000,
		pricing: { prompt: "0.001", completion: "0.002" },
	},
	{
		id: "test/model-2",
		name: "Test Model 2",
		context_length: 200000,
		pricing: { prompt: "0.002", completion: "0.004" },
	},
];

await setCachedModels(testModels);
console.log("   ✓ Test cache created");

// Test 3: Read back the cache
console.log("\n3. Reading cache back...");
const readBack = await getCachedModels();
if (readBack && readBack.length === 2) {
	console.log(`   ✓ Successfully read ${readBack.length} models`);
	console.log(`   Models: ${readBack.map((m) => m.id).join(", ")}`);
} else {
	console.log("   ✗ Failed to read cache");
}

console.log("\n=== Test Complete ===");
