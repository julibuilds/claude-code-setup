// ============================================================================
// Styled Text Utilities
// ============================================================================

/**
 * Text style function type
 */
export type TextStyleFn = (text: string) => string;

/**
 * ANSI escape codes for text styling
 */
const ANSI = {
	reset: "\x1b[0m",
	bold: "\x1b[1m",
	dim: "\x1b[2m",
	italic: "\x1b[3m",
	underline: "\x1b[4m",
	blink: "\x1b[5m",
	reverse: "\x1b[7m",
	hidden: "\x1b[8m",
	strikethrough: "\x1b[9m",
};

/**
 * Create foreground color function
 */
export function fg(color: string): TextStyleFn {
	// Convert hex to RGB if needed
	const rgb = hexToRgb(color);
	if (rgb) {
		return (text: string) => `\x1b[38;2;${rgb.r};${rgb.g};${rgb.b}m${text}${ANSI.reset}`;
	}
	return (text: string) => text;
}

/**
 * Create background color function
 */
export function bg(color: string): TextStyleFn {
	const rgb = hexToRgb(color);
	if (rgb) {
		return (text: string) => `\x1b[48;2;${rgb.r};${rgb.g};${rgb.b}m${text}${ANSI.reset}`;
	}
	return (text: string) => text;
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				r: parseInt(result[1] ?? "0", 16),
				g: parseInt(result[2] ?? "0", 16),
				b: parseInt(result[3] ?? "0", 16),
			}
		: null;
}

/**
 * Bold text
 */
export const bold: TextStyleFn = (text: string) => `${ANSI.bold}${text}${ANSI.reset}`;

/**
 * Dim text
 */
export const dim: TextStyleFn = (text: string) => `${ANSI.dim}${text}${ANSI.reset}`;

/**
 * Italic text
 */
export const italic: TextStyleFn = (text: string) => `${ANSI.italic}${text}${ANSI.reset}`;

/**
 * Underlined text
 */
export const underline: TextStyleFn = (text: string) => `${ANSI.underline}${text}${ANSI.reset}`;

/**
 * Blinking text
 */
export const blink: TextStyleFn = (text: string) => `${ANSI.blink}${text}${ANSI.reset}`;

/**
 * Reversed colors text
 */
export const reverse: TextStyleFn = (text: string) => `${ANSI.reverse}${text}${ANSI.reset}`;

/**
 * Strikethrough text
 */
export const strikethrough: TextStyleFn = (text: string) =>
	`${ANSI.strikethrough}${text}${ANSI.reset}`;

// ============================================================================
// Common Color Helpers
// ============================================================================

/**
 * Red foreground
 */
export const red = fg("#FF0000");

/**
 * Green foreground
 */
export const green = fg("#00FF00");

/**
 * Blue foreground
 */
export const blue = fg("#0000FF");

/**
 * Yellow foreground
 */
export const yellow = fg("#FFFF00");

/**
 * Cyan foreground
 */
export const cyan = fg("#00FFFF");

/**
 * Magenta foreground
 */
export const magenta = fg("#FF00FF");

/**
 * White foreground
 */
export const white = fg("#FFFFFF");

/**
 * Black foreground
 */
export const black = fg("#000000");

/**
 * Gray foreground
 */
export const gray = fg("#808080");

// ============================================================================
// Background Color Helpers
// ============================================================================

/**
 * Red background
 */
export const bgRed = bg("#FF0000");

/**
 * Green background
 */
export const bgGreen = bg("#00FF00");

/**
 * Blue background
 */
export const bgBlue = bg("#0000FF");

/**
 * Yellow background
 */
export const bgYellow = bg("#FFFF00");

/**
 * Cyan background
 */
export const bgCyan = bg("#00FFFF");

/**
 * Magenta background
 */
export const bgMagenta = bg("#FF00FF");

/**
 * White background
 */
export const bgWhite = bg("#FFFFFF");

/**
 * Black background
 */
export const bgBlack = bg("#000000");

/**
 * Gray background
 */
export const bgGray = bg("#808080");

// ============================================================================
// Style Combinators
// ============================================================================

/**
 * Combine multiple style functions into one
 * Applies styles from left to right
 *
 * @example
 * const errorText = combine(bold, red, bgYellow);
 * console.log(errorText("Error!"));
 */
export function combine(...fns: TextStyleFn[]): TextStyleFn {
	return (text: string) => fns.reduce((acc, fn) => fn(acc), text);
}

/**
 * Pipe text through multiple style functions
 * Alias for combine
 */
export const pipe = combine;

/**
 * Apply style only if condition is true
 *
 * @example
 * const conditionalRed = when(isError, red);
 * console.log(conditionalRed("Maybe error"));
 */
export function when(condition: boolean, styleFn: TextStyleFn): TextStyleFn {
	return (text: string) => (condition ? styleFn(text) : text);
}

/**
 * Apply one of two styles based on condition
 *
 * @example
 * const statusText = ifElse(isSuccess, green, red);
 * console.log(statusText("Status"));
 */
