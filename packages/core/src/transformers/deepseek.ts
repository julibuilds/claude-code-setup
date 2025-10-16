/**
 * DeepSeek transformer
 * Converts between Claude API format and DeepSeek's OpenAI-compatible format
 * DeepSeek uses OpenAI-compatible API with some specific behaviors
 */

import type { ClaudeMessage, ClaudeRequest, ClaudeResponse, ContentBlock } from "../types/api";
import type { Transformer, TransformerContext } from "../types/transformer";

export class DeepSeekTransformer implements Transformer {
	name = "deepseek";

	transformRequest(request: ClaudeRequest, context: TransformerContext): any {
		const transformed: any = {
			model: request.model,
			messages: this.convertMessages(request.messages, request.system),
			max_tokens: request.max_tokens,
			temperature: request.temperature,
			top_p: request.top_p,
			stream: request.stream,
		};

		// DeepSeek supports tools in OpenAI format
		if (request.tools && request.tools.length > 0) {
			transformed.tools = request.tools.map((tool) => ({
				type: "function",
				function: {
					name: tool.name,
					description: tool.description,
					parameters: tool.input_schema,
				},
			}));

			// Map tool choice
			if (request.tool_choice) {
				if (request.tool_choice.type === "tool" && request.tool_choice.name) {
					transformed.tool_choice = {
						type: "function",
						function: { name: request.tool_choice.name },
					};
				} else if (request.tool_choice.type === "any") {
					transformed.tool_choice = "required";
				} else {
					transformed.tool_choice = "auto";
				}
			}
		}

		// Remove undefined values
		Object.keys(transformed).forEach((key) => {
			if (transformed[key] === undefined) {
				delete transformed[key];
			}
		});

		return transformed;
	}

	private convertMessages(
		messages: ClaudeMessage[],
		system?: string | Array<{ type: string; text: string }>
	): any[] {
		const converted: any[] = [];

		// Add system message at the beginning if present
		if (system) {
			const systemContent =
				typeof system === "string" ? system : system.map((b) => b.text).join("\n");

			converted.push({
				role: "system",
				content: systemContent,
			});
		}

		for (const msg of messages) {
			// Simple string content
			if (typeof msg.content === "string") {
				converted.push({ role: msg.role, content: msg.content });
				continue;
			}

			// Complex content blocks
			const textBlocks: ContentBlock[] = [];
			const toolUseBlocks: ContentBlock[] = [];
			const toolResultBlocks: ContentBlock[] = [];
			const imageBlocks: ContentBlock[] = [];

			for (const block of msg.content) {
				if (block.type === "text") {
					textBlocks.push(block);
				} else if (block.type === "tool_use") {
					toolUseBlocks.push(block);
				} else if (block.type === "tool_result") {
					toolResultBlocks.push(block);
				} else if (block.type === "image") {
					imageBlocks.push(block);
				}
			}

			// Handle tool results
			if (toolResultBlocks.length > 0) {
				for (const block of toolResultBlocks) {
					converted.push({
						role: "tool",
						tool_call_id: block.tool_use_id,
						content:
							typeof block.content === "string" ? block.content : JSON.stringify(block.content),
					});
				}
			}

			// Handle tool use
			if (toolUseBlocks.length > 0) {
				const toolCalls = toolUseBlocks.map((block) => ({
					id: block.id || `call_${Date.now()}`,
					type: "function",
					function: {
						name: block.name || "",
						arguments: JSON.stringify(block.input || {}),
					},
				}));

				const message: any = {
					role: "assistant",
					tool_calls: toolCalls,
				};

				// Include text content if present
				if (textBlocks.length > 0) {
					message.content = textBlocks.map((b) => b.text).join("\n");
				}

				converted.push(message);
			}

			// Handle text and image content
			if ((textBlocks.length > 0 || imageBlocks.length > 0) && toolUseBlocks.length === 0) {
				const content: any[] = [];

				// Add text blocks
				for (const block of textBlocks) {
					content.push({ type: "text", text: block.text });
				}

				// Add image blocks (DeepSeek supports vision in some models)
				for (const block of imageBlocks) {
					if (block.source) {
						if (block.source.type === "base64") {
							content.push({
								type: "image_url",
								image_url: {
									url: `data:${block.source.media_type};base64,${block.source.data}`,
								},
							});
						} else if (block.source.type === "url") {
							content.push({
								type: "image_url",
								image_url: {
									url: block.source.url,
								},
							});
						}
					}
				}

				// If only one text block, use string format
				if (content.length === 1 && content[0].type === "text") {
					converted.push({ role: msg.role, content: content[0].text });
				} else {
					converted.push({ role: msg.role, content });
				}
			}
		}

		return converted;
	}

