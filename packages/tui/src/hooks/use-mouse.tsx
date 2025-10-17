import { useState } from "react";

/**
 * EXPERIMENTAL: Basic mouse event support for TUI components
 * Note: Keyboard navigation should remain the primary interaction method
 *
 * @example
 * ```tsx
 * const { position, isPressed, onClick } = useMouse()
 *
 * onClick((x, y) => {
 *   console.log('Clicked at', x, y)
 * })
 *
 * return <box onMouseDown={(e) => handleClick(e)}>Content</box>
 * ```
 */
export function useMouse() {
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [isPressed, setIsPressed] = useState(false);

	// Handler for mouse click events
	const onClick = (callback: (x: number, y: number) => void) => {
		return (event: any) => {
			if (event?.x !== undefined && event?.y !== undefined) {
				callback(event.x, event.y);
			}
		};
	};

	// Handler for mouse movement
	const onMove = (callback: (x: number, y: number) => void) => {
		return (event: any) => {
			if (event?.x !== undefined && event?.y !== undefined) {
				setPosition({ x: event.x, y: event.y });
				callback(event.x, event.y);
			}
		};
	};

	// Handler for mouse press state
	const onMouseDown = (callback?: () => void) => {
		return () => {
			setIsPressed(true);
			callback?.();
		};
	};

	const onMouseUp = (callback?: () => void) => {
		return () => {
			setIsPressed(false);
			callback?.();
		};
	};

	return {
		position,
		isPressed,
		onClick,
		onMove,
		onMouseDown,
		onMouseUp,
	};
}

/**
 * Helper hook for click detection within bounds
 *
 * @example
 * ```tsx
 * const handleClick = useClickable((x, y) => {
 *   console.log('Clicked inside bounds at', x, y)
 * })
 *
 * return <box onMouseDown={handleClick}>Clickable content</box>
 * ```
 */
export function useClickable(
	onClickCallback: (x: number, y: number) => void,
	bounds?: { x: number; y: number; width: number; height: number }
) {
	const { onClick } = useMouse();

	const handleClick = onClick((x, y) => {
		// If bounds are provided, check if click is within bounds
		if (bounds) {
			const inBounds =
				x >= bounds.x &&
				x < bounds.x + bounds.width &&
				y >= bounds.y &&
				y < bounds.y + bounds.height;

			if (inBounds) {
				onClickCallback(x - bounds.x, y - bounds.y);
			}
		} else {
			onClickCallback(x, y);
		}
	});

	return handleClick;
}
