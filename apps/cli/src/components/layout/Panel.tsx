import { TextAttributes } from "@opentui/core";
import { useComponentStyles, useThemeColors } from "@repo/tui";

interface PanelProps {
	/** Panel title */
	title?: string;
	/** Panel content */
	children: React.ReactNode;
	/** Whether this panel has focus */
	focused?: boolean;
	/** Height of the panel (if not using flex) */
	height?: number;
	/** Width of the panel (if not using flex), "auto" for flexGrow */
	width?: number | "auto";
	/** Optional custom border color */
	borderColor?: string;
	/** Optional padding override */
	padding?: number;
	/** Panel variant for different styling */
	variant?: "standard" | "accent" | "success" | "warning" | "error";
	/** Show focus indicator */
	showFocusIndicator?: boolean;
}

/**
 * Enhanced bordered panel component with better visual styling
 * Used for creating consistent sections in multi-panel layouts with improved focus states
 */
export function Panel({
	title,
	children,
	focused = false,
	height,
	width,
	borderColor,
	padding = 2,
	variant = "standard",
	showFocusIndicator = true,
}: PanelProps) {
	const colors = useThemeColors();
	const componentStyles = useComponentStyles();

	const getPanelStyle = () => {
		// Increase padding for better breathing room
		const effectivePadding = Math.max(padding, 1);
		
		const baseStyle = {
			border: true,
			borderStyle: componentStyles.panel.borderStyle,
			padding: effectivePadding,
			flexDirection: "column" as const,
		};

		// Focused state takes priority
		if (focused) {
			return {
				...baseStyle,
				borderColor: colors.panelState?.active || colors.border.focus,
				backgroundColor: componentStyles.elevated.backgroundColor,
			};
		}

		// Variant-based styling
		switch (variant) {
			case "accent":
				return {
					...baseStyle,
					borderColor: colors.accent.secondary,
					backgroundColor: componentStyles.panel.backgroundColor,
				};
			case "success":
				return {
					...baseStyle,
					borderColor: colors.panelState?.success || colors.status.success,
					backgroundColor: componentStyles.panel.backgroundColor,
				};
			case "warning":
				return {
					...baseStyle,
					borderColor: colors.panelState?.warning || colors.status.warning,
					backgroundColor: componentStyles.panel.backgroundColor,
				};
			case "error":
				return {
					...baseStyle,
					borderColor: colors.panelState?.error || colors.status.error,
					backgroundColor: componentStyles.panel.backgroundColor,
				};
			default:
				return {
					...baseStyle,
					borderColor: colors.panelState?.inactive || colors.border.default,
					backgroundColor: componentStyles.panel.backgroundColor,
				};
		}
	};

	const getTitleColor = () => {
		if (focused) return colors.accent.primary;

		switch (variant) {
			case "success":
				return colors.status.success;
			case "warning":
				return colors.status.warning;
			case "error":
				return colors.status.error;
			case "accent":
				return colors.accent.secondary;
			default:
				return colors.text.primary;
		}
	};

	const getFocusIcon = () => {
		if (!focused || !showFocusIndicator) return "";
		switch (variant) {
			case "success":
				return "✓";
			case "warning":
				return "⚠";
			case "error":
				return "✗";
			default:
				return "▶";
		}
	};

	return (
		<box
			style={{
				...getPanelStyle(),
				height,
				width,
				...(borderColor && { borderColor }),
			}}
		>
			{title && (
				<text
					style={{
						attributes: TextAttributes.BOLD,
						fg: getTitleColor(),
						marginBottom: 1,
					}}
				>
					{getFocusIcon()} {title}
				</text>
			)}
			<box style={{ flexDirection: "column", flexGrow: 1 }}>{children}</box>
		</box>
	);
}
