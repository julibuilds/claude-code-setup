/**
 * Word-level diff utilities for enhanced change detection
 * Based on critique example with Levenshtein distance algorithm
 */

/**
 * Calculate the Levenshtein distance between two strings
 * (minimum number of single-character edits required to transform one string into another)
 */
export function levenshteinDistance(str1: string, str2: string): number {
	const len1 = str1.length;
	const len2 = str2.length;
	const matrix: number[][] = [];

	// Initialize first column and row
	for (let i = 0; i <= len1; i++) {
		matrix[i] = [i];
	}

	for (let j = 0; j <= len2; j++) {
		matrix[0]![j] = j;
	}

	// Fill the matrix
	for (let i = 1; i <= len1; i++) {
		for (let j = 1; j <= len2; j++) {
			const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
			matrix[i]![j] = Math.min(
				matrix[i - 1]![j]! + 1, // deletion
				matrix[i]![j - 1]! + 1, // insertion
				matrix[i - 1]![j - 1]! + cost // substitution
			);
		}
	}

	return matrix[len1]![len2]!;
}

/**
 * Calculate similarity score between two strings (0.0 to 1.0)
 * 1.0 = identical, 0.0 = completely different
 */
export function calculateSimilarity(str1: string, str2: string): number {
	const longer = str1.length > str2.length ? str1 : str2;
	const shorter = str1.length > str2.length ? str2 : str1;

	if (longer.length === 0) {
		return 1.0;
	}

	const editDistance = levenshteinDistance(longer, shorter);
	return (longer.length - editDistance) / longer.length;
}

/**
 * Determine if two lines are similar enough to warrant word-level diff
 * (default threshold: 0.5 = 50% similar)
 */
export function areLinesRelated(line1: string, line2: string, threshold = 0.5): boolean {
	return calculateSimilarity(line1, line2) >= threshold;
}

export interface LinePair {
	removeIndex?: number;
	addIndex?: number;
}

/**
 * Find pairs of removed/added lines for word-level diff
 * Pairs consecutive removed lines with consecutive added lines
 */
export function findLinePairs(lines: Array<{ type: string; index: number }>): LinePair[] {
	const pairs: LinePair[] = [];
	let i = 0;

	while (i < lines.length) {
		const line = lines[i];
		if (!line || line.type !== "remove") {
			i++;
			continue;
		}

		// Collect all consecutive removes
		const removes: number[] = [];
		let j = i;
		while (j < lines.length && lines[j]?.type === "remove") {
			removes.push(lines[j]!.index);
			j++;
		}

		// Collect all consecutive adds that follow
		const adds: number[] = [];
		while (j < lines.length && lines[j]?.type === "add") {
			adds.push(lines[j]!.index);
			j++;
		}

		// Pair them up (match by position)
		const minLength = Math.min(removes.length, adds.length);
		for (let k = 0; k < minLength; k++) {
			pairs.push({
				removeIndex: removes[k],
				addIndex: adds[k],
			});
		}

		i = j;
	}

	return pairs;
}

export interface WordDiffPart {
	value: string;
	added?: boolean;
	removed?: boolean;
}

/**
 * Simple word-based diff using word boundaries
 * This is a basic implementation - for production use, consider using 'diff' package
 */
export function diffWords(oldText: string, newText: string): WordDiffPart[] {
	// Split on word boundaries
	const oldWords = oldText.split(/(\s+)/);
	const newWords = newText.split(/(\s+)/);

	const result: WordDiffPart[] = [];
	let oldIndex = 0;
	let newIndex = 0;

	while (oldIndex < oldWords.length || newIndex < newWords.length) {
		const oldWord = oldWords[oldIndex];
		const newWord = newWords[newIndex];

		// If words match, add as unchanged
		if (oldWord === newWord) {
			if (oldWord !== undefined) {
				result.push({ value: oldWord });
			}
			oldIndex++;
			newIndex++;
			continue;
		}

		// Look ahead to find matches
		let oldMatchIndex = -1;
		let newMatchIndex = -1;

		// Search for next match in old words
		for (let i = oldIndex + 1; i < Math.min(oldIndex + 5, oldWords.length); i++) {
			if (oldWords[i] === newWord) {
				oldMatchIndex = i;
				break;
			}
		}

		// Search for next match in new words
		for (let i = newIndex + 1; i < Math.min(newIndex + 5, newWords.length); i++) {
			if (newWords[i] === oldWord) {
				newMatchIndex = i;
				break;
			}
		}

		// Decide which path to take
		if (oldMatchIndex !== -1 && newMatchIndex === -1) {
			// Found match in old, add removals
			for (let i = oldIndex; i < oldMatchIndex; i++) {
				const word = oldWords[i];
				if (word !== undefined) {
					result.push({ value: word, removed: true });
				}
			}
			oldIndex = oldMatchIndex;
		} else if (newMatchIndex !== -1 && oldMatchIndex === -1) {
			// Found match in new, add additions
			for (let i = newIndex; i < newMatchIndex; i++) {
				const word = newWords[i];
				if (word !== undefined) {
					result.push({ value: word, added: true });
				}
			}
			newIndex = newMatchIndex;
		} else if (oldIndex < oldWords.length && newIndex < newWords.length) {
			// No clear match, mark as both removed and added
			if (oldWord !== undefined) {
				result.push({ value: oldWord, removed: true });
			}
			oldIndex++;
			if (newWord !== undefined) {
				result.push({ value: newWord, added: true });
			}
			newIndex++;
		} else if (oldIndex < oldWords.length) {
			// Remaining old words
			if (oldWord !== undefined) {
				result.push({ value: oldWord, removed: true });
			}
			oldIndex++;
		} else if (newIndex < newWords.length) {
			// Remaining new words
			if (newWord !== undefined) {
				result.push({ value: newWord, added: true });
			}
			newIndex++;
		}
	}

	return result;
}
