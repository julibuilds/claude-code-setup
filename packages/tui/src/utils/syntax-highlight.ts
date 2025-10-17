import type { BundledLanguage, BundledTheme, Highlighter } from "shiki";
import { createHighlighter } from "shiki";

/**
 * Default languages to load with the highlighter.
 * Consumers can create their own highlighter with custom languages if needed.
 */
export const DEFAULT_LANGUAGES: BundledLanguage[] = [
	"javascript",
	"typescript",
	"tsx",
	"jsx",
	"json",
	"markdown",
	"html",
	"css",
	"python",
	"rust",
	"go",
	"java",
	"c",
	"cpp",
	"yaml",
	"toml",
	"bash",
	"sh",
	"sql",
];

/**
 * Detects programming language from file extension
 */
export function detectLanguage(filePath: string): BundledLanguage {
	const ext = filePath.split(".").pop()?.toLowerCase();
	switch (ext) {
		case "ts":
			return "typescript";
		case "tsx":
			return "tsx";
		case "jsx":
			return "jsx";
		case "js":
		case "mjs":
		case "cjs":
			return "javascript";
		case "json":
			return "json";
		case "md":
		case "mdx":
		case "markdown":
			return "markdown";
		case "html":
		case "htm":
			return "html";
		case "css":
			return "css";
		case "py":
			return "python";
		case "rs":
			return "rust";
		case "go":
			return "go";
		case "java":
			return "java";
		case "c":
		case "h":
			return "c";
		case "cpp":
		case "cc":
		case "cxx":
		case "hpp":
		case "hxx":
			return "cpp";
		case "yaml":
		case "yml":
			return "yaml";
		case "toml":
			return "toml";
		case "sh":
			return "sh";
		case "bash":
			return "bash";
		case "sql":
			return "sql";
		default:
			return "javascript";
	}
}

/**
 * Creates a Shiki highlighter with the specified themes and languages.
 * This is an async operation that should be done once and reused.
 *
 * @example
 * ```tsx
 * const highlighter = await createDefaultHighlighter();
 * // Use highlighter.codeToTokens() in your component
 * ```
 */
export async function createDefaultHighlighter(
	themes: BundledTheme[] = ["github-dark-default"],
	langs: BundledLanguage[] = DEFAULT_LANGUAGES
): Promise<Highlighter> {
	return createHighlighter({
		themes,
		langs,
	});
}
