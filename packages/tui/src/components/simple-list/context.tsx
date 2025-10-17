import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type {
	BaseItemData,
	ItemId,
	ListContextValue,
	NavigationConfig,
	SelectionConfig,
} from "./types";

// ============================================================================
// Context Creation
// ============================================================================

export const ListContext = createContext<ListContextValue | undefined>(undefined);

// ============================================================================
// Context Provider Component
// ============================================================================

export interface ListProviderProps {
	children: React.ReactNode;
	items: BaseItemData[];
	selectedIds?: ItemId[];
	onSelectionChange?: (selectedIds: ItemId[]) => void;
	onItemActivate?: (item: BaseItemData) => void;
	navigation?: NavigationConfig;
	selection?: SelectionConfig;
	focused?: boolean;
}

export function ListProvider({
	children,
	items,
	selectedIds = [],
	onSelectionChange,
	onItemActivate,
	navigation = {},
	selection = {},
	focused = true,
}: ListProviderProps) {
	// Default navigation config
	const defaultNavigation: Required<NavigationConfig> = useMemo(
		() => ({
			wrap: true,
			enabled: true,
			keys: {
				up: "up",
				down: "down",
				select: "return",
				escape: "escape",
			},
			...navigation,
		}),
		[navigation]
	);

	// Default selection config
	const defaultSelection: Required<SelectionConfig> = useMemo(
		() => ({
			multiple: false,
			required: false,
			clickToSelect: true,
			...selection,
		}),
		[selection]
	);

	// Internal state management
	const [focusedIndex, setFocusedIndex] = useState(0);
	const [internalSelectedIds, setInternalSelectedIds] = useState<ItemId[]>(selectedIds);

	// Use external selectedIds if provided, otherwise use internal state
	const currentSelectedIds = selectedIds !== undefined ? selectedIds : internalSelectedIds;

	// Memoized callbacks
	const handleSelectionChange = useCallback(
		(newSelectedIds: ItemId[]) => {
			if (onSelectionChange) {
				onSelectionChange(newSelectedIds);
			} else {
				setInternalSelectedIds(newSelectedIds);
			}
		},
		[onSelectionChange]
	);

	const handleItemActivate = useCallback(
		(item: BaseItemData) => {
			onItemActivate?.(item);
		},
		[onItemActivate]
	);

	// Context value
	const contextValue: ListContextValue = useMemo(
		() => ({
			items,
			selectedIds: currentSelectedIds,
			focusedIndex,
			navigation: defaultNavigation,
			selection: defaultSelection,
			focused,
			onSelectionChange: handleSelectionChange,
			onItemActivate: handleItemActivate,
			setFocusedIndex,
			setSelectedIds: handleSelectionChange,
		}),
		[
			items,
			currentSelectedIds,
			focusedIndex,
			defaultNavigation,
			defaultSelection,
			focused,
			handleSelectionChange,
			handleItemActivate,
		]
	);

	return <ListContext.Provider value={contextValue}>{children}</ListContext.Provider>;
}

// ============================================================================
// Context Hooks
// ============================================================================

/**
 * Hook to access list context
 * @throws Error if used outside of ListProvider
 */
export function useListContext(): ListContextValue {
	const context = useContext(ListContext);
	if (!context) {
		throw new Error("useListContext must be used within a ListProvider");
	}
	return context;
}

/**
 * Hook to access list context safely (returns undefined if not in provider)
 */
