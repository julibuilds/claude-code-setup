import { type InputRenderable, TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { type ReactNode, type Ref, useRef, useState } from "react";
import { useComponentStyles, useThemeColors } from "../styles/theme-system";
import { Select, type SelectOption } from "./select";

// Legacy Dropdown interface for backward compatibility
export interface DropdownOption extends SelectOption {
	keywords?: string[];
}

export interface DropdownProps {
	id?: string;
	tooltip?: string;
	placeholder?: string;
	selectedValues?: string[];
	itemsPerPage?: number;
	options: DropdownOption[];
	onChange?: (newValue: string) => void;
}

/**
 * @deprecated Use Select component with separate search input for more flexibility
 */

const Dropdown = (props: DropdownProps) => {
	const {
		tooltip,
		onChange,
		selectedValues = [],
		options,
		placeholder = "Search…",
		itemsPerPage = 10,
	} = props;

	const [selected, setSelected] = useState(0);
	const [offset, setOffset] = useState(0);
	const [searchText, setSearchText] = useState("");
	const inputRef = useRef<InputRenderable>(null);
	const colors = useThemeColors();
	const componentStyles = useComponentStyles();

	const inFocus = true;

	// Filter options based on search
	const filteredOptions = options.filter((option) => {
		if (!searchText.trim()) return true;
		const needles = searchText.toLowerCase().trim().split(/\s+/);
		const searchableText = [option.title, ...(option.keywords || [])]
			.filter(Boolean)
			.join(" ")
			.toLowerCase();
		return needles.every((needle) => searchableText.includes(needle));
	});

	// Get visible options for current page
	const visibleOptions = filteredOptions.slice(offset, offset + itemsPerPage);

	const move = (direction: -1 | 1) => {
		const itemCount = filteredOptions.length;
		if (itemCount === 0) return;

		if (direction === 1) {
			setSelected((prev) => {
				const nextIndex = (prev + 1) % itemCount;

				const visibleEnd = offset + itemsPerPage - 1;
				if (prev === visibleEnd && nextIndex < itemCount && nextIndex > prev) {
					setOffset(offset + 1);
				} else if (nextIndex < prev) {
					setOffset(0);
				}

				return nextIndex;
			});
		} else {
			setSelected((prev) => {
				const nextIndex = (prev - 1 + itemCount) % itemCount;

				if (nextIndex < offset) {
					setOffset(Math.max(0, nextIndex));
				} else if (nextIndex >= offset + itemsPerPage) {
					setOffset(Math.max(0, itemCount - itemsPerPage));
				}

				return nextIndex;
			});
		}
	};

	const selectItem = (itemValue: string) => {
		if (onChange) {
			onChange(itemValue);
		}
	};

	// Handle keyboard navigation
	useKeyboard((evt) => {
		if (evt.name === "up") {
			move(-1);
		}
		if (evt.name === "down") {
			move(1);
		}
		if (evt.name === "return") {
			const currentOption = filteredOptions[selected];
			if (currentOption) {
				selectItem(currentOption.value);
			}
		}
	});

	return (
		<box>
			<box style={{ paddingLeft: 2, paddingRight: 2 }}>
				<box style={{ paddingLeft: 1, paddingRight: 1 }}>
					<box
						style={{
							flexDirection: "row",
							justifyContent: "space-between",
						}}
					>
						<text attributes={TextAttributes.BOLD}>{tooltip}</text>
						<text fg={colors.text.muted}>esc</text>
					</box>
					<box style={{ paddingTop: 1, paddingBottom: 2 }}>
						<input
							ref={inputRef as Ref<InputRenderable>}
							onInput={(value) => setSearchText(value)}
							placeholder={placeholder}
							focused={inFocus}
							value={searchText}
							focusedBackgroundColor={componentStyles.dropdown.container.backgroundColor}
							cursorColor={colors.accent.primary}
							focusedTextColor={colors.text.muted}
						/>
					</box>
				</box>
				<box style={{ paddingBottom: 1 }}>
					{visibleOptions.map((option, idx) => {
						const globalIndex = offset + idx;
						const isActive = globalIndex === selected;
						const isCurrent = selectedValues.includes(option.value);

						return (
							<box key={option.value}>
								<ItemOption
									title={option.title}
									icon={option.icon}
									active={isActive}
									current={isCurrent}
									label={option.label}
									onMouseMove={() => setSelected(globalIndex)}
									onMouseDown={() => selectItem(option.value)}
								/>
							</box>
						);
					})}
				</box>
			</box>
			<box
				border={false}
				style={{
					paddingRight: 2,
					paddingLeft: 3,
					paddingBottom: 1,
					paddingTop: 1,
					flexDirection: "row",
				}}
			>
				<text fg={colors.text.primary} attributes={TextAttributes.BOLD}>
					↵
				</text>
				<text fg={colors.text.muted}> select</text>
				<text fg={colors.text.primary} attributes={TextAttributes.BOLD}>
					{"   "}↑↓
				</text>
				<text fg={colors.text.muted}> navigate</text>
			</box>
		</box>
	);
};

function ItemOption(props: {
	title: string;
	icon?: ReactNode;
	active?: boolean;
	current?: boolean;
	label?: string;
	onMouseDown?: () => void;
	onMouseMove?: () => void;
}) {
	const [isHovered, setIsHovered] = useState(false);
	const colors = useThemeColors();
	const componentStyles = useComponentStyles();

	return (
		<box
			style={{
				flexDirection: "row",
				backgroundColor: props.active
					? componentStyles.dropdown.item.activeBackgroundColor
					: isHovered
						? componentStyles.dropdown.item.hoverBackgroundColor
						: componentStyles.dropdown.item.backgroundColor,
				paddingLeft: props.active ? 0 : 1,
				paddingRight: 1,
				justifyContent: "space-between",
			}}
			border={false}
			onMouseMove={() => {
				setIsHovered(true);
				if (props.onMouseMove) props.onMouseMove();
			}}
			onMouseOut={() => setIsHovered(false)}
			onMouseDown={props.onMouseDown}
		>
			<box style={{ flexDirection: "row" }}>
				{props.active && (
					<text fg={componentStyles.dropdown.text.active} selectable={false}>
						›{""}
					</text>
				)}
				{props.icon && (
					<text
						fg={
							props.active
								? componentStyles.dropdown.text.active
								: componentStyles.dropdown.text.default
						}
						selectable={false}
					>
						{String(props.icon)}{" "}
					</text>
				)}
				<text
					fg={
						props.active
							? componentStyles.dropdown.text.active
							: props.current
								? componentStyles.dropdown.text.selected
								: componentStyles.dropdown.text.default
					}
					attributes={props.active ? TextAttributes.BOLD : undefined}
					selectable={false}
				>
					{props.title}
				</text>
			</box>
			{props.label && (
				<text
					fg={props.active ? componentStyles.dropdown.text.active : colors.text.muted}
					attributes={props.active ? TextAttributes.BOLD : undefined}
					selectable={false}
				>
					{props.label}
				</text>
			)}
		</box>
	);
}

export { Dropdown, Select, type SelectOption };
