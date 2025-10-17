import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useThemeColors } from "../styles/theme-system";

export interface SpinnerProps {
	/** Label/text to display next to spinner */
	label?: string;
	/** Whether the spinner is active (default: true) */
	isSpinning?: boolean;
	/** Animation speed in milliseconds (default: 80) */
	speed?: number;
	/** Color of the spinner */
	color?: string;
	/** Spinner type/style */
	type?: "dots" | "simple" | "bounce" | "pulse" | "arrow" | "clock";
}

const SPINNER_FRAMES = {
	dots: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
	simple: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
	bounce: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
	pulse: ["●", "○", "●", "○", "●", "○", "●", "○", "●", "○"],
	arrow: ["←", "↖", "↑", "↗", "→", "↘", "↓", "↙"],
	clock: ["🕐", "🕑", "🕒", "🕓", "🕔", "🕕", "🕖", "🕗", "🕘", "🕙", "🕚", "🕛"],
};

/**
 * Spinner component with animated loading indicator
 * Shows a smooth rotating spinner with optional label
 */
export function Spinner({
	label,
	isSpinning = true,
	speed = 80,
	color,
	type = "dots",
}: SpinnerProps): ReactNode {
	const colors = useThemeColors();
	const [frameIndex, setFrameIndex] = useState(0);
	const frames = SPINNER_FRAMES[type];

	useEffect(() => {
		if (!isSpinning) {
			setFrameIndex(0);
			return;
		}

		const interval = setInterval(() => {
			setFrameIndex((prev) => (prev + 1) % frames.length);
		}, speed);

		return () => clearInterval(interval);
	}, [isSpinning, speed, frames.length]);

	const spinnerFrame = frames[frameIndex] || frames[0];
	const spinnerColor = color || colors.accent.primary;

	return (
		<box style={{ flexDirection: "row", gap: 1, alignItems: "center" }}>
			<text style={{ fg: spinnerColor }}>{spinnerFrame}</text>
			{label && <text style={{ fg: colors.text.primary }}>{label}</text>}
		</box>
	);
}
