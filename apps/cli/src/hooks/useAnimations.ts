/**
 * Animation hooks for OpenTUI React components
 * Provides reusable animation patterns using useTimeline
 */

import { useTimeline } from "@opentui/react";
import { useEffect, useState } from "react";
import { theme } from "../design/theme";

/**
 * Progress animation hook
 * @param targetProgress Target progress value (0-100)
 * @param duration Animation duration in milliseconds
 * @returns Current animated progress value
 */
export function useProgressAnimation(
	targetProgress: number,
	duration: number = 500,
) {
	const [progress, setProgress] = useState(0);

	const timeline = useTimeline({
		duration,
		loop: false,
	});

	useEffect(() => {
		const progressObj = { value: progress };

		timeline.add(
			progressObj,
			{
				value: targetProgress,
				duration,
				ease: "inOutQuad",
				onUpdate: (animation) => {
					setProgress(animation.targets[0]?.value || 0);
				},
			},
			0,
		);
	}, [targetProgress, duration, progress, timeline]);

	return progress;
}

/**
 * Fade-in animation hook
 * @param duration Animation duration in milliseconds
 * @returns Current opacity value (0-1)
 */
export function useFadeIn(duration: number = theme.animation.durations.normal) {
	const [opacity, setOpacity] = useState(0);

	const timeline = useTimeline({
		duration,
		loop: false,
	});

	useEffect(() => {
		const opacityObj = { value: 0 };

		timeline.add(
			opacityObj,
			{
				value: 1,
				duration,
				ease: "inOutSine",
				onUpdate: (animation) => {
					setOpacity(animation.targets[0]?.value || 0);
				},
			},
			0,
		);
	}, [duration, timeline]);

	return opacity;
}

/**
 * Slide animation hook
 * @param from Starting position
 * @param to Ending position
 * @param duration Animation duration in milliseconds
 * @returns Current position { x, y }
 */
export function useSlideAnimation(
	from: { x: number; y: number },
	to: { x: number; y: number },
	duration: number = theme.animation.durations.normal,
) {
	const [position, setPosition] = useState(from);

	const timeline = useTimeline({
		duration,
		loop: false,
	});

	useEffect(() => {
		const posObj = { x: from.x, y: from.y };

		timeline.add(
			posObj,
			{
				x: to.x,
				y: to.y,
				duration,
				ease: "inOutQuad",
				onUpdate: (animation) => {
					const target = animation.targets[0];
					if (target) {
						setPosition({ x: target.x, y: target.y });
					}
				},
			},
			0,
		);
	}, [from.x, from.y, to.x, to.y, duration, timeline]);

	return position;
}

/**
 * Scale animation hook
 * @param from Starting scale
 * @param to Ending scale
 * @param duration Animation duration in milliseconds
 * @returns Current scale value
 */
export function useScaleAnimation(
	from: number,
	to: number,
	duration: number = theme.animation.durations.fast,
) {
	const [scale, setScale] = useState(from);

	const timeline = useTimeline({
		duration,
		loop: false,
	});

	useEffect(() => {
		const scaleObj = { value: from };

		timeline.add(
			scaleObj,
			{
				value: to,
				duration,
				ease: "outExpo",
				onUpdate: (animation) => {
					setScale(animation.targets[0]?.value || from);
				},
			},
			0,
		);
	}, [from, to, duration, timeline]);

	return scale;
}

/**
 * Spinner animation hook
 * @param type Spinner type (dots, simple, bounce, pulse, arrow, clock)
 * @param speed Frame duration in milliseconds
 * @returns Current spinner frame
 */
export function useSpinner(
	type: "dots" | "simple" | "bounce" | "pulse" | "arrow" | "clock" = "dots",
	speed: number = 100,
) {
	const spinnerFrames = {
		dots: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
		simple: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
		bounce: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
		pulse: ["●", "○", "●", "○", "●", "○", "●", "○", "●", "○"],
		arrow: ["←", "↖", "↑", "↗", "→", "↘", "↓", "↙"],
		clock: ["🕐", "🕑", "🕒", "🕓", "🕔", "🕕", "🕖", "🕗", "🕘", "🕙", "🕚", "🕛"],
	};

	const frames = spinnerFrames[type];
	const [frameIndex, setFrameIndex] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setFrameIndex((prev) => (prev + 1) % frames.length);
		}, speed);

		return () => clearInterval(interval);
	}, [frames.length, speed]);

	return frames[frameIndex] || frames[0];
}

/**
 * Color transition animation hook
 * @param fromColor Starting color (hex)
 * @param toColor Ending color (hex)
 * @param duration Animation duration in milliseconds
 * @returns Current color value (hex)
 */
export function useColorTransition(
	fromColor: string,
	toColor: string,
	duration: number = theme.animation.durations.fast,
) {
	const [color, setColor] = useState(fromColor);

	const timeline = useTimeline({
		duration,
		loop: false,
	});

	useEffect(() => {
		// Parse hex colors to RGB
		const parseHex = (hex: string) => {
			const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			return result
				? {
						r: Number.parseInt(result[1] || "0", 16),
						g: Number.parseInt(result[2] || "0", 16),
						b: Number.parseInt(result[3] || "0", 16),
					}
				: { r: 0, g: 0, b: 0 };
		};

		const from = parseHex(fromColor);
		const to = parseHex(toColor);
		const colorObj = { ...from };

		timeline.add(
			colorObj,
			{
				r: to.r,
				g: to.g,
				b: to.b,
				duration,
				ease: "inOutQuad",
				onUpdate: (animation) => {
					const target = animation.targets[0];
					if (target) {
						const r = Math.round(target.r).toString(16).padStart(2, "0");
						const g = Math.round(target.g).toString(16).padStart(2, "0");
						const b = Math.round(target.b).toString(16).padStart(2, "0");
						setColor(`#${r}${g}${b}`);
					}
				},
			},
			0,
		);
	}, [fromColor, toColor, duration, timeline]);

	return color;
}

/**
 * Staggered animation hook for multiple elements
 * @param count Number of elements to animate
 * @param staggerDelay Delay between each element's animation start
 * @param duration Animation duration for each element
 * @returns Array of animation progress values (0-1)
 */
export function useStaggeredAnimation(
	count: number,
	staggerDelay: number = theme.animation.durations.fast,
	duration: number = theme.animation.durations.normal,
) {
	const [progress, setProgress] = useState<number[]>(Array(count).fill(0));

	useEffect(() => {
		const timers: NodeJS.Timeout[] = [];

		for (let i = 0; i < count; i++) {
			const timer = setTimeout(() => {
				const startTime = Date.now();
				const interval = setInterval(() => {
					const elapsed = Date.now() - startTime;
					const value = Math.min(1, elapsed / duration);

					setProgress((prev) => {
						const next = [...prev];
						next[i] = value;
						return next;
					});

					if (value >= 1) {
						clearInterval(interval);
					}
				}, 16); // ~60fps

				timers.push(interval);
			}, i * staggerDelay);

			timers.push(timer);
		}

		return () => {
			for (const timer of timers) {
				clearTimeout(timer);
				clearInterval(timer);
			}
		};
	}, [count, staggerDelay, duration]);

	return progress;
}
