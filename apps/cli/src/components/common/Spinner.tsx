import { theme } from "../../design/theme";
import { useSpinnerAnimation } from "../../hooks/useSpinnerAnimation";

interface SpinnerProps {
	/** Label to display next to spinner */
	label?: string;
	/** Whether the spinner is active (default: true) */
	isSpinning?: boolean;
	/** Animation speed in milliseconds (default: 80) */
	speed?: number;
	/** Color of the spinner (default: cyan) */
	color?: string;
}

/**
 * Animated spinner component using OpenTUI Core Timeline
 * Shows a smooth rotating spinner with optional label
 */
export function Spinner({
	label,
	isSpinning = true,
	speed = 80,
	color = theme.colors.accent.cyan,
}: SpinnerProps) {
	const spinnerFrame = useSpinnerAnimation(isSpinning, speed);

	return (
		<box style={{ flexDirection: "row", gap: 1 }}>
			<text style={{ fg: color }}>{spinnerFrame}</text>
			{label && <text style={{ fg: theme.colors.text.primary }}>{label}</text>}
		</box>
	);
}
