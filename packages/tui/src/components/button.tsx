import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import type { ReactNode } from "react";
import { useState } from "react";
import { useMouse } from "../hooks/use-mouse";
import { useComponentStyles } from "../styles/theme-system";

export interface ButtonProps {
	children: ReactNode;
	variant?: "default" | "primary" | "secondary" | "ghost";
	onClick?: () => void;
	disabled?: boolean;
	focused?: boolean;
	width?: number;
	border?: boolean;
	showPressEffect?: boolean;
	pressEffectDuration?: number;
	hoverEffect?: boolean;
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
	showPressEffect = true,
	pressEffectDuration,
	hoverEffect = true,
}: ButtonProps): ReactNode {
	const [isHovered, setIsHovered] = useState(false);
	const [isPressed, setIsPressed] = useState(false);
	const [pressEffectVisible, setPressEffectVisible] = useState(false);
	const componentStyles = useComponentStyles();
	const { onMouseDown, onMouseEnter, onMouseLeave } = useMouse();

	const variantStyles = componentStyles.button[variant];
	const finalBorder = border ?? componentStyles.button.border;

	const effectDuration = pressEffectDuration ?? componentStyles.button.pressEffect.duration;

	const triggerPressEffect = () => {
		if (showPressEffect && componentStyles.button.pressEffect.enabled) {
			setPressEffectVisible(true);
			setTimeout(() => setPressEffectVisible(false), effectDuration);
		}
	};

	useKeyboard((evt) => {
		if (!focused || disabled) return;

		if (evt.name === "return" || evt.name === "space") {
			setIsPressed(true);
			triggerPressEffect();
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
	} else if (isHovered && hoverEffect) {
		backgroundColor = variantStyles.hoverBackgroundColor;
	}

	const handleMouseDown = onMouseDown(() => {
		if (!disabled) {
			setIsPressed(true);
			triggerPressEffect();
			onClick?.();
			setTimeout(() => setIsPressed(false), 100);
		}
	});

	const handleMouseEnter = onMouseEnter(() => {
		if (!disabled && hoverEffect) {
			setIsHovered(true);
		}
	});

	const handleMouseLeave = onMouseLeave(() => {
		if (!disabled && hoverEffect) {
			setIsHovered(false);
		}
	});

	return (
		<box
			style={{
				position: "relative",
			}}
		>
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
				{...({ onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave } as any)}
			>
				<text fg={textColor} attributes={TextAttributes.BOLD} selectable={false}>
					{children}
				</text>
			</box>
			{pressEffectVisible && (
				<box
					style={{
						position: "absolute",
						left: 0,
						top: 0,
						right: 0,
						bottom: 0,
						justifyContent: "center",
						alignItems: "center",
						// pointerEvents: "none", // I don't think we need this
					}}
				>
					<text fg={componentStyles.button.pressEffect.color} selectable={false}>
						{componentStyles.button.pressEffect.character}
					</text>
				</box>
			)}
		</box>
	);
}
