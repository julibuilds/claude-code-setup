import { useTerminalDimensions } from "@opentui/react";
import { TextAttributes } from "@opentui/core";
import { useThemeColors } from "../styles/theme-hooks";

export interface MinimumSizeWarningProps {
	minWidth?: number;
	minHeight?: number;
	children: React.ReactNode;
}

/**
 * Component that displays a warning when terminal is too small
 * and renders children when terminal meets minimum requirements
 */
export function MinimumSizeWarning({
	minWidth = 50,
	minHeight = 20,
	children,
}: MinimumSizeWarningProps) {
	const { width, height } = useTerminalDimensions();
	const colors = useThemeColors();

	const isTooSmall = width < minWidth || height < minHeight;

	if (!isTooSmall) {
		return <>{children}</>;
	}

	return (
		<box
			style={{
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				width: "100%",
				height: "100%",
				padding: 2,
			}}
		>
			<text
				style={{
					fg: colors.status.warning,
					attributes: TextAttributes.BOLD,
					marginBottom: 1,
				}}
			>
				⚠ Terminal Too Small
			</text>
			<text style={{ fg: colors.text.muted, marginBottom: 1 }}>
				Minimum size: {minWidth}x{minHeight}
			</text>
			<text style={{ fg: colors.text.muted }}>
				Current: {width}x{height}
			</text>
			<text style={{ fg: colors.text.dim, marginTop: 2 }}>
				Please resize your terminal window
			</text>
		</box>
	);
}
