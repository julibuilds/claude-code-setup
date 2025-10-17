import { existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import type { OpenRouterModel } from "../types/config";

interface CacheData {
	timestamp: number;
	models: OpenRouterModel[];
}

function getCachePath(): string {
	const cwd = process.cwd();

	// Try multiple possible locations
	const possiblePaths = [
		resolve(cwd, ".cache", "openrouter-models.json"), // From apps/cli
		resolve(cwd, "apps", "cli", ".cache", "openrouter-models.json"), // From root
	];

	// Return the first path that exists or the first one if none exist
	for (const path of possiblePaths) {
		const dir = join(path, "..");
		if (existsSync(dir)) {
			return path;
		}
	}

	// Default to apps/cli/.cache (first path)
	return possiblePaths[0] || resolve(cwd, ".cache", "openrouter-models.json");
}

export async function getCachedModels(): Promise<OpenRouterModel[] | null> {
	try {
		const cachePath = getCachePath();

		if (!existsSync(cachePath)) {
			return null;
		}

		const cacheFile = await Bun.file(cachePath).text();
		const cache: CacheData = JSON.parse(cacheFile);

		// Cache is valid for 24 hours
		const cacheAge = Date.now() - cache.timestamp;
		const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

		if (cacheAge > maxAge) {
			return null;
		}

		return cache.models;
	} catch (_err) {
		// If cache is corrupted or can't be read, return null
		return null;
	}
}

export async function setCachedModels(models: OpenRouterModel[]): Promise<void> {
	try {
		const cachePath = getCachePath();
		const cacheDir = join(cachePath, "..");

		// Create cache directory if it doesn't exist
		if (!existsSync(cacheDir)) {
			mkdirSync(cacheDir, { recursive: true });
		}

		const cache: CacheData = {
			timestamp: Date.now(),
			models,
		};

		await Bun.write(cachePath, JSON.stringify(cache, null, 2));
	} catch (_err) {
		// Silently fail if we can't write cache
	}
}

export async function clearCache(): Promise<void> {
	try {
		const cachePath = getCachePath();
		if (existsSync(cachePath)) {
			await Bun.write(cachePath, "");
		}
	} catch (_err) {
		// Silently fail
	}
}
