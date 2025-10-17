import type { SelectOption } from "@opentui/core";
import { SelectList } from "../../common/SelectList";
import { Panel } from "../../layout/Panel";

import { TextAttributes } from "@opentui/core";
import { useThemeColors } from "@repo/tui";

interface ModelListPanelProps {
	focused: boolean;
	modelOptions: SelectOption[];
	onSelect: (modelId: string) => void;
	height: number;
	modelCount: number;
	totalCount?: number;
}

export function ModelListPanel({
	focused,
	modelOptions,
	onSelect,
	height,
	modelCount,
	totalCount,
}: ModelListPanelProps) {
	const colors = useThemeColors();
	const visibleCount = Math.min(modelCount, 5);
	const hasMore = modelCount > visibleCount;

	return (
		<Panel
			title={`Available Models`}
			focused={focused}
			height={height}
		>
			<box style={{ flexDirection: "column", flexGrow: 1 }}>
				{/* Scroll hint */}
				{hasMore && (
					<text
						style={{
							fg: colors.text.muted,
							marginBottom: 0.5,
						}}
					>
						Showing {visibleCount} of {modelCount} • Use ↑/↓ to navigate
					</text>
				)}
				
				<SelectList
					options={modelOptions}
					focused={focused}
					onChange={(_, option) => {
						if (option?.value) {
							onSelect(option.value as string);
						}
					}}
					height={height - 4}
					showScrollIndicator={true}
				/>

				{/* Bottom scroll indicator */}
				{hasMore && (
					<text
						style={{
							fg: colors.accent.primary,
							marginTop: 0.5,
							attributes: TextAttributes.BOLD,
						}}
					>
						↓ {modelCount - visibleCount} more models below
					</text>
				)}
			</box>
		</Panel>
	);
}
