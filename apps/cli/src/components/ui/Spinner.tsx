/**
 * Loading spinner component
 * Shows animated loading indicator
 */

import { useSpinner } from "../../hooks/useAnimations";
import { theme } from "../../design/theme";

interface SpinnerProps {
	type?: "dots" | "simple" | "bounce" | "pulse" | "arrow" | "clock";
	speed?: number;
	color?: string;
	text?: string;
}

export function Spinner({
	type = "dots",
	speed = 100,
	color = theme.colors.accent.cyan,
	text,
}: SpinnerProps) {
	const frame = useSpinner(type, speed);

	return (
		<box style={{ flexDirection: "row", gap: 1, alignItems: "center" }}>
			<text style={{ fg: color }}>{frame}</text>
			{text && <text style={{ fg: theme.colors.text.primary }}>{text}</text>}
		</box>
	);
}
