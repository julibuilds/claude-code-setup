/**
 * Color scale generation utilities for data visualization
 * Based on opentui-treegraph example with @visx/scale integration
 *
 * Note: To use @visx/scale, install with: bun add @visx/scale
 * This file provides both visx-based and standalone color scale utilities
 */

/**
 * Pre-defined color schemes for various visualization types
 */
export const colorSchemes = {
	// Sequential schemes (light to dark)
	blues: ["#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#084594"],
	greens: ["#f7fcf5", "#e5f5e0", "#c7e9c0", "#a1d99b", "#74c476", "#41ab5d", "#238b45", "#005a32"],
	reds: ["#fee5d9", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#99000d"],
	purples: ["#f2f0f7", "#dadaeb", "#bcbddc", "#9e9ac8", "#807dba", "#6a51a3", "#4a1486"],
	oranges: ["#feedde", "#fdd0a2", "#fdae6b", "#fd8d3c", "#f16913", "#d94801", "#8c2d04"],

	// Diverging schemes (for data with a meaningful center)
	redBlue: [
		"#67001f",
		"#b2182b",
		"#d6604d",
		"#f4a582",
		"#fddbc7",
		"#d1e5f0",
		"#92c5de",
		"#4393c3",
		"#2166ac",
		"#053061",
	],
	redGreen: [
		"#d73027",
		"#f46d43",
		"#fdae61",
		"#fee08b",
		"#ffffbf",
		"#d9ef8b",
		"#a6d96a",
		"#66bd63",
		"#1a9850",
	],

	// Categorical schemes (for distinct categories)
	category10: [
		"#1f77b4",
		"#ff7f0e",
		"#2ca02c",
		"#d62728",
		"#9467bd",
		"#8c564b",
		"#e377c2",
		"#7f7f7f",
		"#bcbd22",
		"#17becf",
	],
	pastel: ["#fbb4ae", "#b3cde3", "#ccebc5", "#decbe4", "#fed9a6", "#ffffcc", "#e5d8bd", "#fddaec"],

	// TUI-friendly schemes (terminal-safe colors)
	terminalBright: [
		"#ff5555", // bright red
		"#50fa7b", // bright green
		"#f1fa8c", // bright yellow
		"#bd93f9", // bright purple
		"#ff79c6", // bright pink
		"#8be9fd", // bright cyan
	],
	terminalMuted: [
		"#6272a4", // muted blue
		"#8be9fd", // cyan
		"#50fa7b", // green
		"#ffb86c", // orange
		"#ff79c6", // pink
		"#bd93f9", // purple
	],
};

/**
 * Generate a color scale for layer-based coloring
 * Maps layer numbers to colors from a scheme
 */
export function createLayerColorScale(
	colorScheme: string[],
	maxLayers: number
): (layer: number) => string {
	return (layer: number) => {
		const index = layer % colorScheme.length;
		return colorScheme[index] || colorScheme[0] || "#808080";
	};
}

/**
 * Generate a sequential color scale for continuous data
 * Interpolates between colors based on value (0-1)
 */
export function createSequentialScale(
	colorScheme: string[],
	domain: [number, number] = [0, 1]
): (value: number) => string {
	const [min, max] = domain;
	const range = max - min;

	return (value: number) => {
		// Normalize value to 0-1
		const normalized = Math.max(0, Math.min(1, (value - min) / range));

		// Map to color index
		const index = Math.floor(normalized * (colorScheme.length - 1));
		return colorScheme[index] || colorScheme[0] || "#808080";
	};
}

/**
 * Generate a categorical color scale
 * Maps category names to distinct colors
 */
export function createCategoricalScale(colorScheme: string[]): (category: string) => string {
	const categoryMap = new Map<string, string>();
	let nextIndex = 0;

	return (category: string) => {
		if (categoryMap.has(category)) {
			return categoryMap.get(category)!;
		}

		const color = colorScheme[nextIndex % colorScheme.length] || "#808080";
		categoryMap.set(category, color);
		nextIndex++;
		return color;
	};
}

/**
 * Generate a diverging color scale for data with a meaningful midpoint
 * Values below midpoint use first half of scheme, above use second half
 */
export function createDivergingScale(
	colorScheme: string[],
	domain: [number, number, number] = [0, 0.5, 1]
): (value: number) => string {
	const [min, mid, max] = domain;
	const lowRange = mid - min;
	const highRange = max - mid;
	const midIndex = Math.floor(colorScheme.length / 2);

	return (value: number) => {
		if (value <= mid) {
			// Use first half of scheme
			const normalized = Math.max(0, Math.min(1, (value - min) / lowRange));
			const index = Math.floor(normalized * midIndex);
			return colorScheme[index] || colorScheme[0] || "#808080";
		}

		// Use second half of scheme
		const normalized = Math.max(0, Math.min(1, (value - mid) / highRange));
		const index = midIndex + Math.floor(normalized * (colorScheme.length - midIndex - 1));
		return colorScheme[index] || colorScheme[colorScheme.length - 1] || "#808080";
	};
}

/**
 * Interpolate between two colors
 */
export function interpolateColor(color1: string, color2: string, factor: number): string {
	// Parse hex colors
	const c1 = parseInt(color1.slice(1), 16);
	const c2 = parseInt(color2.slice(1), 16);

	const r1 = (c1 >> 16) & 0xff;
	const g1 = (c1 >> 8) & 0xff;
	const b1 = c1 & 0xff;

	const r2 = (c2 >> 16) & 0xff;
	const g2 = (c2 >> 8) & 0xff;
	const b2 = c2 & 0xff;

	// Interpolate
	const r = Math.round(r1 + (r2 - r1) * factor);
	const g = Math.round(g1 + (g2 - g1) * factor);
	const b = Math.round(b1 + (b2 - b1) * factor);

	// Convert back to hex
	return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

/**
 * Create a custom color scheme by interpolating between multiple colors
 */
export function createCustomScheme(baseColors: string[], steps: number): string[] {
	const result: string[] = [];
	const segmentSteps = Math.floor(steps / (baseColors.length - 1));

	for (let i = 0; i < baseColors.length - 1; i++) {
		const color1 = baseColors[i]!;
		const color2 = baseColors[i + 1]!;

		for (let j = 0; j < segmentSteps; j++) {
			const factor = j / segmentSteps;
			result.push(interpolateColor(color1, color2, factor));
		}
	}

	// Add final color
	result.push(baseColors[baseColors.length - 1]!);

	return result;
}

/**
 * Lighten or darken a hex color
 */
export function adjustBrightness(color: string, percent: number): string {
	const num = parseInt(color.slice(1), 16);
	const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + percent));
	const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + percent));
	const b = Math.min(255, Math.max(0, (num & 0xff) + percent));

	return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

/**
 * Example: Using with @visx/scale (requires installation)
 *
 * ```tsx
 * import { scaleOrdinal } from '@visx/scale';
 * import { colorSchemes } from './color-scales';
 *
 * const colorScale = scaleOrdinal({
 *   domain: ['layer-0', 'layer-1', 'layer-2', 'layer-3'],
 *   range: colorSchemes.terminalBright,
 * });
 *
 * const color = colorScale('layer-1'); // Returns color for layer 1
 * ```
 */
export const visxIntegrationExample = `
import { scaleOrdinal, scaleLinear } from '@visx/scale';
import { colorSchemes } from '@repo/tui';

// Categorical scale
const categoryScale = scaleOrdinal({
  domain: ['A', 'B', 'C', 'D'],
  range: colorSchemes.category10,
});

// Sequential scale
const sequentialScale = scaleLinear({
  domain: [0, 100],
  range: colorSchemes.blues,
});
`;
