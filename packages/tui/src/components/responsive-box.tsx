import { useTerminalDimensions } from "@opentui/react";
import { getLayoutMode, type LayoutMode, DEFAULT_BREAKPOINTS, type ResponsiveBreakpoints } from "../utils/responsive";

export interface ResponsiveBoxProps {
	children: React.ReactNode | ((mode: LayoutMode, width: number, height: number) => React.ReactNode);
	breakpoints?: ResponsiveBreakpoints;
	/** Fallback content when terminal is too narrow */
	fallback?: React.ReactNode;
	/** Minimum width before showing fallback */
	minWidth?: number;
}

/**
 * Responsive container that provides layout mode to children
 * Can render different content based on terminal size
 */
export function ResponsiveBox({
	children,
	breakpoints = DEFAULT_BREAKPOINTS,
	fallback,
	minWidth,
}: ResponsiveBoxProps) {
	const { width, height } = useTerminalDimensions();
	const mode = getLayoutMode(width, breakpoints);

	// Show fallback if terminal is too narrow
	if (minWidth && width < minWidth && fallback) {
		return <>{fallback}</>;
	}

	// If children is a function, call it with layout info
	if (typeof children === "function") {
		return <>{children(mode, width, height)}</>;
	}

	return <>{children}</>;
}
