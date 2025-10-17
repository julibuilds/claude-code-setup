import { TextAttributes } from "@opentui/core";
import { useComponentStyles, useThemeColors } from "@repo/tui";

interface StatusOverlayProps {
	type: "loading" | "saving";
	width: number;
	height: number;
	pendingChangesCount?: number;
}

export function StatusOverlay({
	type,
	width,
	height,
	pendingChangesCount = 0,
}: StatusOverlayProps) {
	const colors = useThemeColors();
	const componentStyles = useComponentStyles();

	const isLoading = type === "loading";
	const icon = isLoading ? "⏳" : "💾";
	const title = isLoading ? "Loading OpenRouter Models" : "Saving Configuration";
	const message = isLoading
		? "Fetching model list from API..."
		: "Writing changes to config.json...";
	const detail = isLoading
		? "This may take a few seconds"
		: `${pendingChangesCount} router(s) being updated`;
	const color = isLoading ? colors.accent.primary : colors.status.success;

	return (
		<box
			style={{
				flexDirection: "column",
				padding: 2,
				width: Math.min(60, width - 4),
				height: height - 4,
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<box
				style={{
					border: true,
					borderStyle: componentStyles.panel.borderStyle,
					padding: 3,
					backgroundColor: componentStyles.panel.backgroundColor,
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				<text
					style={{
						attributes: TextAttributes.BOLD,
						fg: color,
						marginBottom: 2,
					}}
				>
					{icon} {title}
				</text>
				<text fg={colors.text.primary}>{message}</text>
				<text fg={colors.text.muted} style={{ marginTop: 1 }}>
					{detail}
				</text>
			</box>
		</box>
	);
}
