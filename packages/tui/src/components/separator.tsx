import type { ReactNode } from "react";
import { useComponentStyles, useThemeColors } from "../styles/theme-system";

export interface SeparatorProps {
	/**
	 * Orientation of the separator
	 * @default "horizontal"
	 */
	orientation?: "horizontal" | "vertical";
	/**
	 * Custom color override
	 */
	color?: string;
	/**
	 * Length of the separator (width for horizontal, height for vertical)
	 * If not provided, will flex to fill available space
	 */
	length?: number;
	/**
	 * Character to use for the separator line
	 * @default "─" for horizontal, "│" for vertical
	 */
	char?: string;
	/**
	 * Add spacing around the separator
	 * @default 0
	 */
	margin?: number;
}

/**
 * Separator component - Visual divider for content sections.
 * Can be horizontal or vertical with customizable styling.
 */
export function Separator({
	orientation = "horizontal",
	color,
	length,
	char,
	margin = 0,
}: SeparatorProps): ReactNode {
	const componentStyles = useComponentStyles();
	const colors = useThemeColors(); // TODO: Address this ("'colors' is declared but its value is never read")

	const finalColor = color ?? componentStyles.separator.color;
	const defaultChar =
		orientation === "horizontal"
			? componentStyles.separator.horizontalChar
			: componentStyles.separator.verticalChar;
	const finalChar = char ?? defaultChar;

	if (orientation === "horizontal") {
		const content = length ? finalChar.repeat(length) : finalChar.repeat(80); // Default length if not flexing

		return (
			<box
				style={{
					flexDirection: "row",
					...(margin > 0 && {
						marginTop: margin,
						marginBottom: margin,
					}),
				}}
			>
				<text fg={finalColor} selectable={false}>
					{content}
				</text>
			</box>
		);
	}

	// Vertical separator
	return (
		<box
			style={{
				flexDirection: "column",
				height: length ?? 1,
				justifyContent: "center",
				...(margin > 0 && {
					marginLeft: margin,
					marginRight: margin,
				}),
			}}
		>
			<text fg={finalColor} selectable={false}>
				{finalChar}
			</text>
		</box>
	);
}
