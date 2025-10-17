import { TextAttributes } from "@opentui/core";
import type { ReactNode } from "react";
import { theme } from "../../design/theme";

type StatusType = "loading" | "success" | "error" | "warning" | "info" | "idle";

interface StatusBoxProps {
	/** Status type determines color and icon */
	status: StatusType;
	/** Main message to display */
	message?: string;
	/** Title for the status box */
	title?: string;
	/** Optional detailed information */
	details?: string;
	/** Optional custom icon */
	icon?: string;
	/** Optional children for custom content */
	children?: ReactNode;
}

const statusConfig: Record<
	StatusType,
	{ icon: string; color: string; componentStyle: Record<string, unknown> }
> = {
	success: {
		icon: "✓",
		color: theme.colors.success,
		componentStyle: theme.components.statusBoxSuccess,
	},
	error: {
		icon: "✗",
		color: theme.colors.error,
		componentStyle: theme.components.statusBoxError,
	},
	warning: {
		icon: "⚠",
		color: theme.colors.warning,
		componentStyle: theme.components.statusBoxWarning,
	},
	info: {
		icon: "ℹ",
		color: theme.colors.info,
		componentStyle: theme.components.statusBox,
	},
	loading: {
		icon: "⏳",
		color: theme.colors.accent.cyan,
		componentStyle: theme.components.statusBox,
	},
	idle: {
		icon: "",
		color: theme.colors.text.dim,
		componentStyle: theme.components.statusBox,
	},
};

/**
 * Reusable status box for displaying messages with visual state
 * Uses theme colors to indicate success, error, warning, info, loading, or idle
 * Consolidated from ui/StatusBox and common/StatusBox
 * 
 * Supports two modes:
 * 1. Simple mode: Pass message and details props
 * 2. Custom mode: Pass title and children for full control
 */
export function StatusBox({
	status,
	message,
	title,
	details,
	icon,
	children,
}: StatusBoxProps) {
	const config = statusConfig[status];
	const displayIcon = icon || config.icon;
	const displayTitle = title || message;

	return (
		<box
			style={{
				...config.componentStyle,
				marginTop: 2,
				marginBottom: 2,
			}}
		>
			{/* Title with icon */}
			{displayTitle && (
				<text
					style={{
						attributes: TextAttributes.BOLD,
						fg: config.color,
						marginBottom: (details || children) ? 1 : 0,
					}}
				>
					{displayIcon && `${displayIcon} `}
					{displayTitle}
				</text>
			)}

			{/* Details text */}
			{details && (
				<text 
					style={{
						fg: theme.colors.text.dim,
						marginTop: 0.5,
					}}
				>
					{details}
				</text>
			)}

			{/* Custom children content */}
			{children && (
				<box style={{ flexDirection: "column" }}>{children}</box>
			)}
		</box>
	);
}
