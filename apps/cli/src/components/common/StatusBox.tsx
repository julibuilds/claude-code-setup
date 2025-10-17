import { TextAttributes } from "@opentui/core";
import { theme } from "../../design/theme";

type StatusType = "loading" | "success" | "error" | "warning" | "info";

interface StatusBoxProps {
	/** Status type determines color and icon */
	status: StatusType;
	/** Main message to display */
	message: string;
	/** Optional detailed information */
	details?: string;
	/** Optional custom icon */
	icon?: string;
}

const statusConfig: Record<
	StatusType,
	{ icon: string; color: string; bgColor: string }
> = {
	success: {
		icon: "✓",
		color: theme.colors.success,
		bgColor: theme.colors.bg.dark,
	},
	error: {
		icon: "✗",
		color: theme.colors.error,
		bgColor: theme.colors.bg.dark,
	},
	warning: {
		icon: "⚠",
		color: theme.colors.warning,
		bgColor: theme.colors.bg.dark,
	},
	info: {
		icon: "ℹ",
		color: theme.colors.info,
		bgColor: theme.colors.bg.dark,
	},
	loading: {
		icon: "⏳",
		color: theme.colors.accent.cyan,
		bgColor: theme.colors.bg.dark,
	},
};

/**
 * Reusable status box for displaying messages with visual state
 * Uses theme colors to indicate success, error, warning, info, or loading
 */
export function StatusBox({
	status,
	message,
	details,
	icon,
}: StatusBoxProps) {
	const config = statusConfig[status];
	const displayIcon = icon || config.icon;

	return (
		<box
			style={{
				...theme.components.statusBox,
				backgroundColor: config.bgColor,
				flexDirection: "column",
				marginTop: 2,
				marginBottom: 2,
			}}
		>
			<text
				style={{
					attributes: TextAttributes.BOLD,
					fg: config.color,
					marginBottom: details ? 1 : 0,
				}}
			>
				{displayIcon} {message}
			</text>
			{details && <text fg={theme.colors.text.dim}>{details}</text>}
		</box>
	);
}
