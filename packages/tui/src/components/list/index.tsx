// Export all types

// Export context and utilities (for advanced use cases)
export { DropdownContext, ListContext } from "./context";
export type { GridInset, GridItemProps, GridProps, GridSectionProps } from "./grid";
export { Grid } from "./grid";
// Export main components
export { List } from "./list";
export { ListDropdown } from "./list-dropdown";
export { ListItem } from "./list-item";
export { ListSection } from "./list-section";
export type * from "./types";
export { shouldItemBeVisible } from "./utils";

// Attach sub-components to List
import { List } from "./list";
import { ListDropdown } from "./list-dropdown";
import { ListItem } from "./list-item";
import { ListSection } from "./list-section";

List.Item = ListItem;
List.Section = ListSection;
List.Dropdown = ListDropdown;

// Default export
export default List;
