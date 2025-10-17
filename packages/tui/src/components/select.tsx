import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { type ReactNode, useState } from "react";
import { useComponentStyles } from "../styles/theme-system";

export interface SelectOption {
	title: string;
	value: string;
	icon?: ReactNode;
	label?: string;
}

export interface SelectProps {
	options: SelectOption[];
	selected?: number;
	onChange?: (value: string, index: number) => void;
	onNavigate?: (index: number) => void;
	renderOption?: (option: SelectOption, isActive: boolean, isCurrent: boolean) => ReactNode;
	height?: number;
	showIndicator?: boolean;
}

/**
 * A primitive select/dropdown component. Just handles option rendering,
 * keyboard navigation, and selection. Search/filtering should be composed separately.
 */
export function Select({
	options,
	selected: controlledSelected,
	onChange,
	onNavigate,
	renderOption,
	height,
	showIndicator = true,
}: SelectProps): ReactNode {
	const [internalSelected, setInternalSelected] = useState(0);
	const componentStyles = useComponentStyles();

	const selected = controlledSelected !== undefined ? controlledSelected : internalSelected;

	const move = (direction: -1 | 1) => {
		const itemCount = options.length;
		if (itemCount === 0) return;

		const nextIndex = (selected + direction + itemCount) % itemCount;
		if (controlledSelected === undefined) {
			setInternalSelected(nextIndex);
		}
		onNavigate?.(nextIndex);
	};

	const selectItem = () => {
		const currentOption = options[selected];
		if (currentOption) {
			onChange?.(currentOption.value, selected);
		}
	};

	useKeyboard((evt) => {
		if (evt.name === "up") move(-1);
		if (evt.name === "down") move(1);
		if (evt.name === "return") selectItem();
	});

	const defaultRenderOption = (option: SelectOption, isActive: boolean, _isCurrent: boolean) => (
		<box
			style={{
				flexDirection: "row",
				backgroundColor: isActive
					? componentStyles.dropdown.item.activeBackgroundColor
					: componentStyles.dropdown.item.backgroundColor,
				paddingLeft: isActive && showIndicator ? 0 : 1,
				paddingRight: 1,
				justifyContent: "space-between",
			}}
			border={false}
		>
			<box style={{ flexDirection: "row" }}>
				{isActive && showIndicator && (
					<text fg={componentStyles.dropdown.text.active} selectable={false}>
						›{""}
					</text>
				)}
				{option.icon && (
					<text
						fg={
							isActive
								? componentStyles.dropdown.text.active
								: componentStyles.dropdown.text.default
						}
						selectable={false}
					>
						{String(option.icon)}{" "}
					</text>
				)}
				<text
					fg={
						isActive ? componentStyles.dropdown.text.active : componentStyles.dropdown.text.default
					}
					attributes={isActive ? TextAttributes.BOLD : undefined}
					selectable={false}
				>
					{option.title}
				</text>
			</box>
			{option.label && (
				<text
					fg={
						isActive ? componentStyles.dropdown.text.active : componentStyles.dropdown.text.default
					}
					attributes={isActive ? TextAttributes.BOLD : undefined}
					selectable={false}
				>
					{option.label}
				</text>
			)}
		</box>
	);

	const renderFn = renderOption || defaultRenderOption;

	return (
		<box style={{ height, flexDirection: "column" }}>
			{options.map((option, idx) => {
				const isActive = idx === selected;
				return (
					<box key={option.value} onMouseDown={() => onChange?.(option.value, idx)}>
						{renderFn(option, isActive, false)}
					</box>
				);
			})}
		</box>
	);
}
