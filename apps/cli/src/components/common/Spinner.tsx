import { theme } from "../../design/theme";
import { useSpinnerAnimation } from "../../hooks/useSpinnerAnimation";

interface SpinnerProps {
	/** Label/text to display next to spinner */
	label?: string;
	text?: string; // Alias for label for backward compatibility
	/** Whether the spinner is active (default: true) */
	isSpinning?: boolean;
	/** Animation speed in milliseconds (default: 80) */
	speed?: number;
	/** Color of the spinner (default: cyan) */
	color?: string;
}

/**
 * Animated spinner component
 * Shows a smooth rotating spinner with optional label
 * Consolidated from ui/Spinner and common/Spinner
 */
export function Spinner({
	label,
	text,
	isSpinning = true,
	speed = 80,
	color = theme.colors.accent.cyan,
}: SpinnerProps) {
	const spinnerFrame = useSpinnerAnimation(isSpinning, speed);
	const displayText = label || text;

	return (
		<box style={{ flexDirection: "row", gap: 1, alignItems: "center" }}>
			<text style={{ fg: color }}>{spinnerFrame}</text>
			{displayText && <text style={{ fg: theme.colors.text.primary }}>{displayText}</text>}
		</box>
	);
}
