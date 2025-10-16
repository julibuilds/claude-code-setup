/**
 * Token counting utility using tiktoken
 */

import { get_encoding } from "tiktoken";
import type { ClaudeMessage, SystemBlock, Tool } from "../types/api.js";

// Initialize the encoding once for reuse
const enc = get_encoding("cl100k_base");

/**
 * Calculate the total token count for a Claude API request
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
			tokenCount += enc.encode(message.content).length;
		} else if (Array.isArray(message.content)) {
			for (const block of message.content) {
				if (block.type === "text" && block.text) {
					tokenCount += enc.encode(block.text).length;
				} else if (block.type === "tool_use" && block.input) {
					tokenCount += enc.encode(JSON.stringify(block.input)).length;
				} else if (block.type === "tool_result" && block.content) {
					const content =
						typeof block.content === "string" ? block.content : JSON.stringify(block.content);
					tokenCount += enc.encode(content).length;
				}
			}
		}
	}

	// Count system tokens
	if (typeof system === "string") {
		tokenCount += enc.encode(system).length;
	} else if (Array.isArray(system)) {
		for (const block of system) {
			if (block.type === "text" && block.text) {
				tokenCount += enc.encode(block.text).length;
			}
		}
	}

	// Count tool tokens
	if (tools) {
		for (const tool of tools) {
			tokenCount += enc.encode(tool.name + (tool.description || "")).length;
			if (tool.input_schema) {
				tokenCount += enc.encode(JSON.stringify(tool.input_schema)).length;
			}
		}
	}

	return tokenCount;
}

/**
 * Free the encoding resources when done
 * Call this when shutting down the application
 */
export function freeTokenCounter(): void {
	enc.free();
}
