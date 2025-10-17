import type { SelectOption } from "@opentui/core";
import { SelectList } from "../../common/SelectList";
import { Panel } from "../../layout/Panel";

interface ModelListPanelProps {
	focused: boolean;
	modelOptions: SelectOption[];
	onSelect: (modelId: string) => void;
	height: number;
	modelCount: number;
}

export function ModelListPanel({
	focused,
	modelOptions,
	onSelect,
	height,
	modelCount,
}: ModelListPanelProps) {
	return (
		<Panel
			title={`Available Models (${modelCount})`}
			focused={focused}
			height={height}
		>
			<SelectList
				options={modelOptions}
				focused={focused}
				onChange={(_, option) => {
					if (option?.value) {
						onSelect(option.value as string);
					}
				}}
				height={height - 2}
				showScrollIndicator={true}
			/>
		</Panel>
	);
}
