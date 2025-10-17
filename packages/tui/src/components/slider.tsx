import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useAnimationFrame } from "../hooks/use-animation-frame";
import { useComponentStyles } from "../styles/theme-system";

export interface SliderProps {
	value?: number;
	min?: number;
	max?: number;
	step?: number;
	onChange?: (value: number) => void;
	label?: string;
	showValue?: boolean;
	width?: number;
	height?: number;
	disabled?: boolean;
	focused?: boolean;
	/** Orientation of the slider */
	orientation?: "horizontal" | "vertical";
	/** Enable sub-cell rendering for smooth animation (viewPortSize < 1 for fractional movement) */
	viewPortSize?: number;
	/** Enable animated auto-scroll */
	animated?: boolean;
	/** Animation speed for auto-scroll (units per second) */
	animationSpeed?: number;
	/** Show range indicator between two values */
	rangeStart?: number;
	rangeEnd?: number;
	/** Custom progress bar characters */
	progressChar?: string;
	emptyChar?: string;
	/** Fine-grained step control for smoother transitions */
	fineStep?: number;
}

/**
 * Enhanced Slider component - Interactive slider for numeric value selection.
 * Supports:
 * - Horizontal and vertical orientation
 * - Sub-cell rendering for smooth animation
 * - Variable height/width (1-5 cell sizes)
 * - Range indicators
 * - Animated auto-scroll capability
 * - Fine-grained step control
 * - Visual progress bar with custom characters
 * - Keyboard (arrow keys) and mouse interaction
 */
export function Slider({
	value: controlledValue,
	min = 0,
	max = 100,
	step = 1,
	onChange,
	label,
	showValue = true,
	width = 30,
	height = 1,
	disabled = false,
	focused = false,
	orientation = "horizontal",
	viewPortSize,
	animated = false,
	animationSpeed = 10,
	rangeStart,
	rangeEnd,
	progressChar,
	emptyChar,
	fineStep,
}: SliderProps): ReactNode {
	const [internalValue, setInternalValue] = useState(min);
	const [animatedValue, setAnimatedValue] = useState(min);
	const componentStyles = useComponentStyles();
	const lastUpdateTimeRef = useRef(Date.now());

	const value = controlledValue !== undefined ? controlledValue : internalValue;
	const clampedValue = Math.max(min, Math.min(max, value));
	const actualStep = fineStep || step;

	// Animated auto-scroll
	const { isRunning } = useAnimationFrame((elapsed) => {
		const now = Date.now();
		const deltaTime = (now - lastUpdateTimeRef.current) / 1000; // Convert to seconds
		lastUpdateTimeRef.current = now;

		const increment = animationSpeed * deltaTime;
		let newValue = animatedValue + increment;

		// Wrap around when reaching max
		if (newValue > max) {
			newValue = min + (newValue - max);
		}

		setAnimatedValue(newValue);
		handleChange(newValue);
	}, animated && !disabled);

	// Initialize animated value
	useEffect(() => {
		if (!animated) {
			setAnimatedValue(clampedValue);
		}
	}, [animated, clampedValue]);

	const handleChange = (newValue: number) => {
		if (disabled || animated) return;
		const clamped = Math.max(min, Math.min(max, newValue));
		if (controlledValue === undefined) {
			setInternalValue(clamped);
		}
		onChange?.(clamped);
	};

	useKeyboard((evt) => {
		if (!focused || disabled || animated) return;

		const isVertical = orientation === "vertical";
		const decrementKeys = isVertical ? ["up"] : ["left", "down"];
		const incrementKeys = isVertical ? ["down"] : ["right", "up"];

		if (decrementKeys.includes(evt.name)) {
			handleChange(clampedValue - actualStep);
		} else if (incrementKeys.includes(evt.name)) {
			handleChange(clampedValue + actualStep);
		}
	});

	// Use custom characters from props or theme
	const progressCharacter = progressChar || componentStyles.slider.progress.char;
	const emptyCharacter = emptyChar || componentStyles.slider.progress.emptyChar;

	// Calculate dimensions based on orientation
	const isVertical = orientation === "vertical";
	const displayValue = animated ? animatedValue : clampedValue;

	if (isVertical) {
		return (
			<VerticalSlider
				label={label}
				showValue={showValue}
				height={height}
				min={min}
				max={max}
				displayValue={displayValue}
				rangeStart={rangeStart}
				rangeEnd={rangeEnd}
				viewPortSize={viewPortSize}
				focused={focused}
				progressChar={progressCharacter}
				emptyChar={emptyCharacter}
				componentStyles={componentStyles}
			/>
		);
	}

	// Horizontal slider rendering
	const trackWidth = width - (label ? label.length + 2 : 0) - (showValue ? 8 : 0);
	const percentage = (displayValue - min) / (max - min);

	// Sub-cell rendering support
	const effectiveViewPortSize = viewPortSize || 1;
	let filledWidth: number;

	if (effectiveViewPortSize < 1) {
		// Sub-cell rendering for smooth animation
		filledWidth = trackWidth * percentage * effectiveViewPortSize;
	} else {
		filledWidth = Math.round(trackWidth * percentage);
	}

	const thumbColor = focused
		? componentStyles.slider.thumb.focusColor
		: componentStyles.slider.thumb.color;

	// Render multiple rows for height > 1
	const rows = [];
	for (let i = 0; i < height; i++) {
		rows.push(
			<box
				key={i}
				style={{
					flexDirection: "row",
					width: trackWidth,
					height: 1,
				}}
			>
				{renderHorizontalTrack(
					trackWidth,
					filledWidth,
					thumbColor,
					componentStyles,
					rangeStart,
					rangeEnd,
					min,
					max,
					progressCharacter,
					emptyCharacter,
					i === Math.floor(height / 2) // Show thumb only in middle row
				)}
			</box>
		);
	}

	return (
		<box
			style={{
				flexDirection: "row",
				alignItems: "center",
				gap: 1,
			}}
		>
			{label && (
				<text fg={componentStyles.slider.label.textColor} selectable={false}>
					{label}:
				</text>
			)}

			<box style={{ flexDirection: "column" }}>{rows}</box>

			{showValue && (
				<text fg={componentStyles.slider.label.textColor} selectable={false}>
					{displayValue.toFixed(fineStep ? 2 : 0)}
				</text>
			)}
		</box>
	);
}

