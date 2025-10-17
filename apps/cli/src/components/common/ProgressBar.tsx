import { theme } from "../../design/theme";
import { useProgressAnimation } from "../../hooks/useProgressAnimation";

interface ProgressBarProps {
	/** Label to display before/above the progress bar */
	label?: string;
	/** Progress percentage (0-100) */
	percent?: number;
	progress?: number; // Alias for percent for backward compatibility
	/** Optional custom width (character-based bar) */
	width?: number;
	/** Whether to animate progress changes (default: true) */
	animated?: boolean;
	/** Animation duration in milliseconds (default: 500) */
	duration?: number;
	/** Show percentage text (default: true) */
	showPercentage?: boolean;
	/** Custom color for the progress bar */
	color?: string;
	/** Height for box-style progress bar (if provided, uses box style instead of character-based) */
	height?: number;
}

/**
 * Visual progress bar for long operations
 * Shows a filled bar and percentage with smooth animation
 * Consolidated from ui/ProgressBar and common/ProgressBar
 * 
 * Supports two styles:
 * 1. Character-based (default): Uses █ and ░ characters
 * 2. Box-based (when height is provided): Uses box components with borders
 */
export function ProgressBar({
	label,
	percent,
	progress,
	width = 30,
	animated = true,
	duration = 500,
	showPercentage = true,
	color = theme.colors.accent.cyan,
	height,
}: ProgressBarProps) {
	const displayProgress = percent ?? progress ?? 0;
	const animatedPercent = useProgressAnimation(displayProgress, duration);
	const displayPercent = animated ? animatedPercent : displayProgress;
	const roundedPercent = Math.round(displayPercent);

	// Box-style progress bar (when height is provided)
	if (height) {
		return (
			<box
				style={{
					height,
					border: true,
					borderStyle: "single",
					borderColor: theme.colors.text.dim,
					backgroundColor: theme.colors.bg.dark,
					flexDirection: "column",
					padding: 1,
				}}
			>
				<box style={{ flexDirection: "row", alignItems: "center", gap: 1 }}>
					{/* Progress bar fill */}
					<box
						style={{
							flexGrow: 1,
							height: 1,
							backgroundColor: theme.colors.bg.mid,
							flexDirection: "row",
						}}
					>
						<box
							style={{
								width: `${roundedPercent}%`,
								height: 1,
								backgroundColor: color,
							}}
						/>
					</box>

					{/* Percentage display */}
					{showPercentage && (
						<text style={{ fg: theme.colors.text.primary, width: 5 }}>
							{roundedPercent}%
						</text>
					)}
				</box>

				{/* Optional label */}
				{label && (
					<text
						style={{
							fg: theme.colors.text.dim,
							marginTop: 1,
						}}
					>
						{label}
					</text>
				)}
			</box>
		);
	}

	// Character-based progress bar (default)
	const filledWidth = Math.round((width * displayPercent) / 100);
	const emptyWidth = width - filledWidth;

	const filledBar = "█".repeat(Math.max(0, filledWidth));
	const emptyBar = "░".repeat(Math.max(0, emptyWidth));
	const progressBar = `${filledBar}${emptyBar}`;

	return (
		<box style={{ flexDirection: "column", marginBottom: 2 }}>
			{(label || showPercentage) && (
				<box style={{ marginBottom: 1, flexDirection: "row", gap: 2 }}>
					{label && (
						<text style={{ fg: color }}>
							{label}
						</text>
					)}
					{showPercentage && (
						<text style={{ fg: theme.colors.text.dim }}>
							{roundedPercent}%
						</text>
					)}
				</box>
			)}
			<box>
				<text style={{ fg: color }}>
					{progressBar}
				</text>
			</box>
		</box>
	);
}
