import { TextAttributes } from "@opentui/core";
import { type ReactElement, useContext, useMemo } from "react";
import { useComponentStyles } from "../../styles/theme-system";
import { ListContext, ListSectionContext } from "./context";
import type { SectionProps } from "./types";

export function ListSection(props: SectionProps): ReactElement {
	const parentContext = useContext(ListSectionContext);
	const listContext = useContext(ListContext);
	const searchText = listContext?.searchText || "";
	const componentStyles = useComponentStyles();

	// Create new context with section title and search text
	const sectionContextValue = useMemo(
		() => ({
			...parentContext,
			sectionTitle: props.title,
			searchText,
		}),
		[parentContext, props.title, searchText]
	);

	// Hide section title when searching
	const showTitle = props.title && !searchText.trim();

	return (
		<>
			{/* Render section title if provided and not searching */}
			{showTitle && (
				<box
					border={false}
					style={{
						paddingLeft: 1,
						paddingTop: 1,
					}}
				>
					<text fg={componentStyles.list.section.titleColor} attributes={TextAttributes.BOLD}>
						{props.title}
					</text>
				</box>
			)}
			{/* Render children with section context */}
			<ListSectionContext.Provider value={sectionContextValue}>
				{props.children}
			</ListSectionContext.Provider>
		</>
	) as ReactElement;
}
