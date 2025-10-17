import { TextAttributes } from "@opentui/core";
import { useComponentStyles, useThemeColors } from "@repo/tui";

interface PendingChangesBoxProps {
	changes: Record<string, string>;
}

export function PendingChangesBox({ changes }: PendingChangesBoxProps) {
	const colors = useThemeColors();
	const componentStyles = useComponentStyles();
	const changeCount = Object.keys(changes).length;

	if (changeCount === 0) return null;

	return (
		<box
			style={{
				border: true,
				borderStyle: componentStyles.panel.borderStyle,
				padding: 1,
				marginTop: 1,
				backgroundColor: componentStyles.elevated.backgroundColor,
				flexDirection: "column",
			}}
		>
			<text
				style={{
					attributes: TextAttributes.BOLD,
					fg: colors.status.warning,
				}}
			>
				⚠ {changeCount} Pending Change{changeCount > 1 ? "s" : ""}
			</text>
			<text fg={colors.text.muted} style={{ marginTop: 1 }}>
				Press Ctrl+S to save, Ctrl+R to reset
			</text>
		</box>
	);
}
