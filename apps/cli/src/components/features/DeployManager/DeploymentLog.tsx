import { TextAttributes } from "@opentui/core";
import { useComponentStyles, useThemeColors } from "@repo/tui";

interface LogEntry {
	id: string;
	text: string;
	timestamp?: string;
}

interface DeploymentLogProps {
	entries: LogEntry[];
	error?: string | null;
	height: number;
}

export function DeploymentLog({ entries, error, height }: DeploymentLogProps) {
	const colors = useThemeColors();
	const componentStyles = useComponentStyles();

	return (
		<scrollbox
			style={{
				rootOptions: {
					height,
					border: true,
					backgroundColor: componentStyles.elevated.backgroundColor,
				},
				wrapperOptions: { backgroundColor: componentStyles.elevated.backgroundColor },
				viewportOptions: { backgroundColor: componentStyles.panel.backgroundColor },
				scrollbarOptions: { showArrows: true },
			}}
			focused
		>
			<box style={{ flexDirection: "column", padding: 2 }}>
				{entries.map((item) => {
					const isSuccess = item.text.startsWith("✓");
					const isWarning = item.text.startsWith("⚠");
					const isError = item.text.toLowerCase().includes("error");
					const isEmpty = item.text.trim() === "";

					const color = isSuccess
						? colors.status.success
						: isWarning
							? colors.status.warning
							: isError
								? colors.status.error
								: colors.status.info;

					return (
						<text key={item.id} fg={color}>
							{isEmpty ? " " : item.text}
						</text>
					);
				})}
				{error && (
					<box
						style={{
							marginTop: 1,
							padding: 1,
							border: true,
							backgroundColor: componentStyles.panel.backgroundColor,
						}}
					>
						<text
							style={{
								attributes: TextAttributes.BOLD,
								fg: colors.status.error,
							}}
						>
							❌ Error: {error}
						</text>
					</box>
				)}
			</box>
		</scrollbox>
	);
}
