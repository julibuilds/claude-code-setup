/**
 * Browser/Workers-compatible token counting utility
 * Uses simple estimation to avoid WASM dependencies
 */

import type { ClaudeMessage, SystemBlock, Tool } from "../types/api.js";

/**
 * Estimate token count using a simple heuristic
 * Roughly 4 characters per token for English text
 * This is less accurate than tiktoken but works reliably in all environments
 */
function countTokens(text: string): number {
	return Math.ceil(text.length / 4);
}

/**
 * Calculate the token count for a Claude API request
 * Uses tiktoken/lite for accurate counting in browser/Workers environments
 *
 * @param messages - Array of messages in the conversation
 * @param system - Optional system prompt (string or array of system blocks)
 * @param tools - Optional array of tool definitions
 * @returns Total token count
 *
 * @example
 * ```typescript
 * const tokenCount = calculateTokenCount(
 *   [{ role: "user", content: "Hello!" }],
 *   "You are a helpful assistant",
 *   []
 * );
 * ```
 */
export function calculateTokenCount(
	messages: ClaudeMessage[],
	system?: string | SystemBlock[],
	tools?: Tool[]
): number {
	let tokenCount = 0;

	// Count message tokens
	for (const message of messages) {
		if (typeof message.content === "string") {
			tokenCount += countTokens(message.content);
		} else if (Array.isArray(message.content)) {
			for (const block of message.content) {
				if (block.type === "text" && block.text) {
					tokenCount += countTokens(block.text);
				} else if (block.type === "tool_use" && block.input) {
					tokenCount += countTokens(JSON.stringify(block.input));
				} else if (block.type === "tool_result" && block.content) {
					const content =
						typeof block.content === "string" ? block.content : JSON.stringify(block.content);
					tokenCount += countTokens(content);
				}
			}
		}
	}

	// Count system tokens
	if (typeof system === "string") {
		tokenCount += countTokens(system);
	} else if (Array.isArray(system)) {
		for (const block of system) {
			if (block.type === "text" && block.text) {
				tokenCount += countTokens(block.text);
			}
		}
	}

	// Count tool tokens
	if (tools) {
		for (const tool of tools) {
			tokenCount += countTokens(tool.name + (tool.description || ""));
			if (tool.input_schema) {
				tokenCount += countTokens(JSON.stringify(tool.input_schema));
			}
		}
	}

	return tokenCount;
}

/**
 * No-op for browser compatibility
 * The browser version doesn't need cleanup
 */
export function freeTokenCounter(): void {
	// No resources to free in browser version
}
