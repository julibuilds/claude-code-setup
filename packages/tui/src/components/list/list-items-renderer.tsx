import { type ReactNode, useContext } from "react";
import { ListContext, ListSectionContext } from "./context";

// Component to render list items and sections
export function ListItemsRenderer(props: { children?: ReactNode }): ReactNode {
	const { children } = props;
	const listContext = useContext(ListContext);
	const searchText = listContext?.searchText || "";

	// Pass search text down via context
	return (
		<ListSectionContext.Provider value={{ searchText }}>{children}</ListSectionContext.Provider>
	);
}
