import { RGBA } from "@opentui/core";
import { type ReactNode, useMemo } from "react";
import { useThemeColors } from "../styles/theme-system";
import { StructuredDiff } from "./diff-view/diff-renderer";
import type { DiffViewProps } from "./diff-view/types";

// Re-export types for convenience
export type { DiffTheme, DiffViewProps } from "./diff-view/types";

/**
 * A primitive component for rendering unified or split code diffs.
 *
 * This component displays structured patch hunks (from the 'diff' package) with optional
 * syntax highlighting via Shiki. It supports both unified and split views, word-level
 * diff highlighting for similar lines, and clickable line numbers.
 *
 * @example
 * ```tsx
 * import { structuredPatch } from 'diff';
 * import { DiffView, createDefaultHighlighter } from '@repo/tui';
 *
 * const highlighter = await createDefaultHighlighter();
 * const patch = structuredPatch('old.ts', 'new.ts', oldCode, newCode, '', '');
 *
 * <DiffView
 *   hunks={patch.hunks}
 *   filePath="example.ts"
 *   highlighter={highlighter}
 *   splitView={true}
 *   onLineNumberClick={({ side, lineNumber }) => {
 *     console.log(`Line ${lineNumber} clicked on ${side}`);
 *   }}
 * />
 * ```
 */
export function DiffView({
	hunks,
	splitView = true,
	filePath = "",
	lang: providedLang,
	highlighter,
	onLineNumberClick,
	paddingLeft = 0,
}: DiffViewProps): ReactNode {
	const colors = useThemeColors();

	const theme = useMemo(
		() => ({
			unchangedBg: RGBA.fromHex(colors.diff.unchanged),
			addedBgLight: RGBA.fromHex(colors.diff.added + "20"), // Add transparency
			removedBgLight: RGBA.fromHex(colors.diff.removed + "20"), // Add transparency
			lineNumberBg: RGBA.fromHex(colors.diff.lineNumber),
			removedLineNumberBg: RGBA.fromHex(colors.diff.removedLineNumber),
			addedLineNumberBg: RGBA.fromHex(colors.diff.addedLineNumber),
			lineNumberFgBright: RGBA.fromHex(colors.diff.lineNumberBright),
			lineNumberFgDim: colors.diff.lineNumberDim,
		}),
		[colors]
	);

	// Precompute line number widths across all hunks
	const allLines = hunks.flatMap((h) => h.lines);
	let [oldLineNum, newLineNum] = [hunks[0]?.oldStart || 1, hunks[0]?.newStart || 1];

	const maxOldLine = allLines.reduce((max, line) => {
		if (line.startsWith("-")) return Math.max(max, oldLineNum++);
		if (line.startsWith("+")) {
			newLineNum++;
			return max;
		}
		oldLineNum++;
		newLineNum++;
		return Math.max(max, oldLineNum - 1);
	}, 0);

	[oldLineNum, newLineNum] = [hunks[0]?.oldStart || 1, hunks[0]?.newStart || 1];
	const maxNewLine = allLines.reduce((max, line) => {
		if (line.startsWith("-")) {
			oldLineNum++;
			return max;
		}
		if (line.startsWith("+")) return Math.max(max, newLineNum++);
		oldLineNum++;
		newLineNum++;
		return Math.max(max, newLineNum - 1);
	}, 0);

	const leftMaxWidth = maxOldLine.toString().length;
	const rightMaxWidth = maxNewLine.toString().length;

	return (
		<box style={{ flexDirection: "column" }}>
			{hunks.flatMap((patch, i) => {
				const elements: ReactNode[] = [
					<box style={{ flexDirection: "column", paddingLeft }} key={patch.newStart}>
						<StructuredDiff
							patch={patch}
							splitView={splitView}
							leftMaxWidth={leftMaxWidth}
							rightMaxWidth={rightMaxWidth}
							filePath={filePath}
							lang={providedLang}
							highlighter={highlighter}
							onLineNumberClick={onLineNumberClick}
							uiTheme={theme}
						/>
					</box>,
				];
				if (i < hunks.length - 1) {
					elements.push(
						<box style={{ paddingLeft }} key={`ellipsis-${patch.newStart}-${i}`}>
							<text fg="brightBlack">{" ".repeat(leftMaxWidth + 2)}…</text>
						</box>
					);
				}
				return elements;
			})}
		</box>
	);
}
