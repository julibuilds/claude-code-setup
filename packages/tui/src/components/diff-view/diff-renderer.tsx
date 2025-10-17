import type { MouseEvent } from "@opentui/core";
import { RGBA } from "@opentui/core";
import { diffWords } from "diff";
import type { ReactNode } from "react";
import type { GrammarState, ThemedToken } from "shiki";
import { detectLanguage } from "../../utils/syntax-highlight";
import type { DecoratedLine, StructuredDiffProps } from "./types";
import { calculateSimilarity, renderHighlightedTokens } from "./utils.tsx";

/**
 * Internal component that renders a single hunk of diff output
 */
export function StructuredDiff({
	patch,
	splitView,
	leftMaxWidth,
	rightMaxWidth,
	filePath,
	lang: providedLang,
	highlighter,
	onLineNumberClick,
	uiTheme,
}: StructuredDiffProps): ReactNode {
	const formatDiff = (lines: string[], startingLineNumber: number): DecoratedLine[] => {
		const processedLines = lines.map((code) => {
			if (code.startsWith("+")) return { code: code.slice(1), type: "add" as const };
			if (code.startsWith("-")) return { code: code.slice(1), type: "remove" as const };
			return { code: code.slice(1), type: "nochange" as const };
		});

		const lang = providedLang ?? detectLanguage(filePath);

		let beforeState: GrammarState | undefined;
		const beforeTokens: (ThemedToken[] | null)[] = [];
		let afterState: GrammarState | undefined;
		const afterTokens: (ThemedToken[] | null)[] = [];

		if (highlighter) {
			for (let idx = 0; idx < processedLines.length; idx++) {
				const line = processedLines[idx];
				if (!line) continue;
				if (line.type === "remove" || line.type === "nochange") {
					const result = highlighter.codeToTokens(line.code, {
						lang,
						theme: "github-dark-default",
						grammarState: beforeState,
					});
					const tokens = result.tokens[0] || null;
					beforeTokens.push(tokens);
					beforeState = highlighter.getLastGrammarState(result.tokens);
				} else {
					beforeTokens.push(null);
				}
			}

			for (const line of processedLines) {
				if (line.type === "add" || line.type === "nochange") {
					const result = highlighter.codeToTokens(line.code, {
						lang,
						theme: "github-dark-default",
						grammarState: afterState,
					});
					const tokens = result.tokens[0] || null;
					afterTokens.push(tokens);
					afterState = highlighter.getLastGrammarState(result.tokens);
				} else {
					afterTokens.push(null);
				}
			}
		}

		// Pair removed/added lines for word-level diffs only if hunk has both
		const hasRemovals = processedLines.some((l) => l.type === "remove");
		const hasAdditions = processedLines.some((l) => l.type === "add");
		const shouldShowWordDiff = hasRemovals && hasAdditions;

		const linePairs: Array<{ remove?: number; add?: number }> = [];
		if (shouldShowWordDiff) {
			let i = 0;
			while (i < processedLines.length) {
				if (processedLines[i]?.type === "remove") {
					const removes: number[] = [];
					let j = i;
					while (j < processedLines.length && processedLines[j]?.type === "remove") {
						removes.push(j);
						j++;
					}
					const adds: number[] = [];
					while (j < processedLines.length && processedLines[j]?.type === "add") {
						adds.push(j);
						j++;
					}
					const minLength = Math.min(removes.length, adds.length);
					for (let k = 0; k < minLength; k++) {
						linePairs.push({ remove: removes[k], add: adds[k] });
					}
					i = j;
				} else {
					i++;
				}
			}
		}

		let oldLineNumber = startingLineNumber;
		let newLineNumber = startingLineNumber;
		const result: DecoratedLine[] = [];

		for (let i = 0; i < processedLines.length; i++) {
			const processedLine = processedLines[i]!;
			const { code, type } = processedLine;

			const pair = linePairs.find((p) => p.remove === i || p.add === i);

			if (pair && pair.remove === i && pair.add !== undefined) {
				const removedText = processedLines[i]!.code;
				const addedLine = processedLines[pair.add]!;
				const addedText = addedLine.code;

				const similarity = calculateSimilarity(removedText, addedText);
				const shouldSkipWordDiff = similarity < 0.5;

				if (shouldSkipWordDiff || !highlighter) {
					const tokens = beforeTokens[i];
					const removedContent = tokens ? (
						<text>{renderHighlightedTokens(tokens)}</text>
					) : (
						<text>{removedText}</text>
					);
					result.push({
						code: removedContent,
						type,
						oldLineNumber: oldLineNumber.toString(),
						newLineNumber: newLineNumber.toString(),
						pairedWith: pair.add,
						key: `line-${i}`,
					});
					oldLineNumber++;
					continue;
				}

				const wordDiff = diffWords(removedText, addedText);
				const removedContent = (
					<text>
						{wordDiff.map((part, idx) => {
							if (part.removed) {
								return (
									<span key={idx} bg={RGBA.fromInts(255, 50, 50, 100)}>
										{part.value}
									</span>
								);
							}
							if (!part.added) return <span key={idx}>{part.value}</span>;
							return null;
						})}
					</text>
				);
				result.push({
					code: removedContent,
					type,
					oldLineNumber: oldLineNumber.toString(),
					newLineNumber: newLineNumber.toString(),
					pairedWith: pair.add,
					key: `line-${i}`,
				});
				oldLineNumber++;
			} else if (pair && pair.add === i && pair.remove !== undefined) {
				const removedLine = processedLines[pair.remove]!;
				const removedText = removedLine.code;
				const addedText = processedLine.code;

				const similarity = calculateSimilarity(removedText, addedText);
				const shouldSkipWordDiff = similarity < 0.5;

				if (shouldSkipWordDiff || !highlighter) {
					const tokens = afterTokens[i];
					const addedContent = tokens ? (
						<text>{renderHighlightedTokens(tokens)}</text>
					) : (
						<text>{addedText}</text>
					);
					result.push({
						code: addedContent,
						type,
						oldLineNumber: oldLineNumber.toString(),
						newLineNumber: newLineNumber.toString(),
						pairedWith: pair.remove,
						key: `line-${i}`,
					});
					newLineNumber++;
					continue;
				}

				const wordDiff = diffWords(removedText, addedText);
				const addedContent = (
					<text>
						{wordDiff.map((part, idx) => {
							if (part.added) {
								return (
									<span key={idx} bg={RGBA.fromInts(0, 200, 0, 100)}>
										{part.value}
									</span>
								);
							}
							if (!part.removed) return <span key={idx}>{part.value}</span>;
							return null;
						})}
					</text>
				);
				result.push({
					code: addedContent,
					type,
					oldLineNumber: oldLineNumber.toString(),
					newLineNumber: newLineNumber.toString(),
					pairedWith: pair.remove,
					key: `line-${i}`,
				});
				newLineNumber++;
			} else {
				const tokens =
					type === "remove"
						? beforeTokens[i]
						: type === "add"
							? afterTokens[i]
							: beforeTokens[i] || afterTokens[i];
				const content =
					tokens && tokens.length > 0 ? (
						<text>{renderHighlightedTokens(tokens)}</text>
					) : (
						<text>{code}</text>
					);
				result.push({
					code: content,
					type,
					oldLineNumber: oldLineNumber.toString(),
					newLineNumber: newLineNumber.toString(),
					key: `line-${i}`,
				});
			}

			if (type === "remove") oldLineNumber++;
			else if (type === "add") newLineNumber++;
			else {
				oldLineNumber++;
				newLineNumber++;
			}
		}

		return result;
	};

	const diff = formatDiff(patch.lines, patch.oldStart);
	const maxWidth = Math.max(leftMaxWidth, rightMaxWidth);

	if (!splitView) {
		return (
			<UnifiedView
				diff={diff}
				maxWidth={maxWidth}
				onLineNumberClick={onLineNumberClick}
				uiTheme={uiTheme}
			/>
		);
	}

	return (
		<SplitView
			diff={diff}
			leftMaxWidth={leftMaxWidth}
			rightMaxWidth={rightMaxWidth}
			onLineNumberClick={onLineNumberClick}
			uiTheme={uiTheme}
		/>
	);
}

