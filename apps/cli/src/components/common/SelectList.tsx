import type { SelectOption } from "@opentui/core";
import { useComponentStyles, useThemeColors } from "@repo/tui";

interface SelectListProps {
	/** Options to display */
	options: SelectOption[];
	/** Whether this select is focused */
	focused?: boolean;
	/** Callback when selection changes */
	onChange: (index: number, option: SelectOption | null) => void;
	/** Height of the select container */
	height?: number | `${number}%` | "auto";
	/** Show scroll indicator for long lists */
	showScrollIndicator?: boolean;
}

/**
 * Wrapper around OpenTUI select component with standardized styling using TUI theme
 */
export function SelectList({
	options,
	focused = false,
	onChange,
	height = "100%",
	showScrollIndicator = true,
}: SelectListProps) {
	const colors = useThemeColors();
	const componentStyles = useComponentStyles();

	return (
		<box style={{ flexDirection: "column", flexGrow: 1 }}>
			<select
				options={options}
				focused={focused}
				onChange={onChange}
				showScrollIndicator={showScrollIndicator}
				style={{
					height,
					backgroundColor: focused
						? componentStyles.elevated.backgroundColor
						: componentStyles.panel.backgroundColor,
					focusedBackgroundColor: componentStyles.list.item.hoverBackgroundColor,
					textColor: colors.text.primary,
					focusedTextColor: colors.accent.primary,
					selectedBackgroundColor: colors.accent.primary,
					selectedTextColor: colors.background.main,
					descriptionColor: colors.text.muted,
					selectedDescriptionColor: colors.text.primary,
				}}
			/>
		</box>
	);
}
