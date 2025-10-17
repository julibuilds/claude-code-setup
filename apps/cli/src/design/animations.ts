/**
 * Animation utilities and timeline builders for OpenTUI Core Edition
 * Provides reusable animation patterns and easing functions
 */

import { createTimeline, type Timeline } from "@opentui/core";
import { theme } from "./theme";

/**
 * Create a progress animation timeline
 * @param target Object with progress property to animate
 * @param duration Animation duration in milliseconds
 * @param onUpdate Callback for each frame update
 */
export function createProgressAnimation(
	target: { progress: number },
	duration: number = 500,
	onUpdate?: (values: { targets: Array<{ progress: number }> }) => void
): Timeline {
	const timeline = createTimeline({ duration, autoplay: false });
	
	timeline.add(target, {
		progress: 100,
		duration,
		ease: "inOutQuad",
		onUpdate: (values) => {
			if (onUpdate) {
				onUpdate(values);
			}
		}
	}, 0);
	
	return timeline;
}

/**
 * Create a fade-in animation timeline
 * @param target Object with opacity property to animate
 * @param duration Animation duration in milliseconds
 * @param onUpdate Callback for each frame update
 */
export function createFadeInAnimation(
	target: { opacity: number },
	duration: number = theme.animation.durations.normal,
	onUpdate?: (values: { targets: Array<{ opacity: number }> }) => void
): Timeline {
	const timeline = createTimeline({ duration, autoplay: false });
	
	timeline.add(target, {
		opacity: 1,
		duration,
		ease: "inOutSine",
		onUpdate: (values) => {
			if (onUpdate) {
				onUpdate(values);
			}
		}
	}, 0);
	
	return timeline;
}

/**
 * Create a slide animation timeline
 * @param target Object with x/y properties to animate
 * @param from Starting position
 * @param to Ending position
 * @param duration Animation duration in milliseconds
 * @param onUpdate Callback for each frame update
 */
export function createSlideAnimation(
	target: { x: number; y: number },
	from: { x: number; y: number },
	to: { x: number; y: number },
	duration: number = theme.animation.durations.normal,
	onUpdate?: (values: { targets: Array<{ x: number; y: number }> }) => void
): Timeline {
	const timeline = createTimeline({ duration, autoplay: false });
	
	// Set initial position
	target.x = from.x;
	target.y = from.y;
	
	timeline.add(target, {
		x: to.x,
		y: to.y,
		duration,
		ease: "inOutQuad",
		onUpdate: (values) => {
			if (onUpdate) {
				onUpdate(values);
			}
		}
	}, 0);
	
	return timeline;
}

/**
 * Create a scale animation timeline
 * @param target Object with scale property to animate
 * @param from Starting scale
 * @param to Ending scale
 * @param duration Animation duration in milliseconds
 * @param onUpdate Callback for each frame update
 */
export function createScaleAnimation(
	target: { scale: number },
	from: number,
	to: number,
	duration: number = theme.animation.durations.fast,
	onUpdate?: (values: { targets: Array<{ scale: number }> }) => void
): Timeline {
	const timeline = createTimeline({ duration, autoplay: false });
	
	// Set initial scale
	target.scale = from;
	
	timeline.add(target, {
		scale: to,
		duration,
		ease: "outExpo",
		onUpdate: (values) => {
			if (onUpdate) {
				onUpdate(values);
			}
		}
	}, 0);
	
	return timeline;
}

/**
 * Create a color transition animation timeline
 * @param target Object with color properties to animate
 * @param from Starting colors
 * @param to Ending colors
 * @param duration Animation duration in milliseconds
 * @param onUpdate Callback for each frame update
 */
export function createColorTransitionAnimation(
	target: { borderColor?: string; backgroundColor?: string; fg?: string },
	from: { borderColor?: string; backgroundColor?: string; fg?: string },
	to: { borderColor?: string; backgroundColor?: string; fg?: string },
	duration: number = theme.animation.durations.fast,
	onUpdate?: (values: { targets: Array<{ borderColor?: string; backgroundColor?: string; fg?: string }> }) => void
): Timeline {
	const timeline = createTimeline({ duration, autoplay: false });
	
	// Set initial colors
	if (from.borderColor) target.borderColor = from.borderColor;
	if (from.backgroundColor) target.backgroundColor = from.backgroundColor;
	if (from.fg) target.fg = from.fg;
	
	const animationProps: { borderColor?: string; backgroundColor?: string; fg?: string } = {};
	if (to.borderColor) animationProps.borderColor = to.borderColor;
	if (to.backgroundColor) animationProps.backgroundColor = to.backgroundColor;
	if (to.fg) animationProps.fg = to.fg;
	
	timeline.add(target, {
		...animationProps,
		duration,
		ease: "inOutQuad",
		onUpdate: (values) => {
			if (onUpdate) {
				onUpdate(values);
			}
		}
	}, 0);
	
	return timeline;
}

/**
 * Create a staggered animation for multiple elements
 * @param elements Array of elements to animate
 * @param animationFn Function that creates animation for each element
 * @param staggerDelay Delay between each element's animation start
 */
export function createStaggeredAnimation<T>(
	elements: T[],
	animationFn: (element: T, index: number) => Timeline,
	staggerDelay: number = theme.animation.durations.fast
): Timeline[] {
	const timelines: Timeline[] = [];
	
	elements.forEach((element, index) => {
		const timeline = animationFn(element, index);
		// Note: seek() method may not be available in current OpenTUI version
		// timeline.seek(index * staggerDelay);
		timelines.push(timeline);
	});
	
	return timelines;
}

/**
 * Spinner frame sequences for different animation styles
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
export function getSpinnerFrames(type: keyof typeof spinnerFrames = "dots"): string[] {
	return spinnerFrames[type];
}

/**
 * Animation presets for common UI patterns
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
		ease: "inOutQuad",
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

/**
 * Create a timeline with preset configuration
 */
export function createPresetTimeline(
	preset: keyof typeof animationPresets,
	target: Record<string, unknown>,
	properties: Record<string, unknown>,
	onUpdate?: (values: { targets: Array<Record<string, unknown>> }) => void
): Timeline {
	const config = animationPresets[preset];
	const timeline = createTimeline({ duration: config.duration, autoplay: false });
	
	timeline.add(target, {
		...properties,
		duration: config.duration,
		ease: config.ease as any,
		onUpdate: (values) => {
			if (onUpdate) {
				onUpdate(values);
			}
		}
	}, 0);
	
	return timeline;
}