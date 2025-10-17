import { RGBA } from "@opentui/core";
import type { ReactNode } from "react";
import type { ThemedToken } from "shiki";

/**
 * Renders Shiki-highlighted tokens as React nodes
 */
export function renderHighlightedTokens(tokens: ThemedToken[]): ReactNode[] {
	return tokens.map((token, tokenIdx) => {
		const color = token.color;
		const fg = color ? RGBA.fromHex(color) : undefined;
		return (
			<span key={tokenIdx} fg={fg}>
				{token.content}
			</span>
		);
	});
}

/**
 * Calculates similarity between two strings using Levenshtein distance
 * Returns a value between 0 (completely different) and 1 (identical)
 */
export function calculateSimilarity(str1: string, str2: string): number {
	const longer = str1.length > str2.length ? str1 : str2;
	const shorter = str1.length > str2.length ? str2 : str1;
	if (longer.length === 0) return 1.0;
	const editDistance = levenshteinDistance(longer, shorter);
	return (longer.length - editDistance) / longer.length;
}

/**
 * Calculates the Levenshtein distance between two strings
 */
export function levenshteinDistance(str1: string, str2: string): number {
	const len1 = str1.length;
	const len2 = str2.length;
	const matrix: number[][] = [];

	for (let i = 0; i <= len1; i++) matrix[i] = [i];
	for (let j = 0; j <= len2; j++) matrix[0]![j] = j;

	for (let i = 1; i <= len1; i++) {
		for (let j = 1; j <= len2; j++) {
			const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
			matrix[i]![j] = Math.min(
				matrix[i - 1]?.[j]! + 1,
				matrix[i]?.[j - 1]! + 1,
				matrix[i - 1]?.[j - 1]! + cost
			);
		}
	}
	return matrix[len1]?.[len2]!;
}
