import { type ReactElement, type ReactNode, useContext, useEffect } from "react";
import { useThemeColors } from "../../styles/theme-system";
import { useDialog } from "../dialog";
import { ListContext, ListSectionContext, useListItemDescendant } from "./context";
import { ListItemRow } from "./list-item-row";
import type { Color, DetailProps, Image, ItemProps, MetadataProps } from "./types";
import { shouldItemBeVisible } from "./utils";

const ListItemComponent = (props: ItemProps): ReactElement => {
	const listSectionContext = useContext(ListSectionContext);
	const { sectionTitle } = listSectionContext;
	const listContext = useContext(ListContext);
	const dialog = useDialog();

	// Extract text values for descendant registration
	const titleText = typeof props.title === "string" ? props.title : props.title.value;
	const subtitleText = props.subtitle
		? typeof props.subtitle === "string"
			? props.subtitle
			: props.subtitle.value || ""
		: undefined;

	// Check if this item is visible based on search
	const isFiltering = listContext?.isFiltering ?? false;
	const searchText = listContext?.searchText ?? "";

	const isVisible =
		!isFiltering ||
		shouldItemBeVisible(searchText, {
			title: titleText,
			subtitle: subtitleText,
			keywords: [...(props.keywords || []), sectionTitle].filter(Boolean) as string[],
		});

	// Register as descendant with all searchable data
	const { index } = useListItemDescendant({
		id: props.id,
		title: titleText,
		subtitle: subtitleText,
		keywords: [...(props.keywords || []), sectionTitle].filter(Boolean) as string[],
		actions: props.actions,
		visible: isVisible,
		detail: props.detail,
	});

	// Get selected index from parent List context
	const selectedIndex = listContext?.selectedIndex ?? 0;
	const isActive = index === selectedIndex;

	// Update detail when this item becomes active or detail prop changes
	useEffect(() => {
		if (isActive && listContext?.isShowingDetail && listContext?.setCurrentDetail) {
			listContext.setCurrentDetail(props.detail || null);
		}
	}, [
		isActive,
		props.detail,
		listContext?.isShowingDetail,
		listContext?.setCurrentDetail,
		listContext,
	]);

	// Don't render if not visible
	if (!isVisible) return null as unknown as ReactElement;

	// Handle mouse click on item
	const handleMouseDown = () => {
		if (listContext && index !== -1) {
			// If clicking on already selected item, show actions (like pressing Enter)
			if (isActive && props.actions) {
				dialog.push(props.actions, "bottom-right");
			} else if (listContext.setSelectedIndex) {
				// Otherwise just select the item
				listContext.setSelectedIndex(index);
			}
		}
	};

	// Don't show accessories if we're showing detail
	const showAccessories = !props.detail && props.accessories;

	// Render the item row directly
	return (
		<ListItemRow
			title={titleText}
			subtitle={subtitleText}
			accessories={showAccessories ? props.accessories : undefined}
			active={isActive}
			isShowingDetail={props.detail !== undefined}
			onMouseDown={handleMouseDown}
			index={index}
		/>
	) as ReactElement;
};

const ListItemDetailComponent = (props: DetailProps): ReactElement => {
	const { isLoading, markdown, metadata } = props;
	const colors = useThemeColors();

	return (
		<box style={{ flexDirection: "column", flexGrow: 1 }}>
			{isLoading && (
				<box style={{ paddingBottom: 1 }}>
					<text fg={colors.text.muted}>Loading...</text>
				</box>
			)}

			{markdown && (
				<box style={{ flexGrow: 1, flexShrink: 1, overflow: "scroll" }}>
					<text>{markdown}</text>
				</box>
			)}

			{metadata && (
				<box
					style={{ paddingTop: 1 }}
					border={["top"]}
					borderStyle="single"
					borderColor={colors.border.default}
				>
					{metadata}
				</box>
			)}
		</box>
	) as ReactElement;
};

const ListItemDetailMetadataComponent = (props: MetadataProps): ReactElement => {
	return (<box style={{ flexDirection: "column" }}>{props.children}</box>) as ReactElement;
};

const ListItemDetailMetadataLabelComponent = (props: {
	title: string;
	text?: string;
	icon?: Image.ImageLike;
}): ReactElement => {
	const colors = useThemeColors();
	return (
		<box style={{ flexDirection: "row", paddingBottom: 0.5 }}>
			<text fg={colors.text.muted} style={{ minWidth: 15 }}>
				{props.title}:
			</text>
			{props.text && <text fg={colors.text.primary}>{props.text}</text>}
		</box>
	) as ReactElement;
};

const ListItemDetailMetadataSeparatorComponent = (): ReactElement => {
	const colors = useThemeColors();
	return (
		<box style={{ paddingBottom: 0.5 }}>
			<text fg={colors.border.default}>─────────────────</text>
		</box>
	) as ReactElement;
};

const ListItemDetailMetadataLinkComponent = (props: {
	title: string;
	target: string;
	text: string;
}): ReactElement => {
	const colors = useThemeColors();
	return (
		<box style={{ flexDirection: "row", paddingBottom: 0.5 }}>
			<text fg={colors.text.muted} style={{ minWidth: 15 }}>
				{props.title}:
			</text>
			<text fg={colors.accent.primary}>{props.text}</text>
		</box>
	) as ReactElement;
};

const ListItemDetailMetadataTagListComponent = (props: {
	title: string;
	children: ReactNode;
}): ReactElement => {
	const colors = useThemeColors();
	return (
		<box style={{ flexDirection: "column", paddingBottom: 0.5 }}>
			<text fg={colors.text.muted}>{props.title}:</text>
			<box style={{ flexDirection: "row", paddingLeft: 1 }}>{props.children}</box>
		</box>
	) as ReactElement;
};

const ListItemDetailMetadataTagListItemComponent = (props: {
	text?: string;
	color?: Color;
	icon?: Image.ImageLike;
	onAction?: () => void;
}): ReactElement => {
	const colors = useThemeColors();
	return (
		<box style={{ paddingRight: 1 }}>
			<text fg={props.color || colors.accent.secondary}>[{props.text}]</text>
		</box>
	) as ReactElement;
};

ListItemDetailComponent.Metadata = ListItemDetailMetadataComponent;
ListItemDetailMetadataComponent.Label = ListItemDetailMetadataLabelComponent;
ListItemDetailMetadataComponent.Separator = ListItemDetailMetadataSeparatorComponent;
ListItemDetailMetadataComponent.Link = ListItemDetailMetadataLinkComponent;
ListItemDetailMetadataComponent.TagList = ListItemDetailMetadataTagListComponent;
ListItemDetailMetadataTagListComponent.Item = ListItemDetailMetadataTagListItemComponent;

ListItemComponent.Detail = ListItemDetailComponent;

export const ListItem = ListItemComponent;
