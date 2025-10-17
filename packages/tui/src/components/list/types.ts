import type { ReactElement, ReactNode } from "react";

export interface CommonProps {
	children?: ReactNode;
}

export interface ActionsInterface {
	actions?: ReactNode;
}

export interface NavigationChildInterface {
	navigationTitle?: string;
	isLoading?: boolean;
}

export interface SearchBarInterface {
	filtering?: boolean | { keepSectionOrder: boolean };
	isLoading?: boolean;
	onSearchTextChange?: (newValue: string) => void;
	searchBarPlaceholder?: string;
	throttle?: boolean;
}

export interface PaginationInterface {
	pagination?: {
		pageSize: number;
		hasMore: boolean;
		onLoadMore: () => void;
	};
}

export type Color = string;

export namespace Image {
	export type ImageLike = string;
}

export type ItemAccessory =
	| {
			text?:
				| string
				| null
				| {
						value: string | null;
						color?: Color;
				  };
	  }
	| {
			date?:
				| Date
				| null
				| {
						value: Date | null;
						color?: Color;
				  };
	  }
	| {
			tag?:
				| string
				| {
						value: string;
						color?: Color;
				  };
	  }
	| {
			icon?: Image.ImageLike | null;
			text?: string | null;
			tooltip?: string | null;
	  };

export interface ItemProps extends ActionsInterface, CommonProps {
	id?: string;
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
	icon?:
		| Image.ImageLike
		| {
				value: Image.ImageLike | null;
				tooltip: string;
		  };
	accessories?: ItemAccessory[];
	detail?: ReactElement<DetailProps>;
}

export interface DetailProps extends CommonProps {
	isLoading?: boolean;
	markdown?: string;
	metadata?: ReactElement<MetadataProps> | null;
}

export interface MetadataProps extends CommonProps {
	children?: ReactNode;
}

export interface DropdownItemProps extends CommonProps {
	value: string;
	title: string;
	icon?: Image.ImageLike | null;
	keywords?: string[];
}

export interface DropdownSectionProps extends CommonProps {
	children?: ReactNode;
	title?: string;
}

export interface DropdownProps extends SearchBarInterface, CommonProps {
	id?: string;
	tooltip: string;
	placeholder?: string;
	storeValue?: boolean;
	value?: string;
	defaultValue?: string;
	onChange?: (newValue: string) => void;
	children?: ReactNode;
}

export interface SectionProps extends CommonProps {
	children?: ReactNode;
	id?: string;
	title?: string;
	subtitle?: string;
}

export interface ListProps
	extends ActionsInterface,
		NavigationChildInterface,
		SearchBarInterface,
		PaginationInterface,
		CommonProps {
	actions?: ReactNode;
	children?: ReactNode;
	onSelectionChange?: (id: string | null) => void;
	searchBarAccessory?: ReactElement<DropdownProps> | null;
	searchText?: string;
	enableFiltering?: boolean;
	searchBarPlaceholder?: string;
	selectedItemId?: string;
	isShowingDetail?: boolean;
}

export interface EmptyViewProps extends ActionsInterface, CommonProps {
	icon?: Image.ImageLike;
	title?: string;
	description?: string;
}

export interface ListType {
	(props: ListProps): ReactElement;
	Item: ListItemType;
	Section: (props: SectionProps) => ReactElement;
	Dropdown: ListDropdownType;
	EmptyView: (props: EmptyViewProps) => ReactElement;
}

export interface ListItemType {
	(props: ItemProps): ReactElement;
	Detail: ListItemDetailType;
}

export interface ListItemDetailType {
	(props: DetailProps): ReactElement;
	Metadata: ListItemDetailMetadataType;
}

export interface ListItemDetailMetadataType {
	(props: MetadataProps): ReactElement;
	Label: (props: { title: string; text?: string; icon?: Image.ImageLike }) => ReactElement;
	Separator: () => ReactElement;
	Link: (props: { title: string; target: string; text: string }) => ReactElement;
	TagList: ListItemDetailMetadataTagListType;
}

export interface ListItemDetailMetadataTagListType {
	(props: { title: string; children: ReactNode }): ReactElement;
	Item: (props: {
		text?: string;
		color?: Color;
		icon?: Image.ImageLike;
		onAction?: () => void;
	}) => ReactElement;
}

export interface ListDropdownType {
	(props: DropdownProps): ReactElement;
	Item: (props: DropdownItemProps) => ReactElement;
	Section: (props: DropdownSectionProps) => ReactElement;
}

export interface ListItemDescendant {
	id?: string;
	title: string;
	subtitle?: string;
	keywords?: string[];
	actions?: ReactNode;
	visible?: boolean;
	detail?: ReactNode;
}

export interface DropdownItemDescendant {
	value: string;
	title: string;
	section?: string;
	visible?: boolean;
}

export interface ListSectionContextValue {
	sectionTitle?: string;
	searchText?: string;
}
