import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hook for controlling animation frames with start/stop/reset functionality
 * Returns controls for managing the animation loop
 *
 * @param callback - Function to call on each frame. Receives elapsed time in ms
 * @param autoStart - Whether to start the animation automatically (default: true)
 *
 * @example
 * ```tsx
 * const { start, stop, reset, isRunning, elapsed } = useAnimationFrame((elapsed) => {
 *   console.log(`Elapsed: ${elapsed}ms`);
 * }, false);
 *
 * // Manually control animation
 * <button onClick={start}>Start</button>
 * <button onClick={stop}>Stop</button>
 * <button onClick={reset}>Reset</button>
 * ```
 */
export function useAnimationFrame(
	callback: (elapsed: number) => void,
	autoStart: boolean = true
): {
	start: () => void;
	stop: () => void;
	reset: () => void;
	isRunning: boolean;
	elapsed: number;
} {
	const [isRunning, setIsRunning] = useState(autoStart);
	const [elapsed, setElapsed] = useState(0);

	const startTimeRef = useRef<number | null>(null);
	const rafIdRef = useRef<number | null>(null);
	const callbackRef = useRef(callback);

	// Keep callback ref up to date
	useEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	const stop = useCallback(() => {
		setIsRunning(false);
		if (rafIdRef.current !== null) {
			cancelAnimationFrame(rafIdRef.current);
			rafIdRef.current = null;
		}
	}, []);

	const reset = useCallback(() => {
		startTimeRef.current = null;
		setElapsed(0);
		if (isRunning) {
			stop();
		}
	}, [isRunning, stop]);

	const start = useCallback(() => {
		startTimeRef.current = Date.now();
		setElapsed(0);
		setIsRunning(true);
	}, []);

	useEffect(() => {
		if (!isRunning) return;

		const tick = (): void => {
			if (startTimeRef.current === null) {
				startTimeRef.current = Date.now();
			}

			const currentElapsed = Date.now() - startTimeRef.current;
			setElapsed(currentElapsed);
			callbackRef.current(currentElapsed);

			rafIdRef.current = requestAnimationFrame(tick);
		};

		rafIdRef.current = requestAnimationFrame(tick);

		return () => {
			if (rafIdRef.current !== null) {
				cancelAnimationFrame(rafIdRef.current);
			}
		};
	}, [isRunning]);

	return { start, stop, reset, isRunning, elapsed };
}
