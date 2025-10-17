/**
 * Standard panel component with header, content, and optional footer
 * Provides consistent styling and focus management for UI sections
 */

import { TextAttributes } from "@opentui/core";
import type { ReactNode } from "react";
import { theme } from "../../design/theme";
import { Spinner } from "./Spinner";

interface PanelProps {
	title: string;
	children: ReactNode;
	footer?: string;
	focused?: boolean;
	loading?: boolean;
	status?: "idle" | "success" | "warning" | "error";
	width?: number | "auto" | `${number}%`;
	height?: number | "auto" | `${number}%`;
}

export function Panel({
	title,
	children,
	footer,
	focused = false,
	loading = false,
	status = "idle",
	width,
	height,
}: PanelProps) {
	const getBorderColor = () => {
		if (focused) return theme.colors.accent.cyan;
		if (status === "success") return theme.colors.success;
		if (status === "warning") return theme.colors.warning;
		if (status === "error") return theme.colors.error;
		return theme.colors.text.dim;
	};

	const getBackgroundColor = () => {
		if (focused) return theme.colors.bg.mid;
		return theme.colors.bg.dark;
	};

	return (
		<box
			style={{
				border: true,
				borderStyle: status === "error" ? "heavy" : "single",
				borderColor: getBorderColor(),
				backgroundColor: getBackgroundColor(),
				flexDirection: "column",
				padding: 2,
				width,
				height,
			}}
		>
			{/* Header */}
			<text
				style={{
					fg: theme.colors.accent.cyan,
					attributes: TextAttributes.BOLD,
					marginBottom: 1,
				}}
			>
				{title}
			</text>

			{/* Content */}
			<box
				style={{
					flexGrow: 1,
					flexShrink: 1,
					flexDirection: "column",
				}}
			>
				{loading ? <Spinner text="Loading..." /> : children}
			</box>

			{/* Footer */}
			{footer && (
				<text
					style={{
						fg: theme.colors.text.dim,
						attributes: TextAttributes.DIM,
						marginTop: 1,
					}}
				>
					{footer}
				</text>
			)}
		</box>
	);
}
