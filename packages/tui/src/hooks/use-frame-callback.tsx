import { useEffect, useRef } from "react";

/**
 * Options for frame callback
 */
export interface FrameCallbackOptions {
	/**
	 * Whether the callback is enabled
	 * @default true
	 */
	enabled?: boolean;

	/**
	 * Throttle updates to every N frames
	 * @default 1 (run every frame)
	 */
	throttle?: number;

	/**
	 * Maximum frames per second
	 * @default undefined (no limit)
	 */
	maxFps?: number;
}

/**
 * Hook for executing a callback on every animation frame
 * Useful for animations, real-time updates, and performance monitoring
 *
 * @param callback - Function to call on each frame. Receives deltaTime (ms) and frame number
 * @param options - Configuration options
 *
 * @example
 * ```tsx
 * useFrameCallback((deltaTime, frame) => {
 *   console.log(`Frame ${frame}, delta: ${deltaTime}ms`);
 * }, { throttle: 2 }); // Run every 2nd frame
 * ```
 */
export function useFrameCallback(
	callback: (deltaTime: number, frame: number) => void,
	options: FrameCallbackOptions = {}
): void {
	const { enabled = true, throttle = 1, maxFps } = options;

	const frameRef = useRef(0);
	const lastTimeRef = useRef(Date.now());
	const rafIdRef = useRef<number | null>(null);
	const callbackRef = useRef(callback);

	// Keep callback ref up to date
	useEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	useEffect(() => {
		if (!enabled) {
			if (rafIdRef.current !== null) {
				cancelAnimationFrame(rafIdRef.current);
				rafIdRef.current = null;
			}
			return;
		}

		let minFrameTime = 0;
		if (maxFps) {
			minFrameTime = 1000 / maxFps;
		}

		let lastFrameTime = Date.now();

		const tick = (): void => {
			const now = Date.now();
			const deltaTime = now - lastTimeRef.current;

			// FPS throttling
			if (maxFps && now - lastFrameTime < minFrameTime) {
				rafIdRef.current = requestAnimationFrame(tick);
				return;
			}

			lastFrameTime = now;

			// Frame throttling
			if (frameRef.current % throttle === 0) {
				callbackRef.current(deltaTime, frameRef.current);
			}

			lastTimeRef.current = now;
			frameRef.current++;
			rafIdRef.current = requestAnimationFrame(tick);
		};

		rafIdRef.current = requestAnimationFrame(tick);

		return () => {
			if (rafIdRef.current !== null) {
				cancelAnimationFrame(rafIdRef.current);
			}
		};
	}, [enabled, throttle, maxFps]);
}
