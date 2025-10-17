/**
 * Animated progress bar component
 * Shows progress with smooth animation and percentage display
 */

import { useProgressAnimation } from "../../hooks/useAnimations";
import { theme } from "../../design/theme";

interface ProgressBarProps {
	progress: number;
	duration?: number;
	showPercentage?: boolean;
	label?: string;
	color?: string;
	height?: number;
}

export function ProgressBar({
	progress,
	duration = 500,
	showPercentage = true,
	label,
	color = theme.colors.accent.cyan,
	height = 3,
}: ProgressBarProps) {
	const animatedProgress = useProgressAnimation(progress, duration);
	const percentage = Math.round(animatedProgress);

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
							width: `${percentage}%`,
							height: 1,
							backgroundColor: color,
						}}
					/>
				</box>

				{/* Percentage display */}
				{showPercentage && (
					<text style={{ fg: theme.colors.text.primary, width: 5 }}>
						{percentage}%
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
