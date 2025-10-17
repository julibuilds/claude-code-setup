import { type InputRenderable, TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { type ReactNode, type Ref, useRef, useState } from "react";
import { useThemeColors } from "../../styles/theme-system";
import { useIsInFocus } from "../../utils/focus-context";
import { DropdownContext, DropdownDescendantsProvider, useDropdownDescendants } from "./context";
import type { DropdownItemDescendant, DropdownProps } from "./types";

// Dropdown dialog component
export interface ListDropdownDialogProps extends DropdownProps {
	onCancel: () => void;
}

export function ListDropdownDialog(props: ListDropdownDialogProps): ReactNode {
	const [searchText, setSearchTextRaw] = useState("");
	const [selectedIndex, setSelectedIndex] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);
	const descendantsContext = useDropdownDescendants();
	const colors = useThemeColors();

	// Wrapper function that updates search text
	const setSearchText = (value: string) => {
		setSearchTextRaw(value);
		setSelectedIndex(0); // Reset selection when search changes
	};

	const move = (direction: -1 | 1) => {
		// Get all visible items
		const items = Object.values(descendantsContext.map.current)
			.filter((item) => item.index !== -1 && item.props?.visible !== false)
			.sort((a, b) => a.index - b.index);

		if (items.length === 0) return;

		// Find currently selected item's position in visible items
		const currentVisibleIndex = items.findIndex((item) => item.index === selectedIndex);
		if (currentVisibleIndex === -1) {
			// If current selection is not visible, select first visible item
			if (items[0]) {
				setSelectedIndex(items[0].index);
			}
			return;
		}

		// Calculate next visible index
		let nextVisibleIndex = currentVisibleIndex + direction;
		if (nextVisibleIndex < 0) nextVisibleIndex = items.length - 1;
		if (nextVisibleIndex >= items.length) nextVisibleIndex = 0;

		const nextItem = items[nextVisibleIndex];
		if (nextItem) {
			setSelectedIndex(nextItem.index);
		}
	};

	const inFocus = useIsInFocus();

	useKeyboard((evt) => {
		if (!inFocus) return;

		if (evt.name === "escape") {
			props.onCancel();
		}
		if (evt.name === "up") move(-1);
		if (evt.name === "down") move(1);
		if (evt.name === "return") {
			const items = Object.values(descendantsContext.map.current)
				.filter((item) => item.index !== -1)
				.sort((a, b) => a.index - b.index);

			const currentItem = items.find((item) => item.index === selectedIndex);
			if (currentItem?.props) {
				props.onChange?.((currentItem.props as DropdownItemDescendant).value);
			}
		}
	});

	return (
		<DropdownDescendantsProvider value={descendantsContext}>
			<box>
				<box style={{ paddingLeft: 2, paddingRight: 2 }}>
					<box style={{ paddingLeft: 1, paddingRight: 1 }}>
						{/* Header */}
						<box
							style={{
								flexDirection: "row",
								justifyContent: "space-between",
							}}
						>
							<text attributes={TextAttributes.BOLD}>{props.tooltip}</text>
							<text fg={colors.text.muted}>esc</text>
						</box>
						<box style={{ paddingTop: 1, paddingBottom: 1 }}>
							<input
								ref={inputRef as Ref<InputRenderable>}
								onInput={setSearchText}
								placeholder={props.placeholder || "Search..."}
								focused={inFocus}
								value={searchText}
								focusedBackgroundColor={colors.background.panel}
								cursorColor={colors.accent.primary}
								focusedTextColor={colors.text.muted}
							/>
						</box>
					</box>

					{/* Items list - children will render themselves */}
					<box style={{ paddingBottom: 1 }}>
						<DropdownContext.Provider
							value={{
								currentSection: undefined,
								selectedIndex,
								setSelectedIndex,
								currentValue: props.value,
								searchText,
								isFiltering: true, // Dropdown always has filtering enabled
								onChange: (value: string) => {
									props.onChange?.(value);
								},
							}}
						>
							{props.children}
						</DropdownContext.Provider>
					</box>
					{props.isLoading && (
						<box style={{ paddingLeft: 1 }}>
							<text fg={colors.text.muted}>Loading...</text>
						</box>
					)}
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
		</DropdownDescendantsProvider>
	);
}
