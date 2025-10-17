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
				...config.componentStyle,
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
		</box>
	);
}
