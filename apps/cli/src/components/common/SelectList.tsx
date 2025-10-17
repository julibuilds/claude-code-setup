import { type SelectOption, TextAttributes } from "@opentui/core";
import { TextAttributes as TAEnum } from "@opentui/core";
import { theme } from "../../design/theme";

interface SelectListProps {
	/** Options to display */
	options: SelectOption[];
	/** Whether this select is focused */
	focused?: boolean;
	/** Callback when selection changes */
	onChange: (index: number, option: SelectOption | null) => void;
	/** Optional title above the select */
	title?: string;
	/** Show scroll indicator for long lists */
	showScrollIndicator?: boolean;
	/** Height of the select container */
	height?: number | `${number}%` | "auto";
	/** Help text displayed below the select */
	helpText?: string;
}

/**
 * Wrapper around OpenTUI select component with standardized styling
 * Normalizes height calculations and adds visual feedback
 */
export function SelectList({
	options,
	focused = false,
	onChange,
	title,
	showScrollIndicator = true,
	height = "100%",
	helpText,
}: SelectListProps) {
	return (
		<box style={{ flexDirection: "column" }}>
			{title && (
				<text
					style={{
						attributes: TAEnum.BOLD,
						fg: theme.colors.text.primary,
						marginBottom: 1,
					}}
				>
					{title}
				</text>
			)}
			<box
				style={{
					...theme.components.selectContainer,
					flexDirection: "column",
				}}
			>
				<select
					options={options}
					focused={focused}
					onChange={onChange}
					showScrollIndicator={showScrollIndicator}
					style={{
						height,
					}}
				/>
			</box>
			{helpText && (
				<text
					style={{
						fg: theme.colors.text.dim,
						marginTop: 1,
					}}
				>
					{helpText}
				</text>
			)}
		</box>
	);
}
