import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import type { ReactNode } from "react";
import { useState } from "react";
import { useComponentStyles } from "../styles/theme-system";

export interface TextInputProps {
	value?: string;
	onChange?: (value: string) => void;
	placeholder?: string;
	disabled?: boolean;
	focused?: boolean;
	width?: number;
	maxLength?: number;
	password?: boolean;
	border?: boolean;
	borderStyle?: "single" | "double" | "rounded";
}

/**
 * TextInput component - Single-line text input with keyboard support.
 * Supports placeholder text, password masking, and configurable styling.
 */
export function TextInput({
	value: controlledValue,
	onChange,
	placeholder = "",
	disabled = false,
	focused = false,
	width,
	maxLength,
	password = false,
	border,
	borderStyle,
}: TextInputProps): ReactNode {
	const [internalValue, setInternalValue] = useState("");
	const componentStyles = useComponentStyles();

	const value = controlledValue !== undefined ? controlledValue : internalValue;
	const finalBorder = border ?? componentStyles.input.border;
	const finalBorderStyle = borderStyle ?? componentStyles.input.borderStyle;

	const handleChange = (newValue: string) => {
		if (maxLength && newValue.length > maxLength) {
			return;
		}
		if (controlledValue === undefined) {
			setInternalValue(newValue);
		}
		onChange?.(newValue);
	};

	useKeyboard((evt) => {
		if (!focused || disabled) return;

		if (evt.name === "backspace" || evt.name === "delete") {
			if (value.length > 0) {
				handleChange(value.slice(0, -1));
			}
		} else if (evt.sequence && evt.sequence.length === 1) {
			// Only add printable characters
			const char = evt.sequence;
			if (char >= " " && char <= "~") {
				handleChange(value + char);
			}
		}
	});

	const displayValue = password && value ? "•".repeat(value.length) : value;
	const showPlaceholder = !value && placeholder;
	const borderColor = focused
		? componentStyles.input.focusBorderColor
		: componentStyles.input.borderColor;

	return (
		<box
			style={{
				backgroundColor: componentStyles.input.backgroundColor,
				padding: componentStyles.input.padding,
				flexDirection: "row",
				alignItems: "center",
				...(typeof width === "number" ? { width } : {}),
			}}
			border={finalBorder}
			borderStyle={finalBorderStyle as "single" | "double" | "rounded"}
			borderColor={borderColor}
		>
			{showPlaceholder ? (
				<text fg={componentStyles.input.placeholderColor} selectable={false}>
					{placeholder}
				</text>
			) : (
				<text fg={componentStyles.input.textColor} selectable={false}>
					{displayValue}
				</text>
			)}
			{focused && !disabled && (
				<text
					fg={componentStyles.input.cursorColor}
					attributes={TextAttributes.BOLD}
					selectable={false}
				>
					▏
				</text>
			)}
		</box>
	);
}
