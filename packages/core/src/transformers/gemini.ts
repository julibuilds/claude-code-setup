/**
 * Gemini transformer
 * Converts between Claude API format and Google Gemini API format
 * Gemini has a unique API structure different from OpenAI
 */

import type { ClaudeMessage, ClaudeRequest, ClaudeResponse, ContentBlock } from "../types/api";
import type { Transformer, TransformerContext } from "../types/transformer";

export class GeminiTransformer implements Transformer {
	name = "gemini";

	transformRequest(request: ClaudeRequest, context: TransformerContext): any {
		const transformed: any = {
			contents: this.convertMessages(request.messages),
			generationConfig: {},
		};

		// Add system instruction if present
		if (request.system) {
			const systemContent =
				typeof request.system === "string"
					? request.system
					: request.system.map((b) => b.text).join("\n");

			transformed.systemInstruction = {
				parts: [{ text: systemContent }],
			};
		}

		// Add generation config
		if (request.max_tokens !== undefined) {
			transformed.generationConfig.maxOutputTokens = request.max_tokens;
		}
		if (request.temperature !== undefined) {
			transformed.generationConfig.temperature = request.temperature;
		}
		if (request.top_p !== undefined) {
			transformed.generationConfig.topP = request.top_p;
		}
		if (request.top_k !== undefined) {
			transformed.generationConfig.topK = request.top_k;
		}

		// Add tools if present
		if (request.tools && request.tools.length > 0) {
			transformed.tools = [
				{
					functionDeclarations: request.tools.map((tool) => ({
						name: tool.name,
						description: tool.description,
						parameters: tool.input_schema,
					})),
				},
			];

			// Add tool config for tool choice
			if (request.tool_choice) {
				if (request.tool_choice.type === "tool" && request.tool_choice.name) {
					transformed.toolConfig = {
						functionCallingConfig: {
							mode: "ANY",
							allowedFunctionNames: [request.tool_choice.name],
						},
					};
				} else if (request.tool_choice.type === "any") {
					transformed.toolConfig = {
						functionCallingConfig: {
							mode: "ANY",
						},
					};
				} else {
					transformed.toolConfig = {
						functionCallingConfig: {
							mode: "AUTO",
						},
					};
				}
			}
		}

		// Remove empty generationConfig
		if (Object.keys(transformed.generationConfig).length === 0) {
			delete transformed.generationConfig;
		}

		return transformed;
	}

	private convertMessages(messages: ClaudeMessage[]): any[] {
		const converted: any[] = [];

		for (const msg of messages) {
			const parts: any[] = [];

			// Simple string content
			if (typeof msg.content === "string") {
				parts.push({ text: msg.content });
			} else {
				// Complex content blocks
				for (const block of msg.content) {
					if (block.type === "text" && block.text) {
						parts.push({ text: block.text });
					} else if (block.type === "image" && block.source) {
						// Handle image content
						if (block.source.type === "base64") {
							parts.push({
								inlineData: {
									mimeType: block.source.media_type,
									data: block.source.data,
								},
							});
						} else if (block.source.type === "url") {
							// Gemini doesn't support URL images directly in the same way
							// We'd need to fetch and convert, but for now we'll note it
							parts.push({
								text: `[Image URL: ${block.source.url}]`,
							});
						}
					} else if (block.type === "tool_use") {
						// Tool use in assistant message
						parts.push({
							functionCall: {
								name: block.name,
								args: block.input || {},
							},
						});
					} else if (block.type === "tool_result") {
						// Tool result in user message
						parts.push({
							functionResponse: {
								name: block.tool_use_id || "unknown",
								response: {
									content:
										typeof block.content === "string"
											? block.content
											: JSON.stringify(block.content),
								},
							},
						});
					}
				}
			}

			// Map role (Gemini uses 'user' and 'model' instead of 'assistant')
			const role = msg.role === "assistant" ? "model" : "user";

			converted.push({
				role,
				parts,
			});
		}

		return converted;
	}

	transformResponse(response: any, context: TransformerContext): ClaudeResponse {
		const candidate = response.candidates?.[0];
		if (!candidate) {
			throw new Error("Invalid response format: missing candidates");
		}

		const content: ContentBlock[] = [];

		// Process parts
		if (candidate.content?.parts) {
			for (const part of candidate.content.parts) {
				if (part.text) {
					content.push({
						type: "text",
						text: part.text,
					});
				} else if (part.functionCall) {
					content.push({
						type: "tool_use",
						id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
						name: part.functionCall.name,
						input: part.functionCall.args || {},
					});
				}
			}
		}

		// Map finish reason
		const stopReasonMap: Record<string, string> = {
			STOP: "end_turn",
			MAX_TOKENS: "max_tokens",
			SAFETY: "stop_sequence",
			RECITATION: "stop_sequence",
			OTHER: "end_turn",
		};

		const finishReason = candidate.finishReason || "STOP";

		return {
			id: `msg_${Date.now()}`,
			type: "message",
			role: "assistant",
			content,
			model: response.modelVersion || context.model,
			stop_reason: stopReasonMap[finishReason] || "end_turn",
			stop_sequence: null,
			usage: {
				input_tokens: response.usageMetadata?.promptTokenCount || 0,
				output_tokens: response.usageMetadata?.candidatesTokenCount || 0,
			},
		};
	}

	transformStreamChunk(chunk: any, context: TransformerContext): string {
		// Parse the chunk if it's a string
		let data = chunk;
		if (typeof chunk === "string") {
			try {
				data = JSON.parse(chunk);
			} catch {
				return "";
			}
		}

		const candidate = data.candidates?.[0];
		if (!candidate) return "";

		const events: string[] = [];

		// Handle content parts
		if (candidate.content?.parts) {
			for (const part of candidate.content.parts) {
				if (part.text) {
					const claudeChunk = {
						type: "content_block_delta",
						index: 0,
						delta: {
							type: "text_delta",
							text: part.text,
						},
					};
					events.push(`event: content_block_delta\ndata: ${JSON.stringify(claudeChunk)}\n\n`);
				} else if (part.functionCall) {
					// Function call start
					const startChunk = {
						type: "content_block_start",
						index: 0,
						content_block: {
							type: "tool_use",
							id: `call_${Date.now()}`,
							name: part.functionCall.name,
						},
					};
					events.push(`event: content_block_start\ndata: ${JSON.stringify(startChunk)}\n\n`);

					// Function arguments
					if (part.functionCall.args) {
						const argsChunk = {
							type: "content_block_delta",
							index: 0,
							delta: {
								type: "input_json_delta",
								partial_json: JSON.stringify(part.functionCall.args),
							},
						};
						events.push(`event: content_block_delta\ndata: ${JSON.stringify(argsChunk)}\n\n`);
					}
				}
			}
		}

		// Handle finish reason
		if (candidate.finishReason) {
			const stopReasonMap: Record<string, string> = {
				STOP: "end_turn",
				MAX_TOKENS: "max_tokens",
				SAFETY: "stop_sequence",
				RECITATION: "stop_sequence",
				OTHER: "end_turn",
			};

			const claudeChunk = {
				type: "message_delta",
				delta: {
					stop_reason: stopReasonMap[candidate.finishReason] || "end_turn",
				},
				usage: data.usageMetadata
					? {
							output_tokens: data.usageMetadata.candidatesTokenCount || 0,
						}
					: undefined,
			};
			events.push(`event: message_delta\ndata: ${JSON.stringify(claudeChunk)}\n\n`);
		}

		return events.join("");
	}
}
