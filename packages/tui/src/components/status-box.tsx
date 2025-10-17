import { TextAttributes } from "@opentui/core";
import type { ReactNode } from "react";
import { useComponentStyles, useThemeColors } from "../styles/theme-system";

export type StatusType = "loading" | "success" | "error" | "warning" | "info" | "idle";

export interface StatusBoxProps {
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
	/** Optional padding override */
	padding?: number;
	/** Optional margin override */
	marginTop?: number;
	marginBottom?: number;
}

/**
 * StatusBox component for displaying messages with visual state
 * Uses theme colors to indicate success, error, warning, info, loading, or idle
 */
export function StatusBox({
	status,
	message,
	title,
	details,
	icon,
	children,
	padding = 2,
	marginTop = 2,
	marginBottom = 2,
}: StatusBoxProps): ReactNode {
	const colors = useThemeColors();
	const componentStyles = useComponentStyles();

	const statusConfig: Record<
		StatusType,
		{ icon: string; color: string; backgroundColor: string }
	> = {
		success: {
			icon: "✓",
			color: colors.status.success,
			backgroundColor: componentStyles.messageBox.success.backgroundColor,
		},
		error: {
			icon: "✗",
			color: colors.status.error,
			backgroundColor: componentStyles.messageBox.error.backgroundColor,
		},
		warning: {
			icon: "⚠",
			color: colors.status.warning,
			backgroundColor: componentStyles.messageBox.warning.backgroundColor,
		},
		info: {
			icon: "ℹ",
			color: colors.status.info,
			backgroundColor: componentStyles.messageBox.info.backgroundColor,
		},
		loading: {
			icon: "⏳",
			color: colors.accent.primary,
			backgroundColor: componentStyles.card.backgroundColor,
		},
		idle: {
			icon: "",
			color: colors.text.muted,
			backgroundColor: componentStyles.card.backgroundColor,
		},
	};

	const config = statusConfig[status];
	const displayIcon = icon || config.icon;
	const displayTitle = title || message;

	return (
		<box
			style={{
				padding,
				marginTop,
				marginBottom,
				border: true,
				borderStyle: status === "error" ? "heavy" : "single",
				borderColor: config.color,
				backgroundColor: config.backgroundColor,
				flexDirection: "column",
			}}
		>
			{displayTitle && (
				<text
					style={{
						attributes: TextAttributes.BOLD,
						fg: config.color,
						marginBottom: details || children ? 1 : 0,
					}}
				>
					{displayIcon && `${displayIcon} `}
					{displayTitle}
				</text>
			)}

			{details && (
				<text
					style={{
						fg: colors.text.muted,
						marginTop: 0.5,
					}}
				>
					{details}
				</text>
			)}

			{children && <box style={{ flexDirection: "column" }}>{children}</box>}
		</box>
	);
}
