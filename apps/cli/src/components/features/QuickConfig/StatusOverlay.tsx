import { TextAttributes } from "@opentui/core";
import { theme } from "../../../design/theme";

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
	const isLoading = type === "loading";
	const icon = isLoading ? "⏳" : "💾";
	const title = isLoading ? "Loading OpenRouter Models" : "Saving Configuration";
	const message = isLoading
		? "Fetching model list from API..."
		: "Writing changes to config.json...";
	const detail = isLoading
		? "This may take a few seconds"
		: `${pendingChangesCount} router(s) being updated`;
	const color = isLoading ? theme.colors.accent.cyan : theme.colors.success;

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
					padding: 3,
					backgroundColor: theme.colors.bg.dark,
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
				<text fg={theme.colors.text.primary}>{message}</text>
				<text fg={theme.colors.text.dim} style={{ marginTop: 1 }}>
					{detail}
				</text>
			</box>
		</box>
	);
}
