import { theme } from "../../design/theme";

interface ProgressBarProps {
	/** Label to display before the progress bar */
	label: string;
	/** Progress percentage (0-100) */
	percent: number;
	/** Optional custom width */
	width?: number;
}

/**
 * Visual progress bar for long operations
 * Shows a filled bar and percentage
 */
export function ProgressBar({
	label,
	percent,
	width = 30,
}: ProgressBarProps) {
	const filledWidth = Math.round((width * percent) / 100);
	const emptyWidth = width - filledWidth;

	const filledBar = "█".repeat(Math.max(0, filledWidth));
	const emptyBar = "░".repeat(Math.max(0, emptyWidth));
	const progressBar = `${filledBar}${emptyBar}`;

	return (
		<box style={{ flexDirection: "column", marginBottom: 2 }}>
			<box style={{ marginBottom: 1 }}>
				<text
					style={{
						fg: theme.colors.accent.cyan,
					}}
				>
					{label}
				</text>
				<text
					style={{
						fg: theme.colors.text.dim,
						marginLeft: 2,
					}}
				>
					{Math.round(percent)}%
				</text>
			</box>
			<box>
				<text
					style={{
						fg: theme.colors.accent.cyan,
					}}
				>
					{progressBar}
				</text>
			</box>
		</box>
	);
}