export function ifElse(condition: boolean, trueFn: TextStyleFn, falseFn: TextStyleFn): TextStyleFn {
	return (text: string) => (condition ? trueFn(text) : falseFn(text));
}

// ============================================================================
// Semantic Styles
// ============================================================================

/**
 * Error text style (bold red with yellow background)
 */
export const errorText = combine(bold, red, bgYellow);

/**
 * Success text style (bold green)
 */
export const successText = combine(bold, green);

/**
 * Warning text style (bold orange/yellow)
 */
export const warningText = combine(bold, fg("#FFA500"));

/**
 * Info text style (bold blue)
 */
export const infoText = combine(bold, blue);

/**
 * Highlight text style (bold with cyan)
 */
export const highlightText = combine(bold, cyan);

/**
 * Muted text style (dim gray)
 */
export const mutedText = combine(dim, gray);

/**
 * Emphasized text style (bold italic)
 */
export const emphasisText = combine(bold, italic);

/**
 * Critical text style (bold red background)
 */
export const criticalText = combine(bold, white, bgRed);

/**
 * Subtle text style (dim)
 */
export const subtleText = dim;

/**
 * Link-style text (underlined cyan)
 */
export const linkText = combine(underline, cyan);

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Strip all ANSI codes from text
 */
export function stripAnsi(text: string): string {
	// biome-ignore lint/suspicious/noControlCharactersInRegex: its ok
	return text.replace(/\x1b\[[0-9;]*m/g, "");
}

/**
 * Get the visible length of text (excluding ANSI codes)
 */
export function visibleLength(text: string): number {
	return stripAnsi(text).length;
}

/**
 * Pad text to a specific width (accounting for ANSI codes)
 */
export function pad(
	text: string,
	width: number,
	char: string = " ",
	align: "left" | "right" | "center" = "left"
): string {
	const visible = visibleLength(text);
	if (visible >= width) return text;

	const padding = width - visible;

	switch (align) {
		case "left":
			return text + char.repeat(padding);
		case "right":
			return char.repeat(padding) + text;
		case "center": {
			const leftPad = Math.floor(padding / 2);
			const rightPad = padding - leftPad;
			return char.repeat(leftPad) + text + char.repeat(rightPad);
		}
		default:
			return text;
	}
}

/**
 * Truncate text to a specific width, adding ellipsis if needed
 */
export function truncate(text: string, maxWidth: number, ellipsis: string = "..."): string {
	const visible = visibleLength(text);
	if (visible <= maxWidth) return text;

	const stripped = stripAnsi(text);
	const truncated = stripped.slice(0, maxWidth - ellipsis.length);
	return truncated + ellipsis;
}

/**
 * Create a rainbow effect by cycling through colors
 */
export function rainbow(text: string): string {
	const colors = ["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#9400D3"];

	return text
		.split("")
		.map((char, i) => fg(colors[i % colors.length] ?? "#000000")(char))
		.join("");
}

/**
 * Create a gradient effect between two colors
 */
export function gradient(text: string, fromColor: string, toColor: string): string {
	const fromRgb = hexToRgb(fromColor);
	const toRgb = hexToRgb(toColor);

	if (!fromRgb || !toRgb) return text;

	const chars = text.split("");
	const step = 1 / (chars.length - 1 || 1);

	return chars
		.map((char, i) => {
			const progress = i * step;
			const r = Math.round(fromRgb.r + (toRgb.r - fromRgb.r) * progress);
			const g = Math.round(fromRgb.g + (toRgb.g - fromRgb.g) * progress);
			const b = Math.round(fromRgb.b + (toRgb.b - fromRgb.b) * progress);
			return fg(
				`#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
			)(char);
		})
		.join("");
}

/**
 * Box drawing characters
 */
export const box = {
	topLeft: "┌",
	topRight: "┐",
	bottomLeft: "└",
	bottomRight: "┘",
	horizontal: "─",
	vertical: "│",
	cross: "┼",
	teeUp: "┴",
	teeDown: "┬",
	teeLeft: "┤",
	teeRight: "├",
};

/**
 * Create a simple box around text
 */
export function boxText(text: string, padding: number = 1, style?: TextStyleFn): string {
	const lines = text.split("\n");
	const maxWidth = Math.max(...lines.map((l) => visibleLength(l)));
	const innerWidth = maxWidth + padding * 2;

	const top = box.topLeft + box.horizontal.repeat(innerWidth) + box.topRight;
	const bottom = box.bottomLeft + box.horizontal.repeat(innerWidth) + box.bottomRight;

	const paddedLines = lines.map((line) => {
		const padded = pad(line, maxWidth, " ", "left");
		const withPadding = " ".repeat(padding) + padded + " ".repeat(padding);
		return box.vertical + withPadding + box.vertical;
	});

	const result = [top, ...paddedLines, bottom].join("\n");
	return style ? style(result) : result;
}
