import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import type { ReactNode } from "react";
import { useState } from "react";
import { useComponentStyles } from "../styles/theme-system";

export interface ToggleProps {
	pressed?: boolean;
	onChange?: (pressed: boolean) => void;
	children: ReactNode;
	disabled?: boolean;
	focused?: boolean;
	variant?: "default" | "primary" | "secondary";
}

/**
 * Toggle component - Button that maintains pressed/unpressed state.
 * Similar to a button but with toggle behavior (like a checkbox but styled as a button).
 * Supports keyboard (Space/Enter) and mouse interaction.
 */
export function Toggle({
	pressed: controlledPressed,
	onChange,
	children,
	disabled = false,
	focused = false,
	variant = "default",
}: ToggleProps): ReactNode {
	const [internalPressed, setInternalPressed] = useState(false);
	const componentStyles = useComponentStyles();

	const pressed = controlledPressed !== undefined ? controlledPressed : internalPressed;

	const handleToggle = () => {
		if (disabled) return;
		const newPressed = !pressed;
		if (controlledPressed === undefined) {
			setInternalPressed(newPressed);
		}
		onChange?.(newPressed);
	};

	useKeyboard((evt) => {
		if (!focused || disabled) return;
		if (evt.name === "space" || evt.name === "return") {
			handleToggle();
		}
	});

	const variantStyles = componentStyles.button[variant];

	// Use active state colors when pressed, normal colors when not
	const backgroundColor = pressed
		? variantStyles.activeBackgroundColor
		: variantStyles.backgroundColor;

	const textColor = pressed ? variantStyles.textColor : variantStyles.textColor;

	return (
		<box
			style={{
				backgroundColor,
				padding: componentStyles.button.padding,
				justifyContent: "center",
				alignItems: "center",
			}}
			border={componentStyles.button.border}
			borderStyle="rounded"
			onMouseDown={handleToggle}
		>
			<text
				fg={textColor}
				attributes={pressed ? TextAttributes.BOLD : undefined}
				selectable={false}
			>
				{children}
			</text>
		</box>
	);
}
