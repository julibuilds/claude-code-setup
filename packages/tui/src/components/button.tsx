import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import type { ReactNode } from "react";
import { useState } from "react";
import { useComponentStyles } from "../styles/theme-system";

export interface ButtonProps {
	children: ReactNode;
	variant?: "default" | "primary" | "secondary" | "ghost";
	onClick?: () => void;
	disabled?: boolean;
	focused?: boolean;
	width?: number;
	border?: boolean;
	[key: string]: any; // Allow additional props like React keys
}

/**
 * Button component - Interactive button with keyboard and mouse support.
 * Supports multiple variants and can be focused with keyboard navigation.
 */
export function Button({
	children,
	variant = "default",
	onClick,
	disabled = false,
	focused = false,
	width,
	border,
}: ButtonProps): ReactNode {
	const [isHovered, setIsHovered] = useState(false); // TODO: Address this ("'setIsHovered' is declared but its value is never read.")
	const [isPressed, setIsPressed] = useState(false);
	const componentStyles = useComponentStyles();

	const variantStyles = componentStyles.button[variant];
	const finalBorder = border ?? componentStyles.button.border;

	useKeyboard((evt) => {
		if (!focused || disabled) return;

		if (evt.name === "return" || evt.name === "space") {
			setIsPressed(true);
			onClick?.();
			setTimeout(() => setIsPressed(false), 100);
		}
	});

	let backgroundColor = variantStyles.backgroundColor;
	let textColor = variantStyles.textColor;

	if (disabled) {
		backgroundColor = componentStyles.button.default.backgroundColor;
		textColor = componentStyles.button.default.textColor;
	} else if (isPressed) {
		backgroundColor = variantStyles.activeBackgroundColor;
	} else if (isHovered) {
		backgroundColor = variantStyles.hoverBackgroundColor;
	}

	const handleMouseDown = () => {
		if (!disabled) {
			setIsPressed(true);
			onClick?.();
			setTimeout(() => setIsPressed(false), 100);
		}
	};

	return (
		<box
			style={{
				backgroundColor,
				padding: componentStyles.button.padding,
				justifyContent: "center",
				alignItems: "center",
				...(typeof width === "number" ? { width } : {}),
			}}
			border={finalBorder}
			borderStyle="rounded"
			onMouseDown={handleMouseDown}
		>
			<text fg={textColor} attributes={TextAttributes.BOLD} selectable={false}>
				{children}
			</text>
		</box>
	);
}
