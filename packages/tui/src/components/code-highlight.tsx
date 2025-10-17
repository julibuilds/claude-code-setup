import { RGBA } from "@opentui/core";
import type { ReactNode } from "react";
import type { BundledLanguage, BundledTheme, GrammarState, Highlighter, ThemedToken } from "shiki";

export interface CodeHighlightProps {
	/**
	 * The Shiki highlighter instance to use.
	 * Create one using `createDefaultHighlighter()` from utils/syntax-highlight.ts
	 */
	highlighter: Highlighter;

	/**
	 * Lines of code to highlight. Each item in the array is a separate line.
	 */
	lines: string[];

	/**
	 * The programming language for syntax highlighting
	 */
	lang: BundledLanguage;

	/**
	 * The theme to use for highlighting
	 * @default "github-dark-default"
	 */
	theme?: BundledTheme;

	/**
	 * Custom renderer for tokens. If not provided, uses default rendering.
	 */
	renderToken?: (token: ThemedToken, index: number) => ReactNode;

	/**
	 * Custom renderer for lines. If not provided, wraps tokens in a text element.
	 */
	renderLine?: (tokens: ReactNode[], line: string, index: number) => ReactNode;

	/**
	 * Whether to wrap text in lines
	 * @default false
	 */
	wrap?: boolean;

	/**
	 * Initial grammar state for multi-line parsing context
	 */
	initialGrammarState?: GrammarState;
}

/**
 * Default token renderer - renders a span with foreground color from the token
 */
function defaultRenderToken(token: ThemedToken, index: number): ReactNode {
	const color = token.color;
	const fg = color ? RGBA.fromHex(color) : undefined;

	return (
		<span key={index} fg={fg}>
			{token.content}
		</span>
	);
}

/**
 * Default line renderer - wraps tokens in a text element
 */
function defaultRenderLine(tokens: ReactNode[], _line: string, index: number): ReactNode {
	return (
		<text key={index} wrap={false}>
			{tokens}
		</text>
	);
}

/**
 * A primitive component for syntax highlighting code with Shiki.
 *
 * This component is stateless and fully controlled - you provide the highlighter,
 * code, and rendering preferences. For multi-line code blocks, it maintains grammar
 * state to ensure accurate parsing across lines.
 *
 * @example
 * ```tsx
 * import { CodeHighlight } from '@repo/tui';
 * import { createDefaultHighlighter } from '@repo/tui/utils/syntax-highlight';
 *
 * const highlighter = await createDefaultHighlighter();
 *
 * function MyCode() {
 *   const code = ['const x = 1;', 'console.log(x);'];
 *
 *   return (
 *     <box style={{ flexDirection: 'column', padding: 2 }}>
 *       <CodeHighlight
 *         highlighter={highlighter}
 *         lines={code}
 *         lang="typescript"
 *       />
 *     </box>
 *   );
 * }
 * ```
 */
export function CodeHighlight({
	highlighter,
	lines,
	lang,
	theme = "github-dark-default",
	renderToken = defaultRenderToken,
	renderLine = defaultRenderLine,
	wrap = false, // TODO: Address this ("'wrap' is declared but its value is never read.")
	initialGrammarState,
}: CodeHighlightProps): ReactNode {
	let grammarState = initialGrammarState;
	const renderedLines: ReactNode[] = [];

	for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
		const line = lines[lineIndex];
		if (line === undefined) continue;

		// Tokenize the line with grammar state
		const result = highlighter.codeToTokens(line, {
			lang,
			theme,
			grammarState,
		});

		const tokens = result.tokens[0];
		if (!tokens) {
			// Empty line - still render it
			renderedLines.push(renderLine([], line, lineIndex));
			continue;
		}

		// Render tokens for this line
		const renderedTokens = tokens.map((token, tokenIndex) => renderToken(token, tokenIndex));

		// Render the complete line
		renderedLines.push(renderLine(renderedTokens, line, lineIndex));

		// Update grammar state for next line
		grammarState = highlighter.getLastGrammarState(result.tokens);
	}

	return (
		<box style={{ flexDirection: "column" }}>
			{renderedLines.map((line, idx) => (
				<box key={idx}>{line}</box>
			))}
		</box>
	);
}

/**
 * Props for the simpler CodeBlock component
 */
export interface CodeBlockProps {
	/**
	 * The code to highlight as a single string (will be split by newlines)
	 */
	code: string;

	/**
	 * The Shiki highlighter instance
	 */
	highlighter: Highlighter;

	/**
	 * The programming language for syntax highlighting
	 */
	lang: BundledLanguage;

	/**
	 * The theme to use for highlighting
	 * @default "github-dark-default"
	 */
	theme?: BundledTheme;

	/**
	 * Whether to show line numbers
	 * @default false
	 */
	showLineNumbers?: boolean;

	/**
	 * Starting line number (if showLineNumbers is true)
	 * @default 1
	 */
	startLineNumber?: number;

	/**
	 * Custom padding for the entire block
	 */
	padding?: number;
}

/**
 * A higher-level component that wraps CodeHighlight with common defaults.
 * Accepts code as a string and optionally shows line numbers.
 *
 * @example
 * ```tsx
 * <CodeBlock
 *   code={`const x = 1;\nconsole.log(x);`}
 *   highlighter={highlighter}
 *   lang="typescript"
 *   showLineNumbers
 * />
 * ```
 */
export function CodeBlock({
	code,
	highlighter,
	lang,
	theme = "github-dark-default",
	showLineNumbers = false,
	startLineNumber = 1,
	padding = 2,
}: CodeBlockProps): ReactNode {
	const lines = code.split("\n");
	const maxLineNumber = startLineNumber + lines.length - 1;
	const lineNumberWidth = maxLineNumber.toString().length;

	const customRenderLine = showLineNumbers
		? (tokens: ReactNode[], _line: string, index: number): ReactNode => {
				const lineNumber = (startLineNumber + index).toString().padStart(lineNumberWidth);
				return (
					<box key={index} style={{ flexDirection: "row" }}>
						<text fg="brightBlack" selectable={false}>
							{lineNumber}{" "}
						</text>
						<text wrap={false}>{tokens}</text>
					</box>
				);
			}
		: undefined;

	return (
		<box style={{ flexDirection: "column", padding }}>
			<CodeHighlight
				highlighter={highlighter}
				lines={lines}
				lang={lang}
				theme={theme}
				renderLine={customRenderLine}
			/>
		</box>
	);
}
