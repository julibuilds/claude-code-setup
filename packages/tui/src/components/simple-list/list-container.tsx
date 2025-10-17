import { useKeyboard } from "@opentui/react";
import React, { useCallback, useMemo } from "react";
import { useComponentStyles } from "../../styles/theme-hooks";
import type { ComponentStyles } from "../../styles/types";
import { ListProvider } from "./context";
import { ListItem } from "./list-item";
import type { ListContainerProps, ListItemRenderProps } from "./types";

// ============================================================================
// Default Item Renderer
// ============================================================================

function DefaultItemRenderer({
	item,
	selected,
	focused,
	onClick,
	onActivate,
}: ListItemRenderProps) {
	return (
		<ListItem
			item={item}
			selected={selected}
			focused={focused}
			onClick={onClick}
			onActivate={onActivate}
		/>
	);
}

// ============================================================================
// List Container Component
// ============================================================================

export function ListContainer({
	items,
	selectedIds,
	onSelectionChange,
	onItemActivate,
	navigation,
	selection,
	focused = true,
	renderItem: _renderItem,
	style = {},
	containerProps = {},
	children,
	themeOverrides,
}: ListContainerProps) {
	// Note: itemRenderer is available for future use
	// const itemRenderer = useMemo(() => {
	// 	return renderItem || DefaultItemRenderer;
	// }, [renderItem]);

	// Handle keyboard navigation
	useKeyboard(
		useCallback(
			(key) => {
				if (!focused) return;

				const { name } = key;
				const navKeys = navigation?.keys || {
					up: "up",
					down: "down",
					select: "return",
					escape: "escape",
				};

				// Handle navigation keys
				if (name === navKeys.up) {
					// Move up - handled by context
				} else if (name === navKeys.down) {
					// Move down - handled by context
				} else if (name === navKeys.select) {
					// Select/activate item - handled by context
				} else if (name === navKeys.escape) {
					// Escape - could be handled by parent
				}
			},
			[focused, navigation?.keys]
		)
	);

	// Get theme styles
	const componentStyles = useComponentStyles();

	// Merge theme overrides if provided
	const mergedListStyles = useMemo(() => {
		if (!themeOverrides) return componentStyles.list;

		return {
			...componentStyles.list,
			...themeOverrides,
			item: {
				...componentStyles.list.item,
				...themeOverrides.item,
			},
		};
	}, [componentStyles.list, themeOverrides]);

	// Container styles
	const containerStyle = useMemo(
		() => ({
			flexDirection: "column" as const,
			flexGrow: 1,
			backgroundColor: mergedListStyles.item.backgroundColor,
			...style,
		}),
		[style, mergedListStyles]
	);

	// If children are provided, render them directly
	if (children) {
		return (
			<ListProvider
				items={items}
				selectedIds={selectedIds}
				onSelectionChange={onSelectionChange}
				onItemActivate={onItemActivate}
				navigation={navigation}
				selection={selection}
				focused={focused}
			>
				<box style={containerStyle} {...containerProps}>
					{children}
				</box>
			</ListProvider>
		);
	}

	// Render items using the item renderer
	return (
		<ListProvider
			items={items}
			selectedIds={selectedIds}
			onSelectionChange={onSelectionChange}
			onItemActivate={onItemActivate}
			navigation={navigation}
			selection={selection}
			focused={focused}
		>
			<box style={containerStyle} {...containerProps}>
				{items.map((item) => {
					const selected = selectedIds?.includes(item.id) || false;
					const focused = false; // This will be managed by context

					const listItem = (
						<ListItem
							item={item}
							selected={selected}
							focused={focused}
							themeOverrides={mergedListStyles.item}
						/>
					) as React.ReactElement;
					return React.cloneElement(listItem, { key: item.id });
				})}
			</box>
		</ListProvider>
	);
}

// ============================================================================
// Typed List Container Component
// ============================================================================

export interface TypedListContainerProps<T extends { id: string | number; [key: string]: unknown }>
	extends Omit<ListContainerProps, "items" | "onItemActivate" | "renderItem"> {
	items: T[];
	onItemActivate?: (item: T) => void;
	renderItem?: (props: ListItemRenderProps & { item: T }) => React.ReactElement;
}

export function TypedListContainer<T extends { id: string | number; [key: string]: unknown }>({
	items,
	onItemActivate,
	renderItem,
	...props
}: TypedListContainerProps<T>) {
	const handleItemActivate = useCallback(
		(item: { id: string | number; [key: string]: unknown }) => {
			const typedItem = items.find((i) => i.id === item.id) as T;
			if (typedItem && onItemActivate) {
				onItemActivate(typedItem);
			}
		},
		[items, onItemActivate]
	);

	const handleRenderItem = useCallback(
		(renderProps: ListItemRenderProps): React.ReactNode => {
			if (renderItem) {
				const typedItem = items.find((i) => i.id === renderProps.item.id) as T;
				if (typedItem) {
					const result = renderItem({ ...renderProps, item: typedItem });
					return result;
				}
			}
			return <DefaultItemRenderer {...renderProps} />;
		},
		[items, renderItem]
	);

	return (
		<ListContainer
			items={items}
			onItemActivate={handleItemActivate}
			renderItem={handleRenderItem}
			{...props}
		/>
	);
}

// ============================================================================
// Simple List Component (Higher-level API)
// ============================================================================

export interface SimpleListProps<
	T extends { id: string | number; [key: string]: unknown } = {
		id: string | number;
		[key: string]: unknown;
	},
> {
	/**
	 * Array of items to display
	 */
	items: T[];
	/**
	 * Currently selected item IDs
	 */
	selectedIds?: (string | number)[];
	/**
	 * Callback when selection changes
	 */
	onSelectionChange?: (selectedIds: (string | number)[]) => void;
	/**
	 * Callback when an item is activated
	 */
	onItemActivate?: (item: T) => void;
	/**
	 * Whether multiple items can be selected
	 * @default false
	 */
	multiple?: boolean;
	/**
	 * Whether the list is focused and can receive keyboard input
	 * @default true
	 */
	focused?: boolean;
	/**
	 * Custom render function for items
	 */
	renderItem?: (props: {
		item: T;
		selected: boolean;
		focused: boolean;
		index: number;
	}) => React.ReactElement;
	/**
	 * Additional CSS styles for the container
	 */
	style?: Record<string, unknown>;
	/**
	 * Custom theme overrides for list styling
	 */
	themeOverrides?: Partial<ComponentStyles["list"]>;
}

export function SimpleList<T extends { id: string | number; [key: string]: unknown }>({
	items,
	selectedIds,
	onSelectionChange,
	onItemActivate,
	multiple = false,
	focused = true,
	renderItem,
	style,
	themeOverrides,
}: SimpleListProps<T>) {
	return (
		<TypedListContainer
			items={items}
			selectedIds={selectedIds}
			onSelectionChange={onSelectionChange}
			onItemActivate={onItemActivate}
			selection={{ multiple }}
			focused={focused}
			renderItem={renderItem}
			style={style}
			themeOverrides={themeOverrides}
		/>
	);
}
