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
				borderColor: colors.status.warning,
				padding: 2,
				marginTop: 1,
				backgroundColor: componentStyles.messageBox.warning.backgroundColor,
				flexDirection: "column",
			}}
		>
			<text
				style={{
					attributes: TextAttributes.BOLD,
					fg: colors.status.warning,
					marginBottom: 1,
				}}
			>
				⚠️  {changeCount} Pending Change{changeCount > 1 ? "s" : ""} - Not Saved
			</text>
			
			{/* Show what's changed */}
			<box style={{ flexDirection: "column", marginBottom: 1 }}>
				{Object.entries(changes).map(([key, value]) => (
					<text
						key={key}
						style={{
							fg: colors.text.primary,
							marginBottom: 0.5,
						}}
					>
						→ {key}: {value.split(",")[1]}
					</text>
				))}
			</box>

			<text 
				style={{
					fg: colors.accent.primary,
					attributes: TextAttributes.BOLD,
				}}
			>
				Press Ctrl+S to save • Ctrl+R to reset
			</text>
		</box>
	);
}
