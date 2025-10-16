/**
 * API types for Claude Code Router
 * Based on Claude API format
 */

/**
 * Image source for image content blocks
 */
export interface ImageSource {
	type: "base64" | "url";
	media_type: string;
	data?: string;
	url?: string;
}

/**
 * Content block in a message
 */
export interface ContentBlock {
	type: "text" | "tool_use" | "tool_result" | "image";
	text?: string;
	id?: string;
	name?: string;
	input?: Record<string, any>;
	tool_use_id?: string;
	content?: string | any[];
	source?: ImageSource;
}

/**
 * Message in a conversation
 */
export interface ClaudeMessage {
	role: "user" | "assistant";
	content: string | ContentBlock[];
}

/**
 * System prompt block
 */
export interface SystemBlock {
	type: "text";
	text: string;
	cache_control?: { type: "ephemeral" };
}

/**
 * Tool definition
 */
export interface Tool {
	name: string;
	description: string;
	input_schema: Record<string, any>;
}

/**
 * Tool choice configuration
 */
export interface ToolChoice {
	type: "auto" | "any" | "tool";
	name?: string;
}

/**
 * Token usage information
 */
export interface Usage {
	input_tokens: number;
	output_tokens: number;
}

/**
 * Claude API request
 */
export interface ClaudeRequest {
	model: string;
	messages: ClaudeMessage[];
	max_tokens?: number;
	temperature?: number;
	top_p?: number;
	top_k?: number;
	system?: string | SystemBlock[];
	tools?: Tool[];
	tool_choice?: ToolChoice;
	stream?: boolean;
	metadata?: Record<string, any>;
	thinking?: boolean;
}

/**
 * Claude API response
 */
export interface ClaudeResponse {
	id: string;
	type: "message";
	role: "assistant";
	content: ContentBlock[];
	model: string;
	stop_reason: string | null;
	stop_sequence: string | null;
	usage: Usage;
}

/**
 * Streaming event types
 */
export type StreamEvent =
	| { type: "message_start"; message: Partial<ClaudeResponse> }
	| { type: "content_block_start"; index: number; content_block: ContentBlock }
	| { type: "content_block_delta"; index: number; delta: { type: string; text?: string } }
	| { type: "content_block_stop"; index: number }
	| {
			type: "message_delta";
			delta: { stop_reason?: string; stop_sequence?: string };
			usage?: Partial<Usage>;
	  }
	| { type: "message_stop" }
	| { type: "ping" }
	| { type: "error"; error: { type: string; message: string } };
