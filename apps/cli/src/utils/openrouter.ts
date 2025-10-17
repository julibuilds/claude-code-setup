import type { OpenRouterModel } from "../types/config";
import { getCachedModels, setCachedModels } from "./cache";

const OPENROUTER_API_BASE = "https://openrouter.ai/api/v1";

export interface ModelStats {
  totalModels: number;
  providerCounts: Record<string, number>;
  averageContextLength: number;
  costRange: { min: number; max: number };
}

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

export async function fetchUserFilteredModels(): Promise<OpenRouterModel[]> {
	const apiKey = process.env.OPENROUTER_API_KEY;
	
	if (!apiKey) {
		// Fall back to regular models if no API key
		return fetchOpenRouterModels();
	}

	const response = await fetch(`${OPENROUTER_API_BASE}/models/user`, {
		headers: {
			Authorization: `Bearer ${apiKey}`,
		},
	});

	if (!response.ok) {
		// Fall back to regular models if user endpoint fails
		return fetchOpenRouterModels();
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

export function getModelStats(models: OpenRouterModel[]): ModelStats {
  const providerCounts: Record<string, number> = {};
  let totalContextLength = 0;
  let minCost = Infinity;
  let maxCost = 0;

  models.forEach(model => {
    const provider = model.id.split('/')[0] || 'unknown';
    providerCounts[provider] = (providerCounts[provider] || 0) + 1;
    
    totalContextLength += model.context_length || 0;
    
    const promptCost = parseFloat(model.pricing.prompt || "0");
    const completionCost = parseFloat(model.pricing.completion || "0");
    const cost = promptCost + completionCost;
    
    if (cost > 0) {
      minCost = Math.min(minCost, cost);
      maxCost = Math.max(maxCost, cost);
    }
  });

  return {
    totalModels: models.length,
    providerCounts,
    averageContextLength: models.length > 0 ? Math.round(totalContextLength / models.length) : 0,
    costRange: { min: minCost === Infinity ? 0 : minCost, max: maxCost },
  };
}

export function getRecommendedModels(models: OpenRouterModel[]): {
  reasoning: OpenRouterModel[];
  multimodal: OpenRouterModel[];
  longContext: OpenRouterModel[];
  costEffective: OpenRouterModel[];
} {
  const reasoning = models.filter(m => {
    const description = (m.description || "").toLowerCase();
    return (
      m.id.includes('reasoning') || 
      m.id.includes('think') || 
      m.id.includes('o1') ||
      description.includes('reasoning')
    );
  });

  const multimodal = models.filter(m => {
    const description = (m.description || "").toLowerCase();
    return (
      description.includes('vision') ||
      description.includes('image') ||
      m.id.includes('vision')
    );
  });

  const longContext = models.filter(m => m.context_length >= 100000);

  const costEffective = models
    .map(m => ({
      ...m,
      costPerToken: parseFloat(m.pricing.prompt || "0") + parseFloat(m.pricing.completion || "0")
    }))
    .sort((a, b) => a.costPerToken - b.costPerToken)
    .slice(0, 10);

  return { reasoning, multimodal, longContext, costEffective };
}

export function searchModels(models: OpenRouterModel[], query: string): OpenRouterModel[] {
  const lowerQuery = query.toLowerCase();
  return models.filter(model => {
    const name = (model.name || "").toLowerCase();
    const id = (model.id || "").toLowerCase();
    const description = (model.description || "").toLowerCase();
    const provider = (model.id.split('/')[0] || "").toLowerCase();
    
    return (
      name.includes(lowerQuery) ||
      id.includes(lowerQuery) ||
      description.includes(lowerQuery) ||
      provider.includes(lowerQuery)
    );
  });
}