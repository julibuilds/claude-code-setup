import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import type { ReactNode } from "react";
import { useState } from "react";
import { useComponentStyles } from "../styles/theme-system";

export interface CheckboxProps {
	checked?: boolean;
	onChange?: (checked: boolean) => void;
	label?: string;
	disabled?: boolean;
	focused?: boolean;
}

/**
 * Checkbox component - Interactive checkbox with label support.
 * Supports keyboard (Space/Enter) and mouse interaction.
 */
export function Checkbox({
	checked: controlledChecked,
	onChange,
	label,
	disabled = false,
	focused = false,
}: CheckboxProps): ReactNode {
	const [internalChecked, setInternalChecked] = useState(false);
	const componentStyles = useComponentStyles();

	const checked = controlledChecked !== undefined ? controlledChecked : internalChecked;

	const handleToggle = () => {
		if (disabled) return;
		const newChecked = !checked;
		if (controlledChecked === undefined) {
			setInternalChecked(newChecked);
		}
		onChange?.(newChecked);
	};

	useKeyboard((evt) => {
		if (!focused || disabled) return;
		if (evt.name === "space" || evt.name === "return") {
			handleToggle();
		}
	});

	const boxColor = focused
		? componentStyles.checkbox.focusBorderColor
		: componentStyles.checkbox.boxColor;
	const checkColor = checked
		? componentStyles.checkbox.checkedColor
		: componentStyles.checkbox.uncheckedColor;

	return (
		<box
			style={{
				flexDirection: "row",
				alignItems: "center",
				gap: 1,
			}}
			onMouseDown={handleToggle}
		>
			<box
				style={{
					width: 3,
					height: 1,
					justifyContent: "center",
					alignItems: "center",
				}} // TODO: Maybe we can make this customizable via theme system?
				border={true}
				borderStyle="single"
				borderColor={boxColor}
			>
				<text fg={checkColor} attributes={TextAttributes.BOLD} selectable={false}>
					{" "}
					{/* TODO: customizable? */}
					{checked ? "✓" : " "}
				</text>
			</box>
			{label && (
				<text
					fg={componentStyles.checkbox.labelColor}
					attributes={disabled ? TextAttributes.DIM : undefined}
					selectable={false}
				>
					{label}
				</text>
			)}
		</box>
	);
}