/**
 * Renders unified diff view (single column)
 */
function UnifiedView({
	diff,
	maxWidth,
	onLineNumberClick,
	uiTheme,
}: {
	diff: DecoratedLine[];
	maxWidth: number;
	onLineNumberClick?: (info: { side: "left" | "right" | "unified"; lineNumber: number }) => void;
	uiTheme: StructuredDiffProps["uiTheme"];
}): ReactNode {
	const paddedDiff = diff.map((item) => ({
		...item,
		lineNumber:
			item.newLineNumber && item.newLineNumber !== "0"
				? item.newLineNumber.padStart(maxWidth)
				: " ".repeat(maxWidth),
	}));

	return (
		<>
			{paddedDiff.map(({ lineNumber, code, type, key, newLineNumber }) => (
				<box key={key} style={{ flexDirection: "row" }}>
					<box
						style={{
							flexShrink: 0,
							alignSelf: "stretch",
							backgroundColor:
								type === "add"
									? uiTheme.addedLineNumberBg
									: type === "remove"
										? uiTheme.removedLineNumberBg
										: uiTheme.lineNumberBg,
						}}
						onMouse={(event: MouseEvent) => {
							if (event.type === "down")
								onLineNumberClick?.({ side: "unified", lineNumber: parseInt(newLineNumber, 10) });
						}}
					>
						<text
							selectable={false}
							fg={
								type === "add" || type === "remove"
									? uiTheme.lineNumberFgBright
									: uiTheme.lineNumberFgDim
							}
							style={{ width: maxWidth + 2 }}
						>
							{" "}
							{lineNumber}{" "}
						</text>
					</box>
					<box
						style={{
							flexGrow: 1,
							paddingLeft: 1,
							backgroundColor:
								type === "add"
									? uiTheme.addedBgLight
									: type === "remove"
										? uiTheme.removedBgLight
										: uiTheme.unchangedBg,
						}}
					>
						{code}
					</box>
				</box>
			))}
		</>
	);
}

