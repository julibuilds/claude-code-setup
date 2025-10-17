import { TextAttributes } from "@opentui/core";
import { theme } from "../../design/theme";

export interface Shortcut {
	keys: string;
	description: string;
}

interface FooterProps {
	/** Array of keyboard shortcuts to display */
	shortcuts: Shortcut[];
	/** Optional custom styling */
	backgroundColor?: string;
}

/**
 * Standardized footer component for keyboard shortcuts
 * Displays consistent keyboard legend at the bottom of screens
 */
export function Footer({
	shortcuts,
	backgroundColor = theme.colors.bg.dark,
}: FooterProps) {
	return (
		<box
			style={{
				...theme.components.footer,
				backgroundColor,
				marginTop: 2,
			}}
		>
			<text
				style={{
					attributes: TextAttributes.BOLD,
					fg: theme.colors.accent.purple,
					marginBottom: 1,
				}}
			>
				⌨️ Keyboard Shortcuts
			</text>
			{shortcuts.map((shortcut, i) => (
				<text key={i} fg={theme.colors.text.primary}>
					{shortcut.keys} {shortcut.description}
				</text>
			))}
		</box>
	);
}
