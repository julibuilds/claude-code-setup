import { TextAttributes } from "@opentui/core";
import { theme } from "../../../design/theme";

interface PendingChangesBoxProps {
	changes: Record<string, string>;
}

export function PendingChangesBox({ changes }: PendingChangesBoxProps) {
	const changeCount = Object.keys(changes).length;

	if (changeCount === 0) return null;

	return (
		<box
			style={{
				border: true,
				padding: 1,
				marginTop: 1,
				backgroundColor: theme.colors.bg.mid,
				flexDirection: "column",
			}}
		>
			<text
				style={{
					attributes: TextAttributes.BOLD,
					fg: theme.colors.warning,
				}}
			>
				⚠ {changeCount} Pending Change{changeCount > 1 ? "s" : ""}
			</text>
			<text fg={theme.colors.text.dim} style={{ marginTop: 1 }}>
				Press Ctrl+S to save, Ctrl+R to reset
			</text>
		</box>
	);
}
