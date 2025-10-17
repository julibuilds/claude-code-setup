import type { OpenRouterModel } from "../types/config";

export interface ProcessedModel {
  id: string;
  name: string;
  description: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
  costPerMToken: number;
  provider: string;
  isReasoning: boolean;
  isMultimodal: boolean;
}

/**
 * Validates and processes raw OpenRouter model data into a clean, type-safe format
 */
export function processModels(rawModels: unknown[]): ProcessedModel[] {
  if (!Array.isArray(rawModels)) {
    console.warn("processModels: Expected array, got:", typeof rawModels);
    return [];
  }

  return rawModels
    .filter(isValidModel)
    .map(transformModel)
    .filter((model): model is ProcessedModel => model !== null);
}

/**
 * Type guard to validate raw model data
 */
function isValidModel(model: unknown): model is OpenRouterModel {
  if (!model || typeof model !== 'object') return false;
  
  const m = model as Record<string, unknown>;
  
  // Must have an ID
  if (!m.id || typeof m.id !== 'string') return false;
  
  // Must have pricing object
  if (!m.pricing || typeof m.pricing !== 'object') return false;
  
  return true;
}

/**
 * Transform raw model data into processed format
 */
function transformModel(model: OpenRouterModel): ProcessedModel | null {
  try {
    const id = String(model.id);
    const name = String(model.name || id);
    const description = String(model.description || "");
    const context_length = Number(model.context_length) || 0;
    
    const pricing = {
      prompt: String(model.pricing?.prompt || "0"),
      completion: String(model.pricing?.completion || "0"),
    };
    
    const costPerMToken = (
      parseFloat(pricing.prompt) + parseFloat(pricing.completion)
    ) * 1000000;
    
    const provider = id.split("/")[0] || "unknown";
    
    const descriptionLower = description.toLowerCase();
    const isReasoning = 
      id.includes("reasoning") ||
      id.includes("think") ||
      id.includes("o1") ||
      descriptionLower.includes("reasoning");
    
    const isMultimodal = 
      descriptionLower.includes("vision") ||
      descriptionLower.includes("image") ||
      id.includes("vision");
    
    return {
      id,
      name,
      description,
      context_length,
      pricing,
      costPerMToken,
      provider,
      isReasoning,
      isMultimodal,
    };
  } catch (error) {
    console.warn("Failed to process model:", model, error);
    return null;
  }
}

/**
 * Filter models based on criteria
 */
export function filterModels(
  models: ProcessedModel[],
  filter: "all" | "anthropic" | "openai" | "popular" | "reasoning" | "multimodal",
  searchText?: string
): ProcessedModel[] {
  let filtered = models;
  
  // Apply search filter
  if (searchText && searchText.trim()) {
    const search = searchText.toLowerCase();
    filtered = filtered.filter(model => 
      model.name.toLowerCase().includes(search) ||
      model.id.toLowerCase().includes(search) ||
      model.provider.toLowerCase().includes(search) ||
      model.description.toLowerCase().includes(search)
    );
  }
  
  // Apply type filter
  switch (filter) {
    case "anthropic":
      return filtered.filter(model => model.provider === "anthropic");
    case "openai":
      return filtered.filter(model => model.provider === "openai");
    case "popular":
      return filtered.filter(model => 
        ["anthropic", "openai", "google", "meta-llama", "deepseek", "x-ai"].includes(model.provider)
      );
    case "reasoning":
      return filtered.filter(model => model.isReasoning);
    case "multimodal":
      return filtered.filter(model => model.isMultimodal);
    default:
      return filtered;
  }
}

/**
 * Sort models based on criteria
 */
export function sortModels(
  models: ProcessedModel[],
  sortBy: "name" | "context" | "cost" | "provider"
): ProcessedModel[] {
  return [...models].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "context":
        return b.context_length - a.context_length;
      case "cost":
        return a.costPerMToken - b.costPerMToken;
      case "provider":
        return a.provider.localeCompare(b.provider);
      default:
        return 0;
    }
  });
}