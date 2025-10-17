import { TextAttributes } from "@opentui/core";
import { useContext, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useComponentStyles, useThemeColors } from "../../styles/theme-system";
import { useIsInFocus } from "../../utils/focus-context";
import { useDialog } from "../dialog";
import {
	DropdownContext,
	DropdownDescendantsProvider,
	ListContext,
	useDropdownDescendants,
	useDropdownItemDescendant,
} from "./context";
import { ListDropdownDialog } from "./list-dropdown-dialog";
import type {
	DropdownItemDescendant,
	DropdownItemProps,
	DropdownProps,
	DropdownSectionProps,
	ListDropdownType,
} from "./types";
import { shouldItemBeVisible } from "./utils";
import { getInitialDropdownValue, handleDropdownValueChange } from "./value-persistence";

const ListDropdownComponent = (props: DropdownProps) => {
	const listContext = useContext(ListContext);
	const [isHovered, setIsHovered] = useState(false);
	const colors = useThemeColors();

	// Store both value and title together
	const [dropdownState, setDropdownState] = useState<{
		value: string;
		title: string;
	}>(() => {
		// Use persistence utilities to get initial value
		const initialValue =
			props.value ||
			getInitialDropdownValue({
				id: props.id || "default",
				storeValue: props.storeValue || false,
				defaultValue: props.defaultValue || "",
			});
		return { value: initialValue, title: initialValue || "All" };
	});
	const descendantsContext = useDropdownDescendants();
	const dialog = useDialog();
	const _inFocus = useIsInFocus(); // TODO: address this ("'_inFocus' is declared but its value is never read.")

	// Get dropdown state from list context (before hooks use it)
	const { isDropdownOpen, setIsDropdownOpen } = listContext || {
		isDropdownOpen: false,
		setIsDropdownOpen: () => {},
	};

	// Update value and find its title
	useLayoutEffect(() => {
		const valueToUse = props.value !== undefined ? props.value : dropdownState.value;

		// If no value is set and we have descendants, use the first item
		if (!valueToUse && !props.value && !props.defaultValue) {
			const items = Object.values(descendantsContext.map.current)
				.filter((item) => item.index !== -1)
				.sort((a, b) => a.index - b.index);

			if (items.length > 0 && items[0]) {
				const firstItem = items[0].props as DropdownItemDescendant;
				if (firstItem) {
					setDropdownState({ value: firstItem.value, title: firstItem.title });
					return;
				}
			}
		}

		if (!valueToUse) return;

		// Try to find the title for this value
		let title = valueToUse;
		for (const item of Object.values(descendantsContext.map.current)) {
			const itemProps = item.props as DropdownItemDescendant;
			if (itemProps.value === valueToUse) {
				title = itemProps.title;
				break;
			}
		}

		// Only update if something changed
		if (dropdownState.value !== valueToUse || dropdownState.title !== title) {
			setDropdownState({ value: valueToUse, title });
		}
	}, [
		props.value,
		descendantsContext.map.current,
		dropdownState.title,
		dropdownState.value,
		props.defaultValue,
	]); // Run when props.value changes and on mount

	const dropdownContextValue = useMemo(
		() => ({
			currentSection: undefined,
		}),
		[]
	);

	// Open dropdown dialog when triggered
	useEffect(() => {
		if (isDropdownOpen && !dialog.stack.length) {
			// Pass the children to the dialog to render them there
			dialog.push(
				<ListDropdownDialog
					{...props}
					value={dropdownState.value}
					onChange={(newValue) => {
						// Find the title for this value
						let title = newValue;
						for (const item of Object.values(descendantsContext.map.current)) {
							const itemProps = item.props as DropdownItemDescendant;
							if (itemProps.value === newValue) {
								title = itemProps.title;
								break;
							}
						}
						setDropdownState({ value: newValue, title });
						setIsDropdownOpen(false);
						dialog.clear();

						// Handle value persistence and onChange callback
						handleDropdownValueChange(
							props.id || "default",
							newValue,
							props.storeValue || false,
							props.onChange
						);
					}}
					onCancel={() => {
						setIsDropdownOpen(false);
						dialog.clear();
					}}
				>
					{props.children}
				</ListDropdownDialog>,
				"top-right"
			);
		}
	}, [
		isDropdownOpen,
		props.children,
		dropdownState.value,
		props,
		descendantsContext.map.current, // Pass the children to the dialog to render them there
		dialog,
		setIsDropdownOpen,
	]);

	// If not inside a List, just render nothing (for type safety)
	if (!listContext) {
		return null;
	}

	// Display the title from our state
	const displayValue = dropdownState.title || "All";

	return (
		<DropdownDescendantsProvider value={descendantsContext}>
			<DropdownContext.Provider value={dropdownContextValue}>
				{/* Render children to collect items - they return null anyway */}
				{props.children}
				{/* Render dropdown UI */}
				<box
					key={dropdownState.value}
					style={{
						paddingTop: 1,
						paddingLeft: 2,
						flexDirection: "row",
						flexShrink: 0,
						backgroundColor: isHovered ? colors.background.highlight : undefined,
					}}
					onMouseMove={() => setIsHovered(true)}
					onMouseOut={() => setIsHovered(false)}
					onMouseDown={() => {
						// Open dropdown when clicked
						if (!isDropdownOpen) {
							listContext.openDropdown();
						}
					}}
				>
					<text fg={isHovered ? colors.text.primary : colors.text.muted} selectable={false}>
						{displayValue}
					</text>
					<text fg={isHovered ? colors.text.primary : colors.text.muted} selectable={false}>
						{" "}
						▾
					</text>
				</box>
			</DropdownContext.Provider>
		</DropdownDescendantsProvider>
	);
};

