import type { RGBA } from "@opentui/core";
import type { StructuredPatchHunk as Hunk } from "diff";
import type { ReactNode } from "react";
import type { BundledLanguage, Highlighter } from "shiki";

export interface DiffViewProps {
	/**
	 * Structured patch hunk lines from 'diff' package
	 */
	hunks: Hunk[];

	/**
	 * Whether to render split view (left removals, right additions). If false, render unified view.
	 * @default true
	 */
	splitView?: boolean;

	/**
	 * Path of the file being diffed - used for language detection when lang isn't provided.
	 */
	filePath?: string;

	/**
	 * Optional explicit language override for syntax highlighting
	 */
	lang?: BundledLanguage;

	/**
	 * Shiki highlighter instance. If provided, code will be syntax highlighted.
	 */
	highlighter?: Highlighter;

	/**
	 * Called when user clicks a line number. Useful to integrate with editor open callbacks.
	 */
	onLineNumberClick?: (info: { side: "left" | "right" | "unified"; lineNumber: number }) => void;

	/**
	 * Optional paddingLeft to indent the diff block
	 */
	paddingLeft?: number;
}

export interface DecoratedLine {
	oldLineNumber: string;
	newLineNumber: string;
	code: ReactNode;
	type: "add" | "remove" | "nochange" | "empty";
	pairedWith?: number;
	key: string;
}

export interface DiffTheme {
	unchangedBg: RGBA;
	addedBgLight: RGBA;
	removedBgLight: RGBA;
	lineNumberBg: RGBA;
	removedLineNumberBg: RGBA;
	addedLineNumberBg: RGBA;
	lineNumberFgBright: RGBA;
	lineNumberFgDim: string;
}

export interface StructuredDiffProps {
	patch: Hunk;
	splitView: boolean;
	leftMaxWidth: number;
	rightMaxWidth: number;
	filePath: string;
	lang?: BundledLanguage;
	highlighter?: Highlighter;
	onLineNumberClick?: (info: { side: "left" | "right" | "unified"; lineNumber: number }) => void;
	uiTheme: DiffTheme;
}

export type { StructuredPatchHunk as Hunk } from "diff";
