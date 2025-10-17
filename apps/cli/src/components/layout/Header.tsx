import { TextAttributes } from "@opentui/core";
import { theme } from "../../design/theme";

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
	const getStatusIcon = (status?: string) => {
		switch (status) {
			case "success": return "✓";
			case "warning": return "⚠";
			case "error": return "✗";
			case "info": return "ℹ";
			default: return "";
		}
	};

	const getStatusColor = (status?: string) => {
		switch (status) {
			case "success": return theme.colors.success;
			case "warning": return theme.colors.warning;
			case "error": return theme.colors.error;
			case "info": return theme.colors.info;
			default: return theme.colors.text.primary;
		}
	};

	return (
		<box
			style={{
				...theme.components.header,
				marginBottom: 2,
				alignItems: "center",
			}}
		>
			{/* Main title with icon */}
			<text
				style={{
					attributes: TextAttributes.BOLD,
					fg: theme.colors.accent.cyan,
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
						fg: theme.colors.text.primary,
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
