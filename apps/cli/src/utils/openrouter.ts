import type { OpenRouterModel } from "../types/config";
import { getCachedModels, setCachedModels } from "./cache";

const OPENROUTER_API_BASE = "https://openrouter.ai/api/v1";

export async function fetchOpenRouterModels(useCache = true): Promise<OpenRouterModel[]> {
	const apiKey = process.env.OPENROUTER_API_KEY;

	// Try to get from cache first
	if (useCache) {
		const cached = await getCachedModels();
		if (cached) {
			// Cache exists, but warn if API key is missing (for future refreshes)
			if (!apiKey) {
				console.warn(
					"\nWarning: OPENROUTER_API_KEY not found. Using cached models.\n" +
						"Cache will expire in 24 hours. Add API key to refresh models.\n"
				);
			}
			return cached;
		}
	}

	// No cache available, need API key to fetch
	if (!apiKey) {
		const cwd = process.cwd();
		throw new Error(
			`OPENROUTER_API_KEY not found in environment\n\n` +
				`Current directory: ${cwd}\n\n` +
				`Please create a .env file in one of these locations:\n` +
				`  - apps/cli/.env\n` +
				`  - apps/router/.dev.vars\n\n` +
				`Example:\n` +
				`  OPENROUTER_API_KEY=sk-or-v1-your-key-here`
		);
	}

	const response = await fetch(`${OPENROUTER_API_BASE}/models`, {
		headers: {
			Authorization: `Bearer ${apiKey}`,
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch models: ${response.statusText}`);
	}

	const data = (await response.json()) as { data: OpenRouterModel[] };
	const models = data.data;

	// Cache the results
	await setCachedModels(models);

	return models;
}

export function filterAnthropicModels(models: OpenRouterModel[]): OpenRouterModel[] {
	return models.filter((model) => model.id.startsWith("anthropic/"));
}

export function filterOpenAIModels(models: OpenRouterModel[]): OpenRouterModel[] {
	return models.filter((model) => model.id.startsWith("openai/"));
}

export function sortModelsByContextLength(models: OpenRouterModel[]): OpenRouterModel[] {
	return [...models].sort((a, b) => b.context_length - a.context_length);
}

export function formatModelForDisplay(model: OpenRouterModel): string {
	const contextK = Math.floor(model.context_length / 1000);
	return `${model.id} (${contextK}K ctx)`;
}
