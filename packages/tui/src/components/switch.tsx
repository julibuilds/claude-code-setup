import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import type { ReactNode } from "react";
import { useState } from "react";
import { useComponentStyles } from "../styles/theme-system";

export interface SwitchProps {
	checked?: boolean;
	onChange?: (checked: boolean) => void;
	label?: string;
	disabled?: boolean;
	focused?: boolean;
}

/**
 * Switch component - Toggle switch (on/off) with visual feedback.
 * Supports keyboard (Space/Enter) and mouse interaction.
 */
export function Switch({
	checked: controlledChecked,
	onChange,
	label,
	disabled = false,
	focused = false,
}: SwitchProps): ReactNode {
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

	const backgroundColor = checked
		? componentStyles.switch.onBackgroundColor
		: componentStyles.switch.offBackgroundColor;

	const borderColor = focused ? componentStyles.switch.focusBorderColor : backgroundColor;

	return (
		<box
			style={{
				flexDirection: "row",
				alignItems: "center",
				gap: 1,
			}}
			onMouseDown={handleToggle}
		>
			{/* Switch Track */}
			<box
				style={{
					width: 6,
					height: 3,
					backgroundColor,
					justifyContent: "center",
					alignItems: checked ? "flex-end" : "flex-start",
					paddingLeft: checked ? 0 : 1,
					paddingRight: checked ? 1 : 0,
				}}
				border={true}
				borderStyle="rounded"
				borderColor={borderColor}
			>
				{/* Switch Thumb */}
				<text
					fg={componentStyles.switch.thumbColor}
					attributes={TextAttributes.BOLD}
					selectable={false}
				>
					●
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
