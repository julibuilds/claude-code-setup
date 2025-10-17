import { TextAttributes } from "@opentui/core";
import { theme } from "../../design/theme";

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
	const getPanelStyle = () => {
		if (focused) {
			return theme.components.panelFocused;
		}
		
		switch (variant) {
			case "accent":
				return { ...theme.borderStyles.accent, padding, flexDirection: "column" as const };
			case "success":
				return { ...theme.borderStyles.success, padding, flexDirection: "column" as const };
			case "warning":
				return { ...theme.borderStyles.warning, padding, flexDirection: "column" as const };
			case "error":
				return { ...theme.borderStyles.error, padding, flexDirection: "column" as const };
			default:
				return theme.components.panel;
		}
	};

	const getTitleColor = () => {
		if (focused) return theme.colors.accent.cyan;
		
		switch (variant) {
			case "success": return theme.colors.success;
			case "warning": return theme.colors.warning;
			case "error": return theme.colors.error;
			case "accent": return theme.colors.accent.purple;
			default: return theme.colors.text.primary;
		}
	};

	const getFocusIcon = () => {
		if (!focused || !showFocusIndicator) return "";
		switch (variant) {
			case "success": return "✓";
			case "warning": return "⚠";
			case "error": return "✗";
			default: return "▶";
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
