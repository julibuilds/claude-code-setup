import { TextAttributes } from "@opentui/core";
import type { ReactNode } from "react";
import { useThemeColors } from "../styles/theme-system";

export type BadgeVariant = "primary" | "success" | "warning" | "error" | "info" | "accent";

export interface BadgeProps {
	/** Badge text content */
	text: string;
	/** Visual variant determines color */
	variant?: BadgeVariant;
	/** Optional custom background color */
	bgColor?: string;
	/** Optional custom text color */
	textColor?: string;
	/** Whether to use rounded brackets */
	rounded?: boolean;
	/** Whether to make the badge bold */
	bold?: boolean;
}

/**
 * Badge component for displaying status, tags, or indicators
 * Used for model tier, status, tags, or other visual indicators
 */
export function Badge({
	text,
	variant = "primary",
	bgColor: _bgColor,
	textColor,
	rounded = false,
	bold = false,
}: BadgeProps): ReactNode {
	const colors = useThemeColors();

	const variantConfig: Record<BadgeVariant, { textColor: string }> = {
		primary: { textColor: colors.accent.primary },
		success: { textColor: colors.status.success },
		warning: { textColor: colors.status.warning },
		error: { textColor: colors.status.error },
		info: { textColor: colors.status.info },
		accent: { textColor: colors.accent.secondary },
	};

	const config = variantConfig[variant];
	const brackets = rounded ? "()" : "[]";

	return (
		<text
			style={{
				fg: textColor || config.textColor,
				attributes: bold ? TextAttributes.BOLD : 0,
			}}
		>
			{`${brackets[0]}${text}${brackets[1]}`}
		</text>
	);
}
