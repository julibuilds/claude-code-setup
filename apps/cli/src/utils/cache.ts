import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import type { OpenRouterModel } from "../types/config";
import { getProjectRoot } from "./project-root";

interface CacheData {
	timestamp: number;
	models: OpenRouterModel[];
}

function getCachePath(): string {
	try {
		const projectRoot = getProjectRoot();
		return join(projectRoot, "apps", "cli", ".cache", "openrouter-models.json");
	} catch (_err) {
		// Fallback to current directory if project root not found
		return join(process.cwd(), ".cache", "openrouter-models.json");
	}
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
