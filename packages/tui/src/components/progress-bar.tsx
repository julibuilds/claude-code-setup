import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useComponentStyles, useThemeColors } from "../styles/theme-system";

export interface ProgressBarProps {
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
	color,
	height,
}: ProgressBarProps): ReactNode {
	const colors = useThemeColors();
	const componentStyles = useComponentStyles();
	
	const displayProgress = percent ?? progress ?? 0;
	const [animatedPercent, setAnimatedPercent] = useState(displayProgress);

	useEffect(() => {
		if (!animated) {
			setAnimatedPercent(displayProgress);
			return;
		}

		const startValue = animatedPercent;
		const endValue = displayProgress;
		const startTime = Date.now();

		const animate = () => {
			const elapsed = Date.now() - startTime;
			const progress = Math.min(elapsed / duration, 1);
			
			// Ease out quad
			const eased = 1 - (1 - progress) * (1 - progress);
			const current = startValue + (endValue - startValue) * eased;
			
			setAnimatedPercent(current);

			if (progress < 1) {
				requestAnimationFrame(animate);
			}
		};

		requestAnimationFrame(animate);
	}, [displayProgress, animated, duration]);

	const displayPercent = animated ? animatedPercent : displayProgress;
	const roundedPercent = Math.round(displayPercent);
	const barColor = color || colors.accent.primary;

	// Box-style progress bar (when height is provided)
	if (height) {
		return (
			<box
				style={{
					height,
					border: true,
					borderStyle: "single",
					borderColor: colors.border.default,
					backgroundColor: componentStyles.card.backgroundColor,
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
							backgroundColor: componentStyles.slider.track.backgroundColor,
							flexDirection: "row",
						}}
					>
						<box
							style={{
								width: `${roundedPercent}%`,
								height: 1,
								backgroundColor: barColor,
							}}
						/>
					</box>

					{/* Percentage display */}
					{showPercentage && (
						<text style={{ fg: colors.text.primary, width: 5 }}>
							{roundedPercent}%
						</text>
					)}
				</box>

				{/* Optional label */}
				{label && (
					<text
						style={{
							fg: colors.text.muted,
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

	const filledBar = componentStyles.stats.progressChar.repeat(Math.max(0, filledWidth));
	const emptyBar = componentStyles.stats.emptyChar.repeat(Math.max(0, emptyWidth));
	const progressBar = `${filledBar}${emptyBar}`;

	return (
		<box style={{ flexDirection: "column", marginBottom: 2 }}>
			{(label || showPercentage) && (
				<box style={{ marginBottom: 1, flexDirection: "row", gap: 2 }}>
					{label && <text style={{ fg: barColor }}>{label}</text>}
					{showPercentage && (
						<text style={{ fg: colors.text.muted }}>{roundedPercent}%</text>
					)}
				</box>
			)}
			<box>
				<text style={{ fg: barColor }}>{progressBar}</text>
			</box>
		</box>
	);
}
