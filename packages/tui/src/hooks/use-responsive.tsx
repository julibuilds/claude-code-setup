import { useTerminalDimensions } from "@opentui/react";
import { useEffect } from "react";

/**
 * Hook that combines terminal dimensions with resize handling
 * Provides current terminal dimensions and allows responding to size changes
 *
 * @example
 * ```tsx
 * const { width, height, onResize } = useResponsive()
 *
 * onResize((newWidth, newHeight) => {
 *   console.log('Terminal resized to', newWidth, 'x', newHeight)
 * })
 *
 * return <box width={width} height={height}>Content</box>
 * ```
 */
export function useResponsive(callback?: (width: number, height: number) => void) {
	const { width, height } = useTerminalDimensions();

	useEffect(() => {
		if (callback) {
			callback(width, height);
		}
	}, [width, height, callback]);

	return {
		width,
		height,
	};
}
