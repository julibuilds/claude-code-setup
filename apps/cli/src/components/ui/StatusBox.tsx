/**
 * Status box component for displaying messages with status indicators
 * Supports success, warning, error, and info states
 */

import { TextAttributes } from "@opentui/core";
import type { ReactNode } from "react";
import { theme } from "../../design/theme";

interface StatusBoxProps {
	status: "success" | "warning" | "error" | "info" | "idle";
	title?: string;
	children: ReactNode;
	icon?: string;
}

export function StatusBox({ status, title, children, icon }: StatusBoxProps) {
	const getStatusColor = () => {
		switch (status) {
			case "success":
				return theme.colors.success;
			case "warning":
				return theme.colors.warning;
			case "error":
				return theme.colors.error;
			case "info":
				return theme.colors.info;
			default:
				return theme.colors.text.dim;
		}
	};

	const getBorderStyle = () => {
		return status === "error" ? "heavy" : "single";
	};

	const getDefaultIcon = () => {
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

	const displayIcon = icon || getDefaultIcon();

	return (
		<box
			style={{
				padding: 2,
				border: true,
				borderStyle: getBorderStyle(),
				borderColor: getStatusColor(),
				backgroundColor: theme.colors.bg.dark,
				flexDirection: "column",
			}}
		>
			{/* Title with icon */}
			{title && (
				<text
					style={{
						attributes: TextAttributes.BOLD,
						fg: getStatusColor(),
						marginBottom: 1,
					}}
				>
					{displayIcon && `${displayIcon} `}
					{title}
				</text>
			)}

			{/* Content */}
			<box style={{ flexDirection: "column" }}>{children}</box>
		</box>
	);
}