/**
 * Render horizontal track with optional range indicators
 */
function renderHorizontalTrack(
	trackWidth: number,
	filledWidth: number,
	thumbColor: string,
	componentStyles: any,
	rangeStart: number | undefined,
	rangeEnd: number | undefined,
	min: number,
	max: number,
	progressChar: string,
	emptyChar: string,
	showThumb: boolean
): ReactNode {
	// Build track as character array for precise control
	const track: ReactNode[] = [];
	const hasRange = rangeStart !== undefined && rangeEnd !== undefined;

	for (let i = 0; i < trackWidth; i++) {
		const position = (i / trackWidth) * (max - min) + min;
		const isFilled = i < Math.floor(filledWidth);
		const isInRange = hasRange && position >= rangeStart! && position <= rangeEnd!;
		const isThumb = showThumb && i === Math.floor(filledWidth);

		if (isThumb) {
			track.push(
				<text key={i} fg={thumbColor} attributes={TextAttributes.BOLD} selectable={false}>
					●
				</text>
			);
		} else if (isInRange) {
			track.push(
				<text
					key={i}
					fg={componentStyles.slider.track.filledColor}
					attributes={TextAttributes.BOLD}
					selectable={false}
				>
					{progressChar}
				</text>
			);
		} else if (isFilled) {
			track.push(
				<text key={i} fg={componentStyles.slider.track.filledColor} selectable={false}>
					{progressChar}
				</text>
			);
		} else {
			track.push(
				<text key={i} fg={componentStyles.slider.track.backgroundColor} selectable={false}>
					{emptyChar}
				</text>
			);
		}
	}

	return <box style={{ flexDirection: "row" }}>{track}</box>;
}

/**
 * Vertical slider component
 */
function VerticalSlider({
	label,
	showValue,
	height,
	min,
	max,
	displayValue,
	rangeStart,
	rangeEnd,
	viewPortSize,
	focused,
	progressChar,
	emptyChar,
	componentStyles,
}: {
	label?: string;
	showValue: boolean;
	height: number;
	min: number;
	max: number;
	displayValue: number;
	rangeStart?: number;
	rangeEnd?: number;
	viewPortSize?: number;
	focused: boolean;
	progressChar: string;
	emptyChar: string;
	componentStyles: any;
}): ReactNode {
	const percentage = (displayValue - min) / (max - min);
	const indicatorPosition = componentStyles.slider.vertical.indicatorPosition;

	// Calculate filled height from bottom
	const effectiveViewPortSize = viewPortSize || 1;
	let filledHeight: number;

	if (effectiveViewPortSize < 1) {
		filledHeight = height * percentage * effectiveViewPortSize;
	} else {
		filledHeight = Math.round(height * percentage);
	}

	const thumbColor = focused
		? componentStyles.slider.thumb.focusColor
		: componentStyles.slider.thumb.color;

	const hasRange = rangeStart !== undefined && rangeEnd !== undefined;

	// Build vertical track from top to bottom
	const track: ReactNode[] = [];

	for (let i = 0; i < height; i++) {
		const position = ((height - i - 1) / height) * (max - min) + min;
		const isFilled = height - i - 1 < Math.floor(filledHeight);
		const isInRange = hasRange && position >= rangeStart! && position <= rangeEnd!;
		const isThumb = i === height - Math.floor(filledHeight) - 1;

		track.push(
			<box key={i} style={{ flexDirection: "row", height: 1 }}>
				{indicatorPosition === "left" && showValue && i === 0 && (
					<text fg={componentStyles.slider.label.textColor} selectable={false}>
						{displayValue.toFixed(0)}
					</text>
				)}

				{isThumb ? (
					<text fg={thumbColor} attributes={TextAttributes.BOLD} selectable={false}>
						●
					</text>
				) : isInRange ? (
					<text
						fg={componentStyles.slider.track.filledColor}
						attributes={TextAttributes.BOLD}
						selectable={false}
					>
						{progressChar}
					</text>
				) : isFilled ? (
					<text fg={componentStyles.slider.track.filledColor} selectable={false}>
						{progressChar}
					</text>
				) : (
					<text fg={componentStyles.slider.track.backgroundColor} selectable={false}>
						{emptyChar}
					</text>
				)}

				{indicatorPosition === "right" && showValue && i === 0 && (
					<text fg={componentStyles.slider.label.textColor} selectable={false}>
						{" "}
						{displayValue.toFixed(0)}
					</text>
				)}
			</box>
		);
	}

	return (
		<box style={{ flexDirection: "column" }}>
			{label && (
				<text fg={componentStyles.slider.label.textColor} selectable={false}>
					{label}
				</text>
			)}
			{track}
		</box>
	);
}
