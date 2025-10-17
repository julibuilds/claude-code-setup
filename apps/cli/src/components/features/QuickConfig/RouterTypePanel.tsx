import type { SelectOption } from "@opentui/core";
import { SelectList } from "../../common/SelectList";
import { Panel } from "../../layout/Panel";

interface RouterTypePanelProps {
	focused: boolean;
	selectedRouterType: string;
	routerTypeOptions: SelectOption[];
	onSelect: (routerType: string) => void;
	height: number;
}

export function RouterTypePanel({
	focused,
	selectedRouterType,
	routerTypeOptions,
	onSelect,
	height,
}: RouterTypePanelProps) {
	return (
		<Panel title="Router Type" focused={focused} height={height}>
			<SelectList
				options={routerTypeOptions}
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
