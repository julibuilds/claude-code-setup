import { TextAttributes } from "@opentui/core";
import { useComponentStyles, useThemeColors } from "@repo/tui";

interface HeaderProps {
	/** Header icon/emoji */
	icon?: string;
	/** Main title text */
	title: string;
	/** Subtitle/description text */
	subtitle?: string;
	/** Optional status indicator */
	status?: "success" | "warning" | "error" | "info";
	/** Optional status text */
	statusText?: string;
}

/**
 * Enhanced header component with better visual hierarchy and status indicators
 * Provides consistent branding and context with improved styling
 */
export function Header({ icon = "", title, subtitle, status, statusText }: HeaderProps) {
	const colors = useThemeColors();
	const componentStyles = useComponentStyles();

	const getStatusIcon = (status?: string) => {
		switch (status) {
			case "success":
				return "✓";
			case "warning":
				return "⚠";
			case "error":
				return "✗";
			case "info":
				return "ℹ";
			default:
				return "";
		}
	};

	const getStatusColor = (status?: string) => {
		switch (status) {
			case "success":
				return colors.status.success;
			case "warning":
				return colors.status.warning;
			case "error":
				return colors.status.error;
			case "info":
				return colors.status.info;
			default:
				return colors.text.primary;
		}
	};

	return (
		<box
			style={{
				marginBottom: 2,
				padding: 2,
				border: true,
				borderStyle: componentStyles.panel.borderStyle,
				borderColor: colors.accent.secondary,
				backgroundColor: componentStyles.panel.backgroundColor,
				flexDirection: "column",
				alignItems: "center",
			}}
		>
			{/* Main title with icon */}
			<text
				style={{
					attributes: TextAttributes.BOLD,
					fg: colors.accent.primary,
					marginBottom: subtitle ? 1 : 0,
					alignSelf: "center",
				}}
			>
				{icon ? `${icon} ${title}` : title}
			</text>

			{/* Subtitle */}
			{subtitle && (
				<text
					style={{
						fg: colors.text.primary,
						marginBottom: status ? 1 : 0,
						alignSelf: "center",
					}}
				>
					{subtitle}
				</text>
			)}

			{/* Status indicator */}
			{status && statusText && (
				<text
					style={{
						fg: getStatusColor(status),
						attributes: TextAttributes.BOLD,
						alignSelf: "center",
					}}
				>
					{getStatusIcon(status)} {statusText}
				</text>
			)}
		</box>
	);
}
