import type { InputRenderable } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { type ReactNode, type Ref, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useComponentStyles, useThemeColors } from "../../styles/theme-system";
import { useIsInFocus } from "../../utils/focus-context";
import { useNavigationPending } from "../../utils/navigation";
import { useDialog } from "../dialog";
import { LoadingBar } from "../loading-bar";
import { ListContext, ListDescendantsProvider, useListDescendants } from "./context";
import { ListFooter } from "./list-footer";
import { ListItemsRenderer } from "./list-items-renderer";
import type { EmptyViewProps, ListProps, ListType } from "./types";

const ListComponent = (props: ListProps) => {
	const {
		children,
		filtering = true,
		searchText: controlledSearchText,
		onSearchTextChange,
		searchBarPlaceholder = "Search...",
		isLoading,
		isShowingDetail,
		selectedItemId,
		searchBarAccessory,
		navigationTitle,
	} = props;

	const [internalSearchText, setInternalSearchTextRaw] = useState("");
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [currentDetail, setCurrentDetail] = useState<ReactNode>(null);
	const inputRef = useRef<InputRenderable>(null);
	const descendantsContext = useListDescendants();
	const navigationPending = useNavigationPending();
	const colors = useThemeColors();
	const componentStyles = useComponentStyles();

	const searchText = controlledSearchText !== undefined ? controlledSearchText : internalSearchText;

	// Determine if filtering is enabled
	const isFilteringEnabled = (() => {
		if (filtering === false) return false;
		if (filtering === true) return true;
		// filtering is undefined/not specified
		return !onSearchTextChange; // defaults to true unless onSearchTextChange is provided
	})();

	const openDropdown = useCallback(() => {
		setIsDropdownOpen(true);
	}, []);

	// Wrapper function that updates search text
	const setInternalSearchText = useCallback((value: string) => {
		setInternalSearchTextRaw(value);
		// Reset to 0 when search changes - this is expected UX behavior
		setSelectedIndex(0);
	}, []);

	const listContextValue = useMemo(
		() => ({
			isDropdownOpen,
			setIsDropdownOpen,
			openDropdown,
			selectedIndex,
			setSelectedIndex,
			searchText,
			isFiltering: isFilteringEnabled,
			setCurrentDetail,
			isShowingDetail,
		}),
		[isDropdownOpen, selectedIndex, searchText, isFilteringEnabled, isShowingDetail, openDropdown]
	);

	// Clear detail when detail view is hidden
	useEffect(() => {
		if (!isShowingDetail) {
			setCurrentDetail(null);
		}
	}, [isShowingDetail]);

	// Handle selectedItemId prop changes
	useEffect(() => {
		// Only update selection if selectedItemId is explicitly provided
		if (selectedItemId !== undefined) {
			const items = Object.values(descendantsContext.map.current)
				.filter((item) => item.index !== -1)
				.sort((a, b) => a.index - b.index);

			const index = items.findIndex((item) => item.props?.id === selectedItemId);
			if (index !== -1) {
				setSelectedIndex(index);
			}
		}
	}, [selectedItemId, descendantsContext.map.current]);

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

	// Handle keyboard navigation
	const inFocus = useIsInFocus();
	const dialog = useDialog();

	useKeyboard((evt) => {
		if (!inFocus) return;

		// Handle Ctrl+P for dropdown
		if (evt.ctrl && evt.name === "p" && searchBarAccessory && !isDropdownOpen) {
			openDropdown();
			return;
		}

		// Handle Ctrl+K to show actions
		if (evt.name === "k" && evt.ctrl) {
			const items = Object.values(descendantsContext.map.current)
				.filter((item) => item.index !== -1)
				.sort((a, b) => a.index - b.index);

			const currentItem = items.find((item) => item.index === selectedIndex);

			// Show current item's actions if available
			if (currentItem?.props?.actions) {
				dialog.push(currentItem.props.actions, "bottom-right");
			}
			// Otherwise show List's own actions
			else if (props.actions) {
				dialog.push(props.actions, "bottom-right");
			}
			return;
		}

		if (evt.name === "up") move(-1);
		if (evt.name === "down") move(1);
		if (evt.name === "return") {
			const items = Object.values(descendantsContext.map.current)
				.filter((item) => item.index !== -1)
				.sort((a, b) => a.index - b.index);

			const currentItem = items.find((item) => item.index === selectedIndex);
			if (!currentItem?.props) return;

			if (currentItem.props.actions) {
				dialog.push(currentItem.props.actions, "bottom-right");
			}
		}
	});

	const handleSearchChange = (newValue: string) => {
		if (!inFocus) return;

		// Always call onSearchTextChange if provided
		if (onSearchTextChange) {
			onSearchTextChange(newValue);
		}

		if (controlledSearchText === undefined) {
			setInternalSearchText(newValue);
		}
	};

	return (
		<ListContext.Provider value={listContextValue}>
			<ListDescendantsProvider value={descendantsContext}>
				<box style={{ flexDirection: "column", flexGrow: 1 }}>
					{navigationTitle && (
						<box
							border={false}
							style={{
								paddingBottom: 0,
								flexGrow: 1,
							}}
						>
							<LoadingBar title={navigationTitle} isLoading={isLoading || navigationPending} />
						</box>
					)}

					{/* Search bar with optional dropdown accessory */}
					<box>
						<box
							border={false}
							style={{
								paddingLeft: 1,
								paddingRight: 1,
								marginTop: 1,
								marginBottom: 1,
								flexDirection: "row",
								justifyContent: "space-between",
								alignItems: "center",
							}}
						>
							<box
								style={{
									flexGrow: 1,
									flexDirection: "column",
									flexShrink: 1,
								}}
							>
								<input
									ref={inputRef as Ref<InputRenderable>}
									placeholder={searchBarPlaceholder}
									focused={inFocus && !isDropdownOpen}
									value={searchText}
									onInput={handleSearchChange}
									focusedBackgroundColor={componentStyles.list.searchBar.backgroundColor}
									cursorColor={componentStyles.list.searchBar.cursorColor}
									focusedTextColor={componentStyles.list.searchBar.textColor}
								/>
							</box>
							{searchBarAccessory}
						</box>
					</box>

					{/* Main content area with optional detail view */}
					<box style={{ flexDirection: "row", flexGrow: 1 }}>
						{/* List content - render children which will register themselves */}
						<box
							style={{
								marginTop: 1,
								width: isShowingDetail ? "50%" : "100%",
								flexGrow: isShowingDetail ? 0 : 1,
							}}
						>
							{/* Render children - they will register as descendants */}
							<ListItemsRenderer>{children}</ListItemsRenderer>

							{/* Footer with keyboard shortcuts or toast */}
							<ListFooter />
						</box>

						{/* Detail panel on the right */}
						{isShowingDetail && currentDetail && (
							<box
								style={{
									marginTop: 1,
									width: "50%",
									paddingLeft: 1,
									paddingRight: 1,
								}}
								border={["left"]}
								borderStyle="single"
								borderColor={componentStyles.list.detail.borderColor}
							>
								{currentDetail}
							</box>
						)}
					</box>
				</box>
			</ListDescendantsProvider>
		</ListContext.Provider>
	);
};

ListComponent.EmptyView = (_props: EmptyViewProps) => {
	return null;
};

// Export with proper typing - sub-components will be attached in index.tsx
export const List = ListComponent as unknown as ListType;