ListDropdownComponent.Item = (props: DropdownItemProps) => {
	const dropdownContext = useContext(DropdownContext);
	const [isHovered, setIsHovered] = useState(false);
	const colors = useThemeColors();
	const componentStyles = useComponentStyles();

	// Register as descendant - must be called before early return
	const { index } = useDropdownItemDescendant({
		value: props.value,
		title: props.title,
		section: dropdownContext?.currentSection,
		visible: true, // We'll check visibility below
	});

	// If not inside a Dropdown, just render nothing
	if (!dropdownContext) {
		return null;
	}

	const {
		currentSection,
		selectedIndex,
		currentValue,
		setSelectedIndex,
		onChange,
		searchText,
		isFiltering,
	} = dropdownContext;

	// Check if this item is visible based on search
	const isVisible =
		!isFiltering ||
		!searchText ||
		shouldItemBeVisible(searchText, {
			title: props.title,
			keywords: currentSection ? [currentSection] : [],
		});

	// Don't render if not visible
	if (!isVisible) return null;

	// If we're in the dialog, render the item
	if (selectedIndex !== undefined) {
		const isActive = selectedIndex === index;
		const isCurrent = props.value === currentValue;

		const handleMouseMove = () => {
			setIsHovered(true);
			// Update selected index on hover
			if (setSelectedIndex && index !== selectedIndex) {
				setSelectedIndex(index);
			}
		};

		const handleMouseDown = () => {
			// Trigger selection on click
			if (onChange) {
				onChange(props.value);
			}
		};

		return (
			<box
				style={{
					flexDirection: "row",
					backgroundColor: isActive
						? componentStyles.dropdown.item.activeBackgroundColor
						: isHovered
							? componentStyles.dropdown.item.hoverBackgroundColor
							: componentStyles.dropdown.item.backgroundColor,
					paddingLeft: isActive ? 0 : 1,
					paddingRight: 1,
					justifyContent: "space-between",
				}}
				border={false}
				onMouseMove={handleMouseMove}
				onMouseOut={() => setIsHovered(false)}
				onMouseDown={handleMouseDown}
			>
				<box style={{ flexDirection: "row" }}>
					{isActive && (
						<text fg={colors.background.main} selectable={false}>
							›{""}
						</text>
					)}
					<text
						fg={
							isActive
								? componentStyles.dropdown.text.active
								: isCurrent
									? colors.accent.primary
									: componentStyles.dropdown.text.default
						}
						attributes={isActive ? TextAttributes.BOLD : undefined}
						selectable={false}
					>
						{props.title}
					</text>
				</box>
			</box>
		);
	}

	return null;
};

ListDropdownComponent.Section = (props: DropdownSectionProps) => {
	const parentContext = useContext(DropdownContext);
	const colors = useThemeColors();

	// Create a new context with the section name
	const sectionContextValue = useMemo(
		() => ({
			...parentContext,
			currentSection: props.title,
		}),
		[parentContext, props.title]
	);

	// If not inside a Dropdown, just render nothing
	if (!parentContext) {
		return null;
	}

	// Hide section title when searching
	const showTitle =
		parentContext.selectedIndex !== undefined && props.title && !parentContext.searchText?.trim();

	return (
		<>
			{/* Render section title if we're in the dialog and not searching */}
			{showTitle && (
				<box style={{ paddingTop: 1, paddingLeft: 1 }}>
					<text fg={colors.accent.secondary} attributes={TextAttributes.BOLD}>
						{props.title}
					</text>
				</box>
			)}
			<DropdownContext.Provider value={sectionContextValue}>
				{props.children}
			</DropdownContext.Provider>
		</>
	);
};

// Export with proper typing - sub-components will be attached in index.tsx
export const ListDropdown = ListDropdownComponent as ListDropdownType;
