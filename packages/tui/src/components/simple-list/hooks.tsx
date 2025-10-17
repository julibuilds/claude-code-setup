import { useKeyboard } from "@opentui/react";
import { useCallback, useEffect, useMemo } from "react";
import {
	useFocusedItem,
	useHasSelection,
	useIsAllSelected,
	useIsItemSelected,
	useListContext,
	useNavigationActions,
	useSelectedItems,
	useSelectionActions,
	useSelectionCount,
} from "./context";
import type { ItemId, UseListNavigationReturn, UseListSelectionReturn } from "./types";

// ============================================================================
// Navigation Hook
// ============================================================================

export function useListNavigation(): UseListNavigationReturn {
	const { focusedIndex } = useListContext();
	const { moveUp, moveDown, moveTo, moveToItem } = useNavigationActions();
	const focusedItem = useFocusedItem();

	return {
		focusedIndex,
		focusedItem,
		moveUp,
		moveDown,
		moveTo,
		moveToItem,
	};
}

// ============================================================================
// Selection Hook
// ============================================================================

export function useListSelection(): UseListSelectionReturn {
	const { selectedIds } = useListContext();
	const selectedItems = useSelectedItems();
	const { select, deselect, toggle, selectAll, deselectAll, setSelection } = useSelectionActions();
	const isSelected = useIsItemSelected;

	return {
		selectedIds,
		selectedItems,
		isSelected,
		select,
		deselect,
		toggle,
		selectAll,
		deselectAll,
		setSelection,
	};
}

// ============================================================================
// Keyboard Navigation Hook
// ============================================================================

export interface UseListKeyboardOptions {
	/**
	 * Whether to enable keyboard navigation
	 * @default true
	 */
	enabled?: boolean;
	/**
	 * Custom key mappings
	 */
	keys?: {
		up?: string;
		down?: string;
		select?: string;
		activate?: string;
		escape?: string;
		selectAll?: string;
		deselectAll?: string;
	};
	/**
	 * Callback when escape is pressed
	 */
	onEscape?: () => void;
	/**
	 * Callback when an item is activated via keyboard
	 */
	onActivate?: (item: { id: ItemId; [key: string]: unknown }) => void;
}

export function useListKeyboard(options: UseListKeyboardOptions = {}) {
	const { enabled = true, keys = {}, onEscape, onActivate } = options;

	const { focused, onItemActivate } = useListContext();
	const { moveUp, moveDown } = useNavigationActions();
	const { toggle, selectAll, deselectAll } = useSelectionActions();
	const { focusedItem } = useListNavigation();

	// Default key mappings
	const defaultKeys = useMemo(
		() => ({
			up: "up",
			down: "down",
			select: "space",
			activate: "return",
			escape: "escape",
			selectAll: "ctrl+a",
			deselectAll: "ctrl+d",
			...keys,
		}),
		[keys]
	);

	// Handle keyboard input
	useKeyboard(
		useCallback(
			(key) => {
				if (!enabled || !focused) return;

				const { name, ctrl } = key;
				const keyCombo = ctrl ? `ctrl+${name}` : name;

				// Navigation
				if (name === defaultKeys.up) {
					moveUp();
				} else if (name === defaultKeys.down) {
					moveDown();
				}
				// Selection
				else if (name === defaultKeys.select) {
					if (focusedItem) {
						toggle(focusedItem.id);
					}
				}
				// Activation
				else if (name === defaultKeys.activate) {
					if (focusedItem) {
						if (onActivate) {
							onActivate(focusedItem);
						} else {
							onItemActivate(focusedItem);
						}
					}
				}
				// Escape
				else if (name === defaultKeys.escape) {
					onEscape?.();
				}
				// Select all
				else if (keyCombo === defaultKeys.selectAll) {
					selectAll();
				}
				// Deselect all
				else if (keyCombo === defaultKeys.deselectAll) {
					deselectAll();
				}
			},
			[
				enabled,
				focused,
				defaultKeys,
				moveUp,
				moveDown,
				toggle,
				selectAll,
				deselectAll,
				focusedItem,
				onActivate,
				onItemActivate,
				onEscape,
			]
		)
	);

	return {
		enabled,
		keys: defaultKeys,
	};
}

// ============================================================================
// Auto-focus Hook
// ============================================================================

export interface UseAutoFocusOptions {
	/**
	 * Whether to automatically focus the first item when items change
	 * @default true
	 */
	autoFocusFirst?: boolean;
	/**
	 * Whether to maintain focus on the same item when items change
	 * @default false
	 */
	maintainFocus?: boolean;
	/**
	 * Whether to focus a specific item by ID
	 */
	focusItemId?: ItemId;
}

export function useAutoFocus(options: UseAutoFocusOptions = {}) {
	const { autoFocusFirst = true, maintainFocus = false, focusItemId } = options;

	const { items, focusedIndex, setFocusedIndex } = useListContext();
	const { moveToItem } = useNavigationActions();

	// Auto-focus logic
	useEffect(() => {
		if (items.length === 0) return;

		// Focus specific item if requested
		if (focusItemId !== undefined) {
			moveToItem(focusItemId);
			return;
		}

		// Maintain focus on same item if enabled
		if (maintainFocus && focusedIndex < items.length) {
			return;
		}

		// Auto-focus first item
		if (autoFocusFirst) {
			setFocusedIndex(0);
		}
	}, [
		items.length,
		focusItemId,
		maintainFocus,
		autoFocusFirst,
		focusedIndex,
		setFocusedIndex,
		moveToItem,
	]);

	return {
		focusFirst: () => setFocusedIndex(0),
		focusLast: () => setFocusedIndex(items.length - 1),
		focusItem: moveToItem,
	};
}

// ============================================================================
// Selection State Hook
// ============================================================================

export function useListSelectionState() {
	const { selectedIds } = useListContext();
	const selectedItems = useSelectedItems();
	const selectionCount = useSelectionCount();
	const hasSelection = useHasSelection();
	const isAllSelected = useIsAllSelected();

	return {
		selectedIds,
		selectedItems,
		selectionCount,
		hasSelection,
		isAllSelected,
	};
}

// ============================================================================
// Focus State Hook
// ============================================================================

export function useListFocusState() {
	const { focusedIndex, items } = useListContext();
	const focusedItem = useFocusedItem();

	return {
		focusedIndex,
		focusedItem,
		totalItems: items.length,
		isFirstItem: focusedIndex === 0,
		isLastItem: focusedIndex === items.length - 1,
	};
}

// ============================================================================
// Combined List State Hook
// ============================================================================

export function useListState() {
	const navigation = useListNavigation();
	const selection = useListSelection();
	const focusState = useListFocusState();
	const selectionState = useListSelectionState();

	return {
		navigation,
		selection,
		focusState,
		selectionState,
	};
}
