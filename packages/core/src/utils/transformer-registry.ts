/**
 * Transformer Registry
 * Manages loading and instantiation of transformers
 */

import { DeepSeekTransformer } from "../transformers/deepseek";
import { GeminiTransformer } from "../transformers/gemini";
import { OpenRouterTransformer } from "../transformers/openrouter";
import type { AppConfig, ProviderConfig } from "../types/config";
import type { Transformer } from "../types/transformer";

/**
 * Registry for managing transformer instances
 */
export class TransformerRegistry {
	private config: AppConfig;
	private builtInTransformers: Map<string, Transformer>;
	private customTransformers: Map<string, Transformer>;

	constructor(config: AppConfig) {
		this.config = config;
		this.builtInTransformers = new Map();
		this.customTransformers = new Map();

		// Register built-in transformers
		this.registerBuiltInTransformers();

		// Load custom transformers from config
		this.loadCustomTransformers();
	}

	/**
	 * Register built-in transformers
	 */
	private registerBuiltInTransformers(): void {
		const builtIn = [
			new OpenRouterTransformer(),
			new DeepSeekTransformer(),
			new GeminiTransformer(),
		];

		for (const transformer of builtIn) {
			this.builtInTransformers.set(transformer.name, transformer);
		}
	}

	/**
	 * Load custom transformers from configuration
	 */
	private loadCustomTransformers(): void {
		if (!this.config.transformers) return;

		for (const transformerConfig of this.config.transformers) {
			try {
				// Dynamic import of custom transformer
				// Note: This will work in Node.js/Bun environments
				// For Cloudflare Workers, custom transformers would need to be bundled
				const transformerModule = require(transformerConfig.path);
				const TransformerClass =
					transformerModule.default || transformerModule[Object.keys(transformerModule)[0]];

				if (TransformerClass) {
					const instance = new TransformerClass(transformerConfig.options);
					if (this.isValidTransformer(instance)) {
						this.customTransformers.set(instance.name, instance);
					}
				}
			} catch (error) {
				console.error(`Failed to load custom transformer from ${transformerConfig.path}:`, error);
			}
		}
	}

	/**
	 * Validate that an object implements the Transformer interface
	 */
	private isValidTransformer(obj: any): obj is Transformer {
		return (
			obj &&
			typeof obj.name === "string" &&
			(typeof obj.transformRequest === "function" ||
				typeof obj.transformResponse === "function" ||
				typeof obj.transformStreamChunk === "function")
		);
	}

	/**
	 * Get a transformer by name
	 */
	getTransformer(name: string): Transformer | undefined {
		// Check custom transformers first (they can override built-in ones)
		return this.customTransformers.get(name) || this.builtInTransformers.get(name);
	}

	/**
	 * Get transformers for a specific provider and model
	 * Returns an array of transformers to apply in order
	 */
	getTransformers(provider: ProviderConfig, model: string): Transformer[] {
		const transformers: Transformer[] = [];

		if (!provider.transformer) {
			return transformers;
		}

		// Check for model-specific transformer configuration
		const modelConfig = provider.transformer[model];
		if (modelConfig && modelConfig.use) {
			return this.resolveTransformerList(modelConfig.use);
		}

		// Use default transformer configuration
		if (provider.transformer.use) {
			return this.resolveTransformerList(provider.transformer.use);
		}

		return transformers;
	}

	/**
	 * Resolve a list of transformer specifications to transformer instances
	 */
	private resolveTransformerList(
		transformerSpecs: Array<string | [string, Record<string, any>]>
	): Transformer[] {
		const transformers: Transformer[] = [];

		for (const spec of transformerSpecs) {
			let name: string;
			let options: Record<string, any> | undefined;

			if (typeof spec === "string") {
				name = spec;
			} else {
				[name, options] = spec;
			}

			const transformer = this.getTransformer(name);
			if (transformer) {
				// If options are provided, we could create a wrapper that passes them
				// For now, we'll just use the transformer as-is
				transformers.push(transformer);
			} else {
				console.warn(`Transformer "${name}" not found in registry`);
			}
		}

		return transformers;
	}

	/**
	 * Register a custom transformer instance
	 */
	registerTransformer(transformer: Transformer): void {
		if (this.isValidTransformer(transformer)) {
			this.customTransformers.set(transformer.name, transformer);
		} else {
			throw new Error("Invalid transformer: must implement Transformer interface");
		}
	}

	/**
	 * List all available transformer names
	 */
	listTransformers(): string[] {
		const names = new Set<string>();

		for (const name of this.builtInTransformers.keys()) {
			names.add(name);
		}

		for (const name of this.customTransformers.keys()) {
			names.add(name);
		}

		return Array.from(names).sort();
	}

	/**
	 * Check if a transformer exists
	 */
	hasTransformer(name: string): boolean {
		return this.builtInTransformers.has(name) || this.customTransformers.has(name);
	}
}
