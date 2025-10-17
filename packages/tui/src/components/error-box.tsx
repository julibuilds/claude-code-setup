import { TextAttributes } from "@opentui/core";
import type { ReactNode } from "react";
import { useComponentStyles, useThemeColors } from "../styles/theme-system";

export interface ErrorBoxProps {
	/** Error title */
	title: string;
	/** Error description */
	description: string;
	/** Optional helpful suggestions */
	suggestions?: string[];
	/** Optional recovery action hint */
	recoveryHint?: string;
	/** Optional padding override */
	padding?: number;
	/** Optional margin override */
	marginTop?: number;
	marginBottom?: number;
}

/**
 * ErrorBox component for displaying errors with context and recovery guidance
 * Provides better error messages with suggestions and recovery hints
 */
export function ErrorBox({
	title,
	description,
	suggestions,
	recoveryHint,
	padding = 2,
	marginTop = 2,
	marginBottom = 2,
}: ErrorBoxProps): ReactNode {
	const colors = useThemeColors();
	const componentStyles = useComponentStyles();

	return (
		<box
			style={{
				backgroundColor: componentStyles.messageBox.error.backgroundColor,
				flexDirection: "column",
				border: true,
				borderStyle: "heavy",
				borderColor: colors.status.error,
				padding,
				marginTop,
				marginBottom,
			}}
		>
			<text
				style={{
					attributes: TextAttributes.BOLD,
					fg: colors.status.error,
					marginBottom: 1,
				}}
			>
				❌ {title}
			</text>

			<text
				style={{
					fg: colors.text.primary,
					marginBottom: suggestions || recoveryHint ? 1 : 0,
				}}
			>
				{description}
			</text>

			{suggestions && suggestions.length > 0 && (
				<box style={{ flexDirection: "column", marginBottom: 1 }}>
					<text
						style={{
							fg: colors.text.muted,
							marginBottom: 1,
						}}
					>
						This usually means:
					</text>
					{suggestions.map((suggestion, i) => (
						<text key={i} fg={colors.text.muted}>
							- {suggestion}
						</text>
					))}
				</box>
			)}

			{recoveryHint && (
				<text
					style={{
						fg: colors.accent.primary,
						marginTop: 1,
					}}
				>
					💡 {recoveryHint}
				</text>
			)}
		</box>
	);
}
