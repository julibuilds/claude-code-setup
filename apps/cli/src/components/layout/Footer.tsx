import { TextAttributes } from "@opentui/core";
import { theme } from "../../design/theme";

export interface Shortcut {
	keys: string;
	description: string;
	/** Optional category for grouping shortcuts */
	category?: string;
}

interface FooterProps {
	/** Array of keyboard shortcuts to display */
	shortcuts: Shortcut[];
	/** Optional custom styling */
	backgroundColor?: string;
	/** Whether to group shortcuts by category */
	groupByCategory?: boolean;
}

/**
 * Enhanced footer component with better visual organization and grouping
 * Displays consistent keyboard legend with improved styling and categorization
 */
export function Footer({
	shortcuts,
	backgroundColor = theme.colors.bg.dark,
	groupByCategory = false,
}: FooterProps) {
	const groupShortcutsByCategory = (shortcuts: Shortcut[]) => {
		const groups: Record<string, Shortcut[]> = {};
		shortcuts.forEach(shortcut => {
			const category = shortcut.category || "General";
			if (!groups[category]) {
				groups[category] = [];
			}
			groups[category].push(shortcut);
		});
		return groups;
	};

	const renderShortcutGroup = (category: string, shortcuts: Shortcut[]) => (
		<box key={category} style={{ flexDirection: "column", marginBottom: 1 }}>
			{category !== "General" && (
				<text
					style={{
						attributes: TextAttributes.BOLD,
						fg: theme.colors.accent.purple,
						marginBottom: 1,
					}}
				>
					{category}
				</text>
			)}
			{shortcuts.map((shortcut, i) => (
				<text 
					key={i} 
					style={{
						fg: theme.colors.text.primary,
						marginLeft: category !== "General" ? 2 : 0,
					}}
				>
					<span style={{ fg: theme.colors.accent.cyan, attributes: TextAttributes.BOLD }}>
						{shortcut.keys}
					</span> {shortcut.description}
				</text>
			))}
		</box>
	);

	const renderShortcuts = () => {
		if (groupByCategory) {
			const groups = groupShortcutsByCategory(shortcuts);
			return Object.entries(groups).map(([category, shortcuts]) =>
				renderShortcutGroup(category, shortcuts)
			);
		}

		return shortcuts.map((shortcut, i) => (
			<text key={i} style={{ fg: theme.colors.text.primary }}>
				<span style={{ fg: theme.colors.accent.cyan, attributes: TextAttributes.BOLD }}>
					{shortcut.keys}
				</span> {shortcut.description}
			</text>
		));
	};

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
			{renderShortcuts()}
		</box>
	);
}
