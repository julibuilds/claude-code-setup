import type { ReactElement, ReactNode } from "react";
import { List } from "./list";
import { ListDropdown } from "./list-dropdown";
import type {
	DropdownProps,
	EmptyViewProps,
	ItemProps,
	ListDropdownType,
	MetadataProps,
	SectionProps,
} from "./types";

// Grid Component Implementation
export interface GridInset {
	bottom?: number;
	left?: number;
	right?: number;
	top?: number;
}

export interface GridItemProps {
	id?: string;
	content:
		| string
		| {
				value: string;
				tooltip?: string | null;
		  };
	title:
		| string
		| {
				value: string;
				tooltip?: string | null;
		  };
	subtitle?:
		| string
		| {
				value?: string | null;
				tooltip?: string | null;
		  };
	keywords?: string[];
	actions?: ReactNode;
	children?: ReactNode;
	getDetailMarkdown?: () =>
		| { markdown: string; metadata?: ReactElement<MetadataProps> }
		| Promise<{ markdown: string; metadata?: ReactElement<MetadataProps> }>;
}

export interface GridProps {
	actions?: ReactNode;
	aspectRatio?: "1" | "3/2" | "2/3" | "4/3" | "3/4" | "16/9" | "9/16";
	children?: ReactNode;
	columns?: number;
	fit?: "contain" | "fill";
	inset?: GridInset;
	navigationTitle?: string;
	onSelectionChange?: (id: string | null) => void;
	searchBarAccessory?: ReactElement<DropdownProps> | null;
	searchText?: string;
	enableFiltering?: boolean;
	searchBarPlaceholder?: string;
	selectedItemId?: string;
	filtering?: boolean | { keepSectionOrder: boolean };
	isLoading?: boolean;
	onSearchTextChange?: (newValue: string) => void;
	throttle?: boolean;
	pagination?: {
		pageSize: number;
		hasMore: boolean;
		onLoadMore: () => void;
	};
}

export interface GridSectionProps extends SectionProps {
	aspectRatio?: "1" | "3/2" | "2/3" | "4/3" | "3/4" | "16/9" | "9/16";
	columns?: number;
	fit?: "contain" | "fill";
	inset?: GridInset;
}

interface GridType {
	(props: GridProps): ReactElement;
	Item: (props: GridItemProps) => ReactElement;
	Section: (props: GridSectionProps) => ReactElement;
	Dropdown: ListDropdownType;
	EmptyView: (props: EmptyViewProps) => ReactElement;
	Inset: {
		Small: GridInset;
		Medium: GridInset;
		Large: GridInset;
	};
}

// Grid uses List internally with a different visual representation
export const Grid: GridType = (props): ReactElement => {
	// Grid is essentially List with grid layout
	// We'll reuse the List component but with grid-specific styling
	const {
		columns: _columns = 5,
		aspectRatio: _aspectRatio = "1",
		fit: _fit = "contain",
		inset: _inset,
		...listProps
	} = props;

	return (<List {...listProps} />) as ReactElement;
};

// Grid.Item maps to List.Item but with content instead of icon
Grid.Item = (props: GridItemProps): ReactElement => {
	const { content, getDetailMarkdown: _getDetailMarkdown, ...itemProps } = props;

	// Extract image value and tooltip
	const imageValue = typeof content === "string" ? content : content?.value;
	const _imageTooltip = typeof content === "object" ? content?.tooltip : undefined;

	// Convert Grid.Item props to List.Item props
	const listItemProps: ItemProps = {
		...itemProps,
		// Grid items don't have accessories in Raycast
		accessories: undefined,
		// Use content as icon for now (in a real implementation, this would be rendered differently)
		icon: imageValue,
	};

	return (<List.Item {...listItemProps} />) as ReactElement;
};

// Grid.Section maps to List.Section with grid-specific props
Grid.Section = (props: GridSectionProps): ReactElement => {
	const {
		columns: _columns,
		aspectRatio: _aspectRatio,
		fit: _fit,
		inset: _inset,
		...sectionProps
	} = props;

	// Pass through to List.Section
	return (<List.Section {...sectionProps} />) as ReactElement;
};

// Reuse List's Dropdown
Grid.Dropdown = ListDropdown;

// Reuse List's EmptyView
Grid.EmptyView = List.EmptyView;

// Grid Inset presets
Grid.Inset = {
	Small: { top: 0, right: 0, bottom: 0, left: 0 },
	Medium: { top: 8, right: 8, bottom: 8, left: 8 },
	Large: { top: 16, right: 16, bottom: 16, left: 16 },
};
