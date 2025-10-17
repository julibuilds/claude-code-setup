import { useTerminalDimensions } from "@opentui/react";
import {
	getLayoutMode as getMode,
	getResponsivePadding,
	getResponsiveGap,
	type LayoutMode,
	type ResponsiveBreakpoints,
	DEFAULT_BREAKPOINTS,
} from "@repo/tui";

/**
 * Hook for responsive layout based on terminal width
 * Returns layout mode, dimensions, and responsive values
 */
export function useResponsiveLayout(
	breakpoints: ResponsiveBreakpoints = DEFAULT_BREAKPOINTS
) {
	const { width, height } = useTerminalDimensions();
	const layoutMode = getMode(width, breakpoints);

	return {
		width,
		height,
		layoutMode,
		isWide: layoutMode === "wide",
		isMedium: layoutMode === "medium",
		isNarrow: layoutMode === "narrow",
		padding: getResponsivePadding(layoutMode),
		gap: getResponsiveGap(layoutMode),
	};
}
