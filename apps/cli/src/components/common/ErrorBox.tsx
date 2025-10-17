import { TextAttributes } from "@opentui/core";
import { theme } from "../../design/theme";

interface ErrorBoxProps {
	/** Error title */
	title: string;
	/** Error description */
	description: string;
	/** Optional helpful suggestions */
	suggestions?: string[];
	/** Optional recovery action hint */
	recoveryHint?: string;
}

/**
 * Enhanced error display with icon, title, message, and suggestions
 * Provides better context and recovery guidance for errors
 */
export function ErrorBox({
	title,
	description,
	suggestions,
	recoveryHint,
}: ErrorBoxProps) {
	return (
		<box
			style={{
				...theme.components.statusBox,
				backgroundColor: theme.colors.bg.dark,
				flexDirection: "column",
				border: true,
				padding: 2,
				marginTop: 2,
				marginBottom: 2,
			}}
		>
			<text
				style={{
					attributes: TextAttributes.BOLD,
					fg: theme.colors.error,
					marginBottom: 1,
				}}
			>
				❌ {title}
			</text>

			<text
				style={{
					fg: theme.colors.text.primary,
					marginBottom: suggestions || recoveryHint ? 1 : 0,
				}}
			>
				{description}
			</text>

			{suggestions && suggestions.length > 0 && (
				<box style={{ flexDirection: "column", marginBottom: 1 }}>
					<text
						style={{
							fg: theme.colors.text.dim,
							marginBottom: 1,
						}}
					>
						This usually means:
					</text>
					{suggestions.map((suggestion, i) => (
						<text key={i} fg={theme.colors.text.dim}>
							- {suggestion}
						</text>
					))}
				</box>
			)}

			{recoveryHint && (
				<text
					style={{
						fg: theme.colors.accent.cyan,
						marginTop: 1,
					}}
				>
					💡 {recoveryHint}
				</text>
			)}
		</box>
	);
}
