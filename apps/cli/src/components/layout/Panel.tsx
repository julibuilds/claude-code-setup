import { TextAttributes } from "@opentui/core";
import { theme } from "../../design/theme";

interface PanelProps {
	/** Panel title */
	title?: string;
	/** Panel content */
	children: React.ReactNode;
	/** Whether this panel has focus */
	focused?: boolean;
	/** Height of the panel (if not using flex) */
	height?: number;
	/** Width of the panel (if not using flex), "auto" for flexGrow */
	width?: number | "auto";
	/** Optional custom border color */
	borderColor?: string;
	/** Optional padding override */
	padding?: number;
}

/**
 * Reusable bordered panel component
 * Used for creating consistent sections in multi-panel layouts
 */
export function Panel({
	title,
	children,
	focused = false,
	height,
	width,
	borderColor,
	padding = 2,
}: PanelProps) {
	const backgroundColor = focused
		? theme.colors.bg.mid
		: theme.colors.bg.dark;

	return (
		<box
			style={{
				border: true,
				backgroundColor,
				padding,
				flexDirection: "column",
				height,
				width,
			}}
		>
			{title && (
				<text
					style={{
						attributes: TextAttributes.BOLD,
						fg: focused
							? theme.colors.accent.cyan
							: theme.colors.text.primary,
						marginBottom: 1,
					}}
				>
					{focused ? `▶ ${title}` : title}
				</text>
			)}
			<box style={{ flexDirection: "column" }}>{children}</box>
		</box>
	);
}
