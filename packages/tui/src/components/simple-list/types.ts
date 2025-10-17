import type { ReactNode } from "react";
import type { ComponentStyles } from "../../styles/types";

// ============================================================================
// Core Primitive Types
// ============================================================================

/**
 * A unique identifier for list items
 */
export type ItemId = string | number;

/**
 * Basic item data that can be extended by consumers
 */
export interface BaseItemData {
	id: ItemId;
	[key: string]: unknown;
}

/**
 * Configuration for keyboard navigation behavior
 */
export interface NavigationConfig {
	/**
	 * Whether to wrap around when reaching the end/beginning
	 * @default true
	 */
	wrap?: boolean;
	/**
	 * Whether to allow keyboard navigation
	 * @default true
	 */
	enabled?: boolean;
	/**
	 * Custom key mappings for navigation
	 */
	keys?: {
		up?: string;
		down?: string;
		select?: string;
		escape?: string;
	};
}

/**
 * Configuration for selection behavior
 */
export interface SelectionConfig {
	/**
	 * Whether multiple items can be selected
	 * @default false
	 */
	multiple?: boolean;
	/**
	 * Whether selection is required (at least one item must be selected)
	 * @default false
	 */
	required?: boolean;
	/**
	 * Whether clicking an item selects it
	 * @default true
	 */
	clickToSelect?: boolean;
}

// ============================================================================
// List Container Props
// ============================================================================

export interface ListContainerProps {
	/**
	 * Array of items to display
	 */
	items: BaseItemData[];
	/**
	 * Currently selected item IDs
	 */
	selectedIds?: ItemId[];
	/**
	 * Callback when selection changes
	 */
	onSelectionChange?: (selectedIds: ItemId[]) => void;
	/**
	 * Callback when an item is activated (double-click, Enter, etc.)
	 */
	onItemActivate?: (item: BaseItemData) => void;
	/**
	 * Navigation configuration
	 */
	navigation?: NavigationConfig;
	/**
	 * Selection configuration
	 */
	selection?: SelectionConfig;
	/**
	 * Whether the list is focused and can receive keyboard input
	 * @default true
	 */
	focused?: boolean;
	/**
	 * Custom render function for items
	 */
	renderItem?: (props: ListItemRenderProps) => ReactNode;
	/**
	 * Additional CSS styles for the container
	 */
	style?: Record<string, unknown>;
	/**
	 * Additional props passed to the container element
	 */
	containerProps?: Record<string, unknown>;
	/**
	 * Children (alternative to items prop)
	 */
	children?: ReactNode;
	/**
	 * Custom theme overrides for list styling
	 */
	themeOverrides?: Partial<ComponentStyles["list"]>;
}

// ============================================================================
// List Item Props
// ============================================================================

export interface ListItemProps {
	/**
	 * The item data
	 */
	item: BaseItemData;
	/**
	 * Whether this item is currently selected
	 */
	selected?: boolean;
	/**
	 * Whether this item is currently focused/highlighted
	 */
	focused?: boolean;
	/**
	 * Callback when this item is clicked
	 */
	onClick?: (item: BaseItemData) => void;
	/**
	 * Callback when this item is activated
	 */
	onActivate?: (item: BaseItemData) => void;
	/**
	 * Custom render function for the item content
	 */
	renderContent?: (props: ListItemContentProps) => ReactNode;
	/**
	 * Additional CSS styles for the item
	 */
	style?: Record<string, unknown>;
	/**
	 * Additional props passed to the item element
	 */
	itemProps?: Record<string, unknown>;
	/**
	 * Children (alternative to renderContent)
	 */
	children?: ReactNode;
	/**
	 * Custom theme overrides for item styling
	 */
	themeOverrides?: Partial<ComponentStyles["list"]["item"]>;
}

// ============================================================================
// Render Props Types
// ============================================================================

export interface ListItemRenderProps {
	item: BaseItemData;
	selected: boolean;
	focused: boolean;
	index: number;
	onClick: () => void;
	onActivate: () => void;
}

export interface ListItemContentProps {
	item: BaseItemData;
	selected: boolean;
	focused: boolean;
	index: number;
}

// ============================================================================
// Context Types
// ============================================================================

export interface ListContextValue {
	/**
	 * Array of items
	 */
	items: BaseItemData[];
	/**
	 * Currently selected item IDs
	 */
	selectedIds: ItemId[];
	/**
	 * Currently focused item index
	 */
	focusedIndex: number;
	/**
	 * Navigation configuration
	 */
	navigation: Required<NavigationConfig>;
	/**
	 * Selection configuration
	 */
	selection: Required<SelectionConfig>;
	/**
	 * Whether the list is focused
	 */
	focused: boolean;
	/**
	 * Callbacks
	 */
	onSelectionChange: (selectedIds: ItemId[]) => void;
	onItemActivate: (item: BaseItemData) => void;
	/**
	 * Internal state setters (for internal use)
	 */
	setFocusedIndex: (index: number) => void;
	setSelectedIds: (ids: ItemId[]) => void;
}

// ============================================================================
// Hook Return Types
// ============================================================================

export interface UseListNavigationReturn {
	/**
	 * Currently focused item index
	 */
	focusedIndex: number;
	/**
	 * Currently focused item
	 */
	focusedItem: BaseItemData | null;
	/**
	 * Move focus up
	 */
	moveUp: () => void;
	/**
	 * Move focus down
	 */
	moveDown: () => void;
	/**
	 * Move focus to specific index
	 */
	moveTo: (index: number) => void;
	/**
	 * Move focus to specific item by ID
	 */
	moveToItem: (id: ItemId) => void;
}

export interface UseListSelectionReturn {
	/**
	 * Currently selected item IDs
	 */
	selectedIds: ItemId[];
	/**
	 * Currently selected items
	 */
	selectedItems: BaseItemData[];
	/**
	 * Whether an item is selected
	 */
	isSelected: (id: ItemId) => boolean;
	/**
	 * Select an item
	 */
	select: (id: ItemId) => void;
	/**
	 * Deselect an item
	 */
	deselect: (id: ItemId) => void;
	/**
	 * Toggle selection of an item
	 */
	toggle: (id: ItemId) => void;
	/**
	 * Select all items
	 */
	selectAll: () => void;
	/**
	 * Deselect all items
	 */
	deselectAll: () => void;
	/**
	 * Set selection to specific items
	 */
	setSelection: (ids: ItemId[]) => void;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Extract the item data type from a list container
 */
export type ExtractItemData<T> = T extends { items: (infer U)[] } ? U : never;

/**
 * Create a typed list container props interface
 */
export interface TypedListContainerProps<T extends BaseItemData>
	extends Omit<ListContainerProps, "items" | "onItemActivate" | "renderItem"> {
	items: T[];
	onItemActivate?: (item: T) => void;
	renderItem?: (props: ListItemRenderProps & { item: T }) => ReactNode;
}

/**
 * Create a typed list item props interface
 */
export interface TypedListItemProps<T extends BaseItemData>
	extends Omit<ListItemProps, "item" | "onClick" | "onActivate" | "renderContent"> {
	item: T;
	onClick?: (item: T) => void;
	onActivate?: (item: T) => void;
	renderContent?: (props: ListItemContentProps & { item: T }) => ReactNode;
}
