import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import type { ReactNode } from "react";
import { useState } from "react";
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
	disabled?: boolean;
	focused?: boolean;
}

/**
 * Slider component - Interactive slider for numeric value selection.
 * Supports keyboard (arrow keys) and mouse interaction.
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
	disabled = false,
	focused = false,
}: SliderProps): ReactNode {
	const [internalValue, setInternalValue] = useState(min);
	const componentStyles = useComponentStyles();

	const value = controlledValue !== undefined ? controlledValue : internalValue;
	const clampedValue = Math.max(min, Math.min(max, value));

	const handleChange = (newValue: number) => {
		if (disabled) return;
		const clamped = Math.max(min, Math.min(max, newValue));
		if (controlledValue === undefined) {
			setInternalValue(clamped);
		}
		onChange?.(clamped);
	};

	useKeyboard((evt) => {
		if (!focused || disabled) return;

		if (evt.name === "left" || evt.name === "down") {
			handleChange(clampedValue - step);
		} else if (evt.name === "right" || evt.name === "up") {
			handleChange(clampedValue + step);
		}
	});

	// Calculate track width (reserving space for label and value display)
	const trackWidth = width - (label ? label.length + 2 : 0) - (showValue ? 8 : 0);
	const percentage = (clampedValue - min) / (max - min);
	const filledWidth = Math.round(trackWidth * percentage);

	const thumbColor = focused
		? componentStyles.slider.thumb.focusColor
		: componentStyles.slider.thumb.color;

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

			{/* Slider Track */}
			<box
				style={{
					flexDirection: "row",
					width: trackWidth,
					height: 1,
				}}
			>
				{/* Filled portion */}
				{filledWidth > 0 && (
					<box
						style={{
							width: filledWidth,
							backgroundColor: componentStyles.slider.track.filledColor,
						}}
					/>
				)}
				{/* Thumb */}
				{filledWidth < trackWidth && (
					<text fg={thumbColor} attributes={TextAttributes.BOLD} selectable={false}>
						●
					</text>
				)}
				{/* Empty portion */}
				{filledWidth < trackWidth - 1 && (
					<box
						style={{
							flexGrow: 1,
							backgroundColor: componentStyles.slider.track.backgroundColor,
						}}
					/>
				)}
			</box>

			{showValue && (
				<text fg={componentStyles.slider.label.textColor} selectable={false}>
					{clampedValue.toFixed(0)}
				</text>
			)}
		</box>
	);
}
