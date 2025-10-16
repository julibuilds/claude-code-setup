/**
 * Configuration types for the Claude Code Router
 */

/**
 * Transformer configuration for a provider or model
 */
export interface TransformerConfig {
	use: Array<string | [string, Record<string, any>]>;
	[modelName: string]: any;
}

/**
 * Provider configuration
 */
export interface ProviderConfig {
	name: string;
	api_base_url: string;
	api_key: string;
	models: string[];
	transformer?: TransformerConfig;
}

/**
 * Router configuration for request routing
 */
export interface RouterConfig {
	default: string;
	background?: string;
	think?: string;
	longContext?: string;
	longContextThreshold?: number;
	webSearch?: string;
	image?: string;
}

/**
 * Application configuration
 */
export interface AppConfig {
	APIKEY?: string;
	HOST?: string;
	PORT?: number;
	PROXY_URL?: string;
	LOG?: boolean;
	LOG_LEVEL?: "fatal" | "error" | "warn" | "info" | "debug" | "trace";
	API_TIMEOUT_MS?: number;
	NON_INTERACTIVE_MODE?: boolean;
	CUSTOM_ROUTER_PATH?: string;
	Providers: ProviderConfig[];
	Router: RouterConfig;
	transformers?: Array<{
		path: string;
		options?: Record<string, any>;
	}>;
}
