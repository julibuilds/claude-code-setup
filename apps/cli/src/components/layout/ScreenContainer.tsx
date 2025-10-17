import { useTerminalDimensions } from "@opentui/react";
import { theme } from "../../design/theme";

interface ScreenContainerProps {
	children: React.ReactNode;
	/** Optional padding for content */
	padding?: number;
	/** Optional padding for width constraint */
	maxWidth?: number;
}

/**
 * Main screen container for all views
 * Handles terminal awareness and consistent padding
 */
export function ScreenContainer({
	children,
	padding = 2,
	maxWidth = 100,
}: ScreenContainerProps) {
	const { width, height } = useTerminalDimensions();

	return (
		<box
			style={{
				flexDirection: "column",
				width: Math.min(maxWidth, width - padding * 2),
				height: height - padding * 2,
				padding,
				backgroundColor: theme.colors.bg.dark,
			}}
		>
			{children}
		</box>
	);
}
