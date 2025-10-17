import { theme } from "../../design/theme";

type BadgeVariant = "primary" | "success" | "warning" | "error" | "info";

interface BadgeProps {
	/** Badge text content */
	text: string;
	/** Visual variant determines color */
	variant?: BadgeVariant;
	/** Optional custom background color */
	bgColor?: string;
	/** Optional custom text color */
	textColor?: string;
}

const variantConfig: Record<
	BadgeVariant,
	{ bgColor: string; textColor: string }
> = {
	primary: {
		bgColor: theme.colors.bg.mid,
		textColor: theme.colors.accent.cyan,
	},
	success: {
		bgColor: theme.colors.bg.mid,
		textColor: theme.colors.success,
	},
	warning: {
		bgColor: theme.colors.bg.mid,
		textColor: theme.colors.warning,
	},
	error: {
		bgColor: theme.colors.bg.mid,
		textColor: theme.colors.error,
	},
	info: {
		bgColor: theme.colors.bg.mid,
		textColor: theme.colors.info,
	},
};

/**
 * Small badge component for displaying model tier, status, or tags
 * Typically used inline with other text
 */
export function Badge({
	text,
	variant = "primary",
	bgColor,
	textColor,
}: BadgeProps) {
	const config = variantConfig[variant];

	return (
		<text
			style={{
				fg: textColor || config.textColor,
			}}
		>
			{`[${text}]`}
		</text>
	);
}
