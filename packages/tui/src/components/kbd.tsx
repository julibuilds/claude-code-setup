import { TextAttributes } from "@opentui/core";
import type { ReactNode } from "react";
import { useComponentStyles } from "../styles/theme-system";

export interface KbdProps {
	children: ReactNode;
	border?: boolean;
	borderStyle?: "single" | "double" | "rounded" | "bold";
	backgroundColor?: string;
	textColor?: string;
	borderColor?: string;
	bold?: boolean;
}

/**
 * Kbd component - Display keyboard shortcuts and command keys.
 * Similar to the <kbd> HTML element, provides visual styling for keyboard input.
 */
export function Kbd({
	children,
	border,
	borderStyle,
	backgroundColor,
	textColor,
	borderColor,
	bold = true,
}: KbdProps): ReactNode {
	const componentStyles = useComponentStyles();

	const finalBorder = border ?? componentStyles.kbd.border;
	const finalBorderStyle = borderStyle ?? componentStyles.kbd.borderStyle;
	const finalBg = backgroundColor ?? componentStyles.kbd.backgroundColor;
	const finalTextColor = textColor ?? componentStyles.kbd.textColor;
	const finalBorderColor = borderColor ?? componentStyles.kbd.borderColor;

	return (
		<box
			style={{
				backgroundColor: finalBg,
				paddingLeft: 1,
				paddingRight: 1,
			}}
			border={finalBorder}
			borderStyle={finalBorderStyle as "single" | "double" | "rounded"}
			borderColor={finalBorderColor}
		>
			<text
				fg={finalTextColor}
				attributes={bold ? TextAttributes.BOLD : undefined}
				selectable={false}
			>
				{children}
			</text>
		</box>
	);
}