/**
 * Renders split diff view (left=old, right=new)
 */
function SplitView({
	diff,
	leftMaxWidth,
	rightMaxWidth,
	onLineNumberClick,
	uiTheme,
}: {
	diff: DecoratedLine[];
	leftMaxWidth: number;
	rightMaxWidth: number;
	onLineNumberClick?: (info: { side: "left" | "right" | "unified"; lineNumber: number }) => void;
	uiTheme: StructuredDiffProps["uiTheme"];
}): ReactNode {
	const splitLines: Array<{ left: any; right: any }> = [];
	const processedIndices = new Set<number>();

	for (let i = 0; i < diff.length; i++) {
		if (processedIndices.has(i)) continue;
		const line = diff[i];
		if (!line) continue;

		if (line.type === "remove" && line.pairedWith !== undefined) {
			const pairedLine = diff[line.pairedWith];
			if (pairedLine) {
				splitLines.push({
					left: { ...line, lineNumber: line.oldLineNumber.padStart(leftMaxWidth) },
					right: { ...pairedLine, lineNumber: pairedLine.newLineNumber.padStart(rightMaxWidth) },
				});
				processedIndices.add(i);
				processedIndices.add(line.pairedWith);
			}
		} else if (line.type === "remove") {
			splitLines.push({
				left: { ...line, lineNumber: line.oldLineNumber.padStart(leftMaxWidth) },
				right: {
					lineNumber: " ".repeat(rightMaxWidth),
					code: <text></text>,
					type: "empty",
					key: `${line.key}-empty-right`,
				},
			});
			processedIndices.add(i);
		} else if (line.type === "add") {
			splitLines.push({
				left: {
					lineNumber: " ".repeat(leftMaxWidth),
					code: <text></text>,
					type: "empty",
					key: `${line.key}-empty-left`,
				},
				right: { ...line, lineNumber: line.newLineNumber.padStart(rightMaxWidth) },
			});
			processedIndices.add(i);
		} else {
			splitLines.push({
				left: { ...line, lineNumber: line.oldLineNumber.padStart(leftMaxWidth) },
				right: { ...line, lineNumber: line.newLineNumber.padStart(rightMaxWidth) },
			});
			processedIndices.add(i);
		}
	}

	return (
		<>
			{splitLines.map(({ left: leftLine, right: rightLine }) => (
				<box key={leftLine.key} style={{ flexDirection: "row" }}>
					{/* Left side (removals) */}
					<box style={{ flexDirection: "row", width: "50%" }}>
						<box
							style={{
								flexShrink: 0,
								minWidth: leftMaxWidth + 2,
								alignSelf: "stretch",
								backgroundColor:
									leftLine.type === "remove" ? uiTheme.removedLineNumberBg : uiTheme.lineNumberBg,
							}}
							onMouse={(event: MouseEvent) => {
								if (
									event.type === "down" &&
									leftLine.oldLineNumber &&
									leftLine.oldLineNumber !== "0"
								) {
									onLineNumberClick?.({
										side: "left",
										lineNumber: parseInt(leftLine.oldLineNumber, 10),
									});
								}
							}}
						>
							<text
								selectable={false}
								fg={
									leftLine.type === "remove" ? uiTheme.lineNumberFgBright : uiTheme.lineNumberFgDim
								}
							>
								{" "}
								{leftLine.lineNumber}{" "}
							</text>
						</box>
						<box
							style={{
								flexGrow: 1,
								paddingLeft: 1,
								minWidth: 0,
								backgroundColor:
									leftLine.type === "remove"
										? uiTheme.removedBgLight
										: leftLine.type === "nochange"
											? uiTheme.unchangedBg
											: undefined,
							}}
						>
							{leftLine.code}
						</box>
					</box>

					{/* Right side (additions) */}
					<box style={{ flexDirection: "row", width: "50%" }}>
						<box
							style={{
								flexShrink: 0,
								minWidth: leftMaxWidth + 2,
								alignSelf: "stretch",
								backgroundColor:
									rightLine.type === "add" ? uiTheme.addedLineNumberBg : uiTheme.lineNumberBg,
							}}
							onMouse={(event: MouseEvent) => {
								if (event.type === "down") {
									onLineNumberClick?.({
										side: "right",
										lineNumber: parseInt(rightLine.newLineNumber, 10),
									});
								}
							}}
						>
							<text
								selectable={false}
								fg={rightLine.type === "add" ? uiTheme.lineNumberFgBright : uiTheme.lineNumberFgDim}
							>
								{" "}
								{rightLine.lineNumber}{" "}
							</text>
						</box>
						<box
							style={{
								flexGrow: 1,
								minWidth: 0,
								paddingLeft: 1,
								backgroundColor:
									rightLine.type === "add"
										? uiTheme.addedBgLight
										: rightLine.type === "nochange"
											? uiTheme.unchangedBg
											: undefined,
							}}
						>
							{rightLine.code}
						</box>
					</box>
				</box>
			))}
		</>
	);
}