export function useListContextSafe(): ListContextValue | undefined {
	return useContext(ListContext);
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Hook to get the currently focused item
 */
export function useFocusedItem(): BaseItemData | null {
	const { items, focusedIndex } = useListContext();
	return items[focusedIndex] || null;
}

/**
 * Hook to get all selected items
 */
export function useSelectedItems(): BaseItemData[] {
	const { items, selectedIds } = useListContext();
	return items.filter((item) => selectedIds.includes(item.id));
}

/**
 * Hook to check if an item is selected
 */
export function useIsItemSelected(itemId: ItemId): boolean {
	const { selectedIds } = useListContext();
	return selectedIds.includes(itemId);
}

/**
 * Hook to get selection count
 */
export function useSelectionCount(): number {
	const { selectedIds } = useListContext();
	return selectedIds.length;
}

/**
 * Hook to check if any items are selected
 */
export function useHasSelection(): boolean {
	const count = useSelectionCount();
	return count > 0;
}

/**
 * Hook to check if all items are selected
 */
export function useIsAllSelected(): boolean {
	const { items, selectedIds } = useListContext();
	return items.length > 0 && selectedIds.length === items.length;
}

// ============================================================================
// Action Hooks
// ============================================================================

/**
 * Hook to get selection actions
 */
export function useSelectionActions() {
	const { items, selectedIds, selection, onSelectionChange } = useListContext();

	const select = useCallback(
		(itemId: ItemId) => {
			if (selection.multiple) {
				const newSelectedIds = [...selectedIds, itemId];
				onSelectionChange(newSelectedIds);
			} else {
				onSelectionChange([itemId]);
			}
		},
		[selectedIds, selection.multiple, onSelectionChange]
	);

	const deselect = useCallback(
		(itemId: ItemId) => {
			const newSelectedIds = selectedIds.filter((id) => id !== itemId);
			onSelectionChange(newSelectedIds);
		},
		[selectedIds, onSelectionChange]
	);

	const toggle = useCallback(
		(itemId: ItemId) => {
			if (selectedIds.includes(itemId)) {
				deselect(itemId);
			} else {
				select(itemId);
			}
		},
		[selectedIds, select, deselect]
	);

	const selectAll = useCallback(() => {
		if (selection.multiple) {
			onSelectionChange(items.map((item) => item.id));
		}
	}, [items, selection.multiple, onSelectionChange]);

	const deselectAll = useCallback(() => {
		onSelectionChange([]);
	}, [onSelectionChange]);

	const setSelection = useCallback(
		(itemIds: ItemId[]) => {
			onSelectionChange(itemIds);
		},
		[onSelectionChange]
	);

	return {
		select,
		deselect,
		toggle,
		selectAll,
		deselectAll,
		setSelection,
	};
}

/**
 * Hook to get navigation actions
 */
export function useNavigationActions() {
	const { items, focusedIndex, navigation, setFocusedIndex } = useListContext();

	const moveUp = useCallback(() => {
		if (!navigation.enabled) return;

		const newIndex = focusedIndex - 1;
		if (newIndex < 0) {
			if (navigation.wrap) {
				setFocusedIndex(items.length - 1);
			} else {
				setFocusedIndex(0);
			}
		} else {
			setFocusedIndex(newIndex);
		}
	}, [focusedIndex, items.length, navigation.enabled, navigation.wrap, setFocusedIndex]);

	const moveDown = useCallback(() => {
		if (!navigation.enabled) return;

		const newIndex = focusedIndex + 1;
		if (newIndex >= items.length) {
			if (navigation.wrap) {
				setFocusedIndex(0);
			} else {
				setFocusedIndex(items.length - 1);
			}
		} else {
			setFocusedIndex(newIndex);
		}
	}, [focusedIndex, items.length, navigation.enabled, navigation.wrap, setFocusedIndex]);

	const moveTo = useCallback(
		(index: number) => {
			if (!navigation.enabled) return;

			const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
			setFocusedIndex(clampedIndex);
		},
		[items.length, navigation.enabled, setFocusedIndex]
	);

	const moveToItem = useCallback(
		(itemId: ItemId) => {
			if (!navigation.enabled) return;

			const index = items.findIndex((item) => item.id === itemId);
			if (index !== -1) {
				setFocusedIndex(index);
			}
		},
		[items, navigation.enabled, setFocusedIndex]
	);

	return {
		moveUp,
		moveDown,
		moveTo,
		moveToItem,
	};
}
