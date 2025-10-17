import { TextAttributes } from "@opentui/core";
import { useComponentStyles, useThemeColors } from "@repo/tui";

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
	/** Compact mode for narrow terminals */
	compact?: boolean;
}

/**
 * Enhanced footer component with better visual organization and grouping
 * Displays consistent keyboard legend with improved styling and categorization
 */
export function Footer({
	shortcuts,
	backgroundColor,
	groupByCategory = false,
	compact = false,
}: FooterProps) {
	const colors = useThemeColors();
	const componentStyles = useComponentStyles();

	const groupShortcutsByCategory = (shortcuts: Shortcut[]) => {
		const groups: Record<string, Shortcut[]> = {};
		shortcuts.forEach((shortcut) => {
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
						fg: colors.accent.secondary,
						marginBottom: 1,
					}}
				>
					{category}
				</text>
			)}
			{shortcuts.map((shortcut) => (
				<text
					key={`${category}-${shortcut.keys}-${shortcut.description}`}
					style={{
						fg: colors.text.primary,
						marginLeft: category !== "General" ? 2 : 0,
					}}
				>
					<span style={{ fg: colors.accent.primary, attributes: TextAttributes.BOLD }}>
						{shortcut.keys}
					</span>{" "}
					{shortcut.description}
				</text>
			))}
		</box>
	);

	const renderShortcuts = () => {
		if (groupByCategory) {
			const groups = groupShortcutsByCategory(shortcuts);
			return Object.entries(groups).map(([category, shortcuts]) =>
				renderShortcutGroup(category, shortcuts),
			);
		}

		return shortcuts.map((shortcut) => (
			<text key={`${shortcut.keys}-${shortcut.description}`} style={{ fg: colors.text.primary }}>
				<span style={{ fg: colors.accent.primary, attributes: TextAttributes.BOLD }}>
					{shortcut.keys}
				</span>{" "}
				{shortcut.description}
			</text>
		));
	};

	return (
		<box
			style={{
				marginTop: compact ? 1 : 2,
				padding: compact ? 1 : 2,
				border: true,
				borderStyle: componentStyles.panel.borderStyle,
				borderColor: colors.border.muted,
				backgroundColor: backgroundColor || componentStyles.elevated.backgroundColor,
				flexDirection: "column",
			}}
		>
			{!compact && (
				<text
					style={{
						attributes: TextAttributes.BOLD,
						fg: colors.accent.secondary,
						marginBottom: 1,
					}}
				>
					⌨️ Keyboard Shortcuts
				</text>
			)}
			{renderShortcuts()}
		</box>
	);
}
