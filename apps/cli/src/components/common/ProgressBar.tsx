import { theme } from "../../design/theme";
import { useProgressAnimation } from "../../hooks/useProgressAnimation";

interface ProgressBarProps {
	/** Label to display before the progress bar */
	label: string;
	/** Progress percentage (0-100) */
	percent: number;
	/** Optional custom width */
	width?: number;
	/** Whether to animate progress changes (default: true) */
	animated?: boolean;
	/** Animation duration in milliseconds (default: 500) */
	duration?: number;
}

/**
 * Visual progress bar for long operations
 * Shows a filled bar and percentage with smooth animation
 * Uses OpenTUI Core Timeline for 60fps animations
 */
export function ProgressBar({
	label,
	percent,
	width = 30,
	animated = true,
	duration = 500,
}: ProgressBarProps) {
	// Use Core Timeline animation for smooth progress
	const animatedPercent = useProgressAnimation(percent, duration);
	const displayPercent = animated ? animatedPercent : percent;

	const filledWidth = Math.round((width * displayPercent) / 100);
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
					{Math.round(displayPercent)}%
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
