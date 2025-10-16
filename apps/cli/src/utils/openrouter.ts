import type { OpenRouterModel } from "../types/config";

const OPENROUTER_API_BASE = "https://openrouter.ai/api/v1";

export async function fetchOpenRouterModels(): Promise<OpenRouterModel[]> {
	const apiKey = process.env.OPENROUTER_API_KEY;

	if (!apiKey) {
		throw new Error("OPENROUTER_API_KEY not found in environment");
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
	return data.data;
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