	transformResponse(response: any, context: TransformerContext): ClaudeResponse {
		const choice = response.choices?.[0];
		if (!choice) {
			throw new Error("Invalid response format: missing choices");
		}

		const content: ContentBlock[] = [];

		// Handle text content
		if (choice.message?.content) {
			content.push({
				type: "text",
				text: choice.message.content,
			});
		}

		// Handle tool calls
		if (choice.message?.tool_calls) {
			for (const toolCall of choice.message.tool_calls) {
				content.push({
					type: "tool_use",
					id: toolCall.id,
					name: toolCall.function.name,
					input: JSON.parse(toolCall.function.arguments),
				});
			}
		}

		// Map finish_reason to Claude's stop_reason
		const stopReasonMap: Record<string, string> = {
			stop: "end_turn",
			length: "max_tokens",
			tool_calls: "tool_use",
			content_filter: "stop_sequence",
		};

		return {
			id: response.id || `msg_${Date.now()}`,
			type: "message",
			role: "assistant",
			content,
			model: response.model || context.model,
			stop_reason: stopReasonMap[choice.finish_reason] || choice.finish_reason || null,
			stop_sequence: null,
			usage: {
				input_tokens: response.usage?.prompt_tokens || 0,
				output_tokens: response.usage?.completion_tokens || 0,
			},
		};
	}

	transformStreamChunk(chunk: any, context: TransformerContext): string {
		// Parse the chunk if it's a string (SSE format)
		let data = chunk;
		if (typeof chunk === "string") {
			const lines = chunk.split("\n");
			for (const line of lines) {
				if (line.startsWith("data: ")) {
					const jsonStr = line.slice(6);
					if (jsonStr === "[DONE]") {
						return "event: message_stop\ndata: {}\n\n";
					}
					try {
						data = JSON.parse(jsonStr);
					} catch {
						return "";
					}
					break;
				}
			}
		}

		const choice = data.choices?.[0];
		if (!choice) return "";

		const events: string[] = [];

		// Handle content delta
		if (choice.delta?.content) {
			const claudeChunk = {
				type: "content_block_delta",
				index: 0,
				delta: {
					type: "text_delta",
					text: choice.delta.content,
				},
			};
			events.push(`event: content_block_delta\ndata: ${JSON.stringify(claudeChunk)}\n\n`);
		}

		// Handle tool calls delta
		if (choice.delta?.tool_calls) {
			for (const toolCall of choice.delta.tool_calls) {
				if (toolCall.function?.name) {
					const claudeChunk = {
						type: "content_block_start",
						index: toolCall.index || 0,
						content_block: {
							type: "tool_use",
							id: toolCall.id,
							name: toolCall.function.name,
						},
					};
					events.push(`event: content_block_start\ndata: ${JSON.stringify(claudeChunk)}\n\n`);
				}
				if (toolCall.function?.arguments) {
					const claudeChunk = {
						type: "content_block_delta",
						index: toolCall.index || 0,
						delta: {
							type: "input_json_delta",
							partial_json: toolCall.function.arguments,
						},
					};
					events.push(`event: content_block_delta\ndata: ${JSON.stringify(claudeChunk)}\n\n`);
				}
			}
		}

		// Handle finish reason
		if (choice.finish_reason) {
			const stopReasonMap: Record<string, string> = {
				stop: "end_turn",
				length: "max_tokens",
				tool_calls: "tool_use",
				content_filter: "stop_sequence",
			};

			const claudeChunk = {
				type: "message_delta",
				delta: {
					stop_reason: stopReasonMap[choice.finish_reason] || choice.finish_reason,
				},
				usage: data.usage
					? {
							output_tokens: data.usage.completion_tokens || 0,
						}
					: undefined,
			};
			events.push(`event: message_delta\ndata: ${JSON.stringify(claudeChunk)}\n\n`);
		}

		return events.join("");
	}
}
