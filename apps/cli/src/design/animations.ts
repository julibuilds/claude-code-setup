/**
 * Animation constants and presets for OpenTUI React
 * Use with hooks from ../hooks/useAnimations.ts
 */

import { theme } from "./theme";

/**
 * Spinner frame sequences for different animation styles
 * Used by useSpinner hook
 */
export const spinnerFrames = {
	/** Standard dots spinner */
	dots: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],

	/** Simple dots */
	simple: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],

	/** Bouncing dots */
	bounce: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],

	/** Pulse effect */
	pulse: ["●", "○", "●", "○", "●", "○", "●", "○", "●", "○"],

	/** Arrow spinner */
	arrow: ["←", "↖", "↑", "↗", "→", "↘", "↓", "↙"],

	/** Clock spinner */
	clock: ["🕐", "🕑", "🕒", "🕓", "🕔", "🕕", "🕖", "🕗", "🕘", "🕙", "🕚", "🕛"],
};

/**
 * Get spinner frames by name
 */
export function getSpinnerFrames(
	type: keyof typeof spinnerFrames = "dots",
): string[] {
	return spinnerFrames[type];
}

/**
 * Animation presets for common UI patterns
 * Use these with animation hooks for consistent timing
 */
export const animationPresets = {
	/** Quick fade in for new elements */
	fadeIn: {
		duration: theme.animation.durations.fast,
		ease: theme.animation.easing.inOutSine,
	},

	/** Smooth slide for screen transitions */
	slideTransition: {
		duration: theme.animation.durations.normal,
		ease: "inOutQuad" as const,
	},

	/** Bounce effect for button presses */
	bounce: {
		duration: theme.animation.durations.fast,
		ease: theme.animation.easing.outExpo,
	},

	/** Slow fade for loading states */
	loadingFade: {
		duration: theme.animation.durations.slow,
		ease: theme.animation.easing.inOutSine,
	},

	/** Quick scale for focus changes */
	focusScale: {
		duration: theme.animation.durations.fast,
		ease: theme.animation.easing.outExpo,
	},
};