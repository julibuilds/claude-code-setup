/**
 * Transformer interface for request/response transformations
 */

import type { ClaudeRequest, ClaudeResponse } from "./api";
import type { AppConfig, ProviderConfig } from "./config";

/**
 * Context provided to transformers
 */
export interface TransformerContext {
	config: AppConfig;
	provider: ProviderConfig;
	model: string;
	options?: Record<string, any>;
}

/**
 * Transformer interface for converting between API formats
 */
export interface Transformer {
	/**
	 * Unique name for the transformer
	 */
	name: string;

	/**
	 * Transform request before sending to provider
	 * @param request - Claude API format request
	 * @param context - Transformer context with config and provider info
	 * @returns Transformed request in provider's expected format
	 */
	transformRequest?(request: ClaudeRequest, context: TransformerContext): Promise<any> | any;

	/**
	 * Transform response before returning to client
	 * @param response - Provider's response format
	 * @param context - Transformer context with config and provider info
	 * @returns Transformed response in Claude API format
	 */
	transformResponse?(
		response: any,
		context: TransformerContext
	): Promise<ClaudeResponse> | ClaudeResponse;

	/**
	 * Transform streaming response chunks
	 * @param chunk - Provider's streaming chunk format
	 * @param context - Transformer context with config and provider info
	 * @returns Transformed chunk in Claude API streaming format (SSE)
	 */
	transformStreamChunk?(chunk: any, context: TransformerContext): Promise<string> | string;
}
