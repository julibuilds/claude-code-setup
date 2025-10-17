import type { ReactNode } from "react";
import { useComponentStyles } from "../styles/theme-system";

export interface CardProps {
	children: ReactNode;
	variant?: "default" | "elevated" | "panel";
	border?: boolean;
	borderStyle?: "single" | "double" | "rounded" | "heavy";
	padding?: number;
	width?: number | string;
	height?: number | string;
	backgroundColor?: string;
	borderColor?: string;
}

/**
 * Card component - A container with optional border and theming support.
 * Useful for grouping related content in a visually distinct container.
 */
export function Card({
	children,
	variant = "default",
	border,
	borderStyle,
	padding,
	width,
	height,
	backgroundColor,
	borderColor,
}: CardProps): ReactNode {
	const componentStyles = useComponentStyles();

	// Determine background color based on variant
	let variantBg: string;
	if (variant === "elevated") {
		variantBg = componentStyles.elevated.backgroundColor;
	} else if (variant === "panel") {
		variantBg = componentStyles.panel.backgroundColor;
	} else {
		variantBg = componentStyles.card.backgroundColor;
	}

	// Determine border style based on variant
	let variantBorderStyle: "single" | "double" | "rounded" | "heavy";
	if (variant === "elevated") {
		variantBorderStyle = componentStyles.elevated.borderStyle;
	} else if (variant === "panel") {
		variantBorderStyle = componentStyles.panel.borderStyle;
	} else {
		variantBorderStyle = componentStyles.card.borderStyle;
	}

	// Determine border enabled based on variant
	let variantBorder: boolean;
	if (variant === "elevated") {
		variantBorder = componentStyles.elevated.border;
	} else if (variant === "panel") {
		variantBorder = componentStyles.panel.border;
	} else {
		variantBorder = componentStyles.card.border;
	}

	// Determine padding based on variant
	let variantPadding: number;
	if (variant === "elevated") {
		variantPadding = componentStyles.elevated.padding;
	} else if (variant === "panel") {
		variantPadding = componentStyles.panel.padding;
	} else {
		variantPadding = componentStyles.card.padding;
	}

	const finalBorder = border ?? variantBorder;
	const finalBorderStyle = borderStyle ?? variantBorderStyle;
	const finalPadding = padding ?? variantPadding;
	const finalBg = backgroundColor ?? variantBg;
	const finalBorderColor = borderColor ?? componentStyles.card.borderColor;

	return (
		<box
			style={{
				backgroundColor: finalBg,
				padding: finalPadding,
				...(typeof width === "number" ? { width } : {}),
				...(typeof height === "number" ? { height } : {}),
			}}
			border={finalBorder}
			borderStyle={finalBorderStyle}
			borderColor={finalBorderColor}
		>
			{children}
		</box>
	);
}
