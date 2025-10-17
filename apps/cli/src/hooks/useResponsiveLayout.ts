import { useTerminalDimensions } from "@opentui/react";

export type LayoutMode = "wide" | "medium" | "narrow";

export interface ResponsiveBreakpoints {
	wide: number;
	medium: number;
}

const DEFAULT_BREAKPOINTS: ResponsiveBreakpoints = {
	wide: 80,
	medium: 60,
};

/**
 * Hook for responsive layout based on terminal width
 * Returns layout mode and dimensions
 */
export function useResponsiveLayout(
	breakpoints: ResponsiveBreakpoints = DEFAULT_BREAKPOINTS
) {
	const { width, height } = useTerminalDimensions();

	const getLayoutMode = (): LayoutMode => {
		if (width >= breakpoints.wide) return "wide";
		if (width >= breakpoints.medium) return "medium";
		return "narrow";
	};

	const layoutMode = getLayoutMode();

	return {
		width,
		height,
		layoutMode,
		isWide: layoutMode === "wide",
		isMedium: layoutMode === "medium",
		isNarrow: layoutMode === "narrow",
	};
}
