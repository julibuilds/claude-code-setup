import { createTimeline } from "@opentui/core";
import { useEffect, useState } from "react";

/**
 * Animates a progress value smoothly using OpenTUI Core Timeline
 * 
 * @param targetProgress - Target progress value (0-100)
 * @param duration - Animation duration in milliseconds (default: 500)
 * @returns Current animated progress value
 * 
 * @example
 * ```tsx
 * const progress = useProgressAnimation(75, 1000)
 * // progress will smoothly animate from current value to 75 over 1 second
 * ```
 */
export function useProgressAnimation(
	targetProgress: number,
	duration = 500
): number {
	const [currentProgress, setCurrentProgress] = useState(0);

	useEffect(() => {
		const target = { progress: currentProgress };
		const timeline = createTimeline({ duration });

		timeline.add(
			target,
			{
				progress: targetProgress,
				duration,
				ease: "inOutQuad",
				onUpdate: (values) => {
					setCurrentProgress(values.targets[0].progress);
				},
			},
			0
		);

		return () => {
			// Cleanup timeline if component unmounts
			timeline.pause();
		};
	}, [targetProgress, duration]);

	return currentProgress;
}
