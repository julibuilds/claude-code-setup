import type { SelectOption } from "@opentui/core";
import { SelectList } from "../../common/SelectList";
import { Panel } from "../../layout/Panel";

interface FilterPanelProps {
	focused: boolean;
	filter: string;
	filterOptions: SelectOption[];
	onSelect: (filter: string) => void;
	height: number;
}

export function FilterPanel({
	focused,
	filter,
	filterOptions,
	onSelect,
	height,
}: FilterPanelProps) {
	return (
		<Panel title="Filter Models" focused={focused} height={height}>
			<SelectList
				options={filterOptions}
				focused={focused}
				onChange={(_, option) => {
					if (option?.value) {
						onSelect(option.value as string);
					}
				}}
				height={height - 2}
			/>
		</Panel>
	);
}
