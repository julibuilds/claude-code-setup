import { z } from "zod";

export const ProviderSchema = z.object({
	name: z.string(),
	api_base_url: z.string(),
	api_key: z.string(),
	models: z.array(z.string()),
	transformer: z.object({
		use: z.array(z.string()),
	}),
});

export const RouterSchema = z.object({
	default: z.string(),
	background: z.string(),
	think: z.string(),
	longContext: z.string(),
	longContextThreshold: z.number(),
});

export const ConfigSchema = z.object({
	APIKEY: z.string(),
	HOST: z.string(),
	PORT: z.number(),
	LOG: z.boolean(),
	LOG_LEVEL: z.string(),
	API_TIMEOUT_MS: z.number(),
	Providers: z.array(ProviderSchema),
	Router: RouterSchema,
});

export type Provider = z.infer<typeof ProviderSchema>;
export type Router = z.infer<typeof RouterSchema>;
export type Config = z.infer<typeof ConfigSchema>;

export interface OpenRouterModel {
	id: string;
	name: string;
	description?: string;
	context_length: number;
	pricing: {
		prompt: string;
		completion: string;
		request?: string;
		image?: string;
		web_search?: string;
		internal_reasoning?: string;
		input_cache_read?: string;
		input_cache_write?: string;
	};
	top_provider?: {
		context_length: number;
		max_completion_tokens: number;
		is_moderated?: boolean;
	};
	architecture?: {
		tokenizer?: string;
		instruct_type?: string;
		input_modalities?: string[];
		output_modalities?: string[];
	};
	supported_parameters?: string[];
	created?: number;
}
