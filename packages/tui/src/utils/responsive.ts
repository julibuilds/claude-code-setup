/**
 * Responsive utilities for terminal UIs
 */

export interface ResponsiveBreakpoints {
	wide: number;
	medium: number;
	narrow: number;
}

export const DEFAULT_BREAKPOINTS: ResponsiveBreakpoints = {
	wide: 100,
	medium: 70,
	narrow: 50,
};

export type LayoutMode = "wide" | "medium" | "narrow";

/**
 * Get layout mode based on terminal width
 */
export function getLayoutMode(
	width: number,
	breakpoints: ResponsiveBreakpoints = DEFAULT_BREAKPOINTS
): LayoutMode {
	if (width >= breakpoints.wide) return "wide";
	if (width >= breakpoints.medium) return "medium";
	return "narrow";
}

/**
 * Truncate text with ellipsis based on max width
 */
export function truncateText(text: string, maxWidth: number): string {
	if (text.length <= maxWidth) return text;
	return text.slice(0, maxWidth - 3) + "...";
}

/**
 * Calculate responsive padding based on layout mode
 */
export function getResponsivePadding(mode: LayoutMode): number {
	switch (mode) {
		case "wide":
			return 3;
		case "medium":
			return 2;
		case "narrow":
			return 1;
	}
}

/**
 * Calculate responsive gap based on layout mode
 */
export function getResponsiveGap(mode: LayoutMode): number {
	switch (mode) {
		case "wide":
			return 2;
		case "medium":
			return 1;
		case "narrow":
			return 1;
	}
}

/**
 * Get responsive panel heights for multi-panel layouts
 */
export interface PanelHeightConfig {
	header: number;
	footer: number;
	availableHeight: number;
}

export function calculatePanelHeights(
	totalHeight: number,
	headerHeight: number = 5,
	footerHeight: number = 4
): PanelHeightConfig {
	const availableHeight = Math.max(10, totalHeight - headerHeight - footerHeight - 4);
	return {
		header: headerHeight,
		footer: footerHeight,
		availableHeight,
	};
}
