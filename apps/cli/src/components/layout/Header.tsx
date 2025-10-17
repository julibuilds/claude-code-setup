import { TextAttributes } from "@opentui/core";
import { theme } from "../../design/theme";

interface HeaderProps {
	/** Header icon/emoji */
	icon?: string;
	/** Main title text */
	title: string;
	/** Subtitle/description text */
	subtitle?: string;
}

/**
 * Standardized header component for all screens
 * Provides consistent branding and context
 */
export function Header({ icon = "", title, subtitle }: HeaderProps) {
	return (
		<box
			style={{
				...theme.components.header,
				marginBottom: 2,
			}}
		>
			<text
				style={{
					attributes: TextAttributes.BOLD,
					fg: theme.colors.accent.cyan,
					marginBottom: subtitle ? 1 : 0,
				}}
			>
				{icon ? `${icon} ${title}` : title}
			</text>
			{subtitle && <text fg={theme.colors.text.primary}>{subtitle}</text>}
		</box>
	);
}
