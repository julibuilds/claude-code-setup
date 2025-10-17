import { TextAttributes } from "@opentui/core";
import { theme } from "../../../design/theme";

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
	return (
		<scrollbox
			style={{
				rootOptions: {
					height,
					border: true,
					backgroundColor: theme.colors.bg.mid,
				},
				wrapperOptions: { backgroundColor: theme.colors.bg.mid },
				viewportOptions: { backgroundColor: theme.colors.bg.dark },
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
						? theme.colors.success
						: isWarning
							? theme.colors.warning
							: isError
								? theme.colors.error
								: theme.colors.info;

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
							backgroundColor: theme.colors.bg.dark,
						}}
					>
						<text
							style={{
								attributes: TextAttributes.BOLD,
								fg: theme.colors.error,
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
