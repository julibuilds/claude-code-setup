import { createTimeline } from "@opentui/core";
import { useEffect, useState } from "react";

const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

/**
 * Animates a spinner using OpenTUI Core Timeline
 * 
 * @param isSpinning - Whether the spinner should be animating
 * @param speed - Frame duration in milliseconds (default: 80)
 * @returns Current spinner frame character
 * 
 * @example
 * ```tsx
 * const spinner = useSpinnerAnimation(isLoading)
 * return <text>{spinner} Loading...</text>
 * ```
 */
export function useSpinnerAnimation(
	isSpinning = true,
	speed = 80
): string {
	const [frameIndex, setFrameIndex] = useState(0);

	useEffect(() => {
		if (!isSpinning) {
			setFrameIndex(0);
			return;
		}

		const target = { frame: 0 };
		const timeline = createTimeline({
			duration: speed * SPINNER_FRAMES.length,
			loop: true,
		});

		// Animate through all frames
		for (let i = 0; i < SPINNER_FRAMES.length; i++) {
			timeline.add(
				target,
				{
					frame: i,
					duration: speed,
					ease: "linear",
					onUpdate: (values) => {
						setFrameIndex(Math.floor(values.targets[0].frame));
					},
				},
				i * speed
			);
		}

		return () => {
			timeline.pause();
		};
	}, [isSpinning, speed]);

	const frame = SPINNER_FRAMES[frameIndex % SPINNER_FRAMES.length];
	return frame ?? SPINNER_FRAMES[0]!;
}
