import { TextAttributes } from "@opentui/core";
import { theme } from "../../design/theme";

type BadgeVariant = "primary" | "success" | "warning" | "error" | "info" | "accent";

interface BadgeProps {
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

const variantConfig: Record<
	BadgeVariant,
	{ bgColor: string; textColor: string; borderColor: string }
> = {
	primary: {
		bgColor: theme.colors.bg.mid,
		textColor: theme.colors.accent.cyan,
		borderColor: theme.colors.accent.cyan,
	},
	success: {
		bgColor: theme.colors.bg.dark,
		textColor: theme.colors.success,
		borderColor: theme.colors.success,
	},
	warning: {
		bgColor: theme.colors.bg.dark,
		textColor: theme.colors.warning,
		borderColor: theme.colors.warning,
	},
	error: {
		bgColor: theme.colors.bg.dark,
		textColor: theme.colors.error,
		borderColor: theme.colors.error,
	},
	info: {
		bgColor: theme.colors.bg.dark,
		textColor: theme.colors.info,
		borderColor: theme.colors.info,
	},
	accent: {
		bgColor: theme.colors.bg.dark,
		textColor: theme.colors.accent.purple,
		borderColor: theme.colors.accent.purple,
	},
};

/**
 * Enhanced badge component with better visual styling and variants
 * Used for displaying model tier, status, tags, or other indicators
 */
export function Badge({
	text,
	variant = "primary",
	bgColor: _bgColor,
	textColor,
	rounded = false,
	bold = false,
}: BadgeProps) {
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
