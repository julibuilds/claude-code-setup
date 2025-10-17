import { useCallback, useMemo } from "react";
import { useComponentStyles } from "../../styles/theme-hooks";
import type { ComponentStyles } from "../../styles/types";
import { useListContextSafe } from "./context";
import type { ListItemContentProps, ListItemProps } from "./types";

// ============================================================================
// Default List Item Content Component
// ============================================================================

export interface DefaultListItemContentProps extends ListItemContentProps {
	/**
	 * Custom render function for the item content
	 */
	renderContent?: (props: ListItemContentProps) => React.ReactNode;
	/**
	 * Children (alternative to renderContent)
	 */
	children?: React.ReactNode;
	/**
	 * Custom theme overrides for item styling
	 */
	themeOverrides?: Partial<ComponentStyles["list"]["item"]>;
}

function DefaultListItemContent({
	item,
	selected,
	focused,
	index,
	renderContent,
	children,
	themeOverrides,
}: DefaultListItemContentProps): React.ReactNode {
	// Get theme styles
	const componentStyles = useComponentStyles();

	// Merge theme overrides if provided
	const mergedItemStyles = useMemo(() => {
		if (!themeOverrides) return componentStyles.list.item;

		return {
			...componentStyles.list.item,
			...themeOverrides,
		};
	}, [componentStyles.list.item, themeOverrides]);

	// Use custom render function if provided
	if (renderContent) {
		return renderContent({ item, selected, focused, index });
	}

	// Use children if provided
	if (children) {
		return <text fg={mergedItemStyles.textColor}>{String(children)}</text>;
	}

	// Default rendering - just show the item ID and some basic info
	return (
		<text fg={mergedItemStyles.textColor}>
			{focused ? "▶ " : "  "}
			{selected ? "[✓] " : "[ ] "}
			Item {item.id}
		</text>
	);
}

// ============================================================================
// List Item Component
// ============================================================================

export function ListItem({
	item,
	selected: externalSelected,
	focused: externalFocused,
	onClick: _externalOnClick,
	onActivate: _externalOnActivate,
	renderContent,
	style = {},
	itemProps = {},
	children,
	themeOverrides,
}: ListItemProps) {
	// Get context if available (allows ListItem to work standalone or within ListProvider)
	const context = useListContextSafe();

	// Determine if this item is selected
	const contextSelected = context ? context.selectedIds.includes(item.id) : false;
	const selected = externalSelected !== undefined ? externalSelected : contextSelected;

	// Determine if this item is focused
	const contextFocused = context
		? context.focusedIndex === context.items.findIndex((i) => i.id === item.id)
		: false;
	const focused = externalFocused !== undefined ? externalFocused : contextFocused;

	// Get item index
	const index = context ? context.items.findIndex((i) => i.id === item.id) : -1;

	// Memoize content props
	const contentProps = useMemo(
		() => ({
			item,
			selected,
			focused,
			index,
		}),
		[item, selected, focused, index]
	);

	// Get theme styles
	const componentStyles = useComponentStyles();

	// Merge theme overrides if provided
	const mergedItemStyles = useMemo(() => {
		if (!themeOverrides) return componentStyles.list.item;

		return {
			...componentStyles.list.item,
			...themeOverrides,
		};
	}, [componentStyles.list.item, themeOverrides]);

	// Determine styling based on state
	const itemStyle = useMemo(
		() => ({
			backgroundColor: focused
				? mergedItemStyles.activeBackgroundColor
				: selected
					? mergedItemStyles.hoverBackgroundColor
					: mergedItemStyles.backgroundColor,
			border: focused ? true : false,
			padding: 1,
			marginBottom: 0.5,
			...style,
		}),
		[focused, selected, style, mergedItemStyles]
	);

	return (
		<box style={itemStyle} {...itemProps}>
			<DefaultListItemContent
				{...contentProps}
				renderContent={renderContent}
				themeOverrides={mergedItemStyles}
			>
				{children}
			</DefaultListItemContent>
		</box>
	);
}

// ============================================================================
// Typed List Item Component
// ============================================================================

export interface TypedListItemProps<T extends { id: string | number; [key: string]: unknown }>
	extends Omit<ListItemProps, "item" | "onClick" | "onActivate" | "renderContent"> {
	item: T;
	onClick?: (item: T) => void;
	onActivate?: (item: T) => void;
	renderContent?: (props: ListItemContentProps & { item: T }) => React.ReactElement;
}

export function TypedListItem<T extends { id: string | number; [key: string]: unknown }>({
	item,
	onClick,
	onActivate,
	renderContent,
	...props
}: TypedListItemProps<T>) {
	const handleClick = useCallback(() => {
		onClick?.(item);
	}, [item, onClick]);

	const handleActivate = useCallback(() => {
		onActivate?.(item);
	}, [item, onActivate]);

	const handleRenderContent = useCallback(
		(contentProps: ListItemContentProps): React.ReactNode => {
			if (renderContent) {
				return renderContent({ ...contentProps, item });
			}
			return <DefaultListItemContent {...contentProps} />;
		},
		[item, renderContent]
	);

	return (
		<ListItem
			item={item}
			onClick={handleClick}
			onActivate={handleActivate}
			renderContent={handleRenderContent}
			{...props}
		/>
	);
}
