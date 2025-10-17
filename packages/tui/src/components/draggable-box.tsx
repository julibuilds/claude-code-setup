import { type ReactNode, useEffect, useRef, useState } from "react";
import { useMouse } from "../hooks/use-mouse";
import { useComponentStyles } from "../styles/theme-system";

export interface DraggableBoxProps {
	children: ReactNode;
	initialX?: number;
	initialY?: number;
	onDragStart?: (x: number, y: number) => void;
	onDrag?: (x: number, y: number) => void;
	onDragEnd?: (x: number, y: number) => void;
	onDrop?: (x: number, y: number) => void;
	bounds?: { x: number; y: number; width: number; height: number };
	disabled?: boolean;
	width?: number;
	height?: number;
}

/**
 * DraggableBox component - A box that can be dragged around with the mouse
 * Supports boundaries, drag callbacks, and visual feedback
 *
 * @example
 * ```tsx
 * <DraggableBox
 *   initialX={10}
 *   initialY={5}
 *   onDragEnd={(x, y) => console.log('Dropped at', x, y)}
 * >
 *   Drag me!
 * </DraggableBox>
 * ```
 */
export function DraggableBox({
	children,
	initialX = 0,
	initialY = 0,
	onDragStart,
	onDrag,
	onDragEnd,
	onDrop,
	bounds,
	disabled = false,
	width,
	height,
}: DraggableBoxProps): ReactNode {
	const [position, setPosition] = useState({ x: initialX, y: initialY });
	const [isDragging, setIsDragging] = useState(false);
	const dragOffset = useRef({ x: 0, y: 0 });
	const componentStyles = useComponentStyles();
	const { onMouseDown } = useMouse();

	const handleMouseDown = onMouseDown(() => {
		if (disabled) return;
		setIsDragging(true);
		onDragStart?.(position.x, position.y);
	});

	useEffect(() => {
		if (!isDragging) return;

		const handleMouseMove = (e: MouseEvent) => {
			if (!isDragging) return;

			let newX = e.clientX - dragOffset.current.x;
			let newY = e.clientY - dragOffset.current.y;

			// Apply bounds if specified
			if (bounds) {
				newX = Math.max(bounds.x, Math.min(bounds.x + bounds.width - (width || 0), newX));
				newY = Math.max(bounds.y, Math.min(bounds.y + bounds.height - (height || 0), newY));
			}

			setPosition({ x: newX, y: newY });
			onDrag?.(newX, newY);
		};

		const handleMouseUp = () => {
			setIsDragging(false);
			onDragEnd?.(position.x, position.y);
			onDrop?.(position.x, position.y);
		};

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isDragging, position, onDrag, onDragEnd, onDrop, bounds, width, height]);

	const borderColor = isDragging
		? componentStyles.draggable.dragBorderColor
		: componentStyles.draggable.activeBorderColor;

	return (
		<box
			style={{
				position: "absolute",
				left: position.x,
				top: position.y,
				...(width ? { width } : {}),
				...(height ? { height } : {}),
			}}
			border={true}
			borderStyle="single"
			borderColor={borderColor}
			onMouseDown={handleMouseDown}
		>
			{children}
		</box>
	);
}
