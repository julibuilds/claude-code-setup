import { TextAttributes } from "@opentui/core";
import { type ReactNode, useState } from "react";
import { useComponentStyles, useThemeColors } from "../../styles/theme-system";
import type { ItemAccessory } from "./types";

export function ListItemRow(props: {
	title: string;
	subtitle?: string;
	accessories?: ItemAccessory[];
	active?: boolean;
	isShowingDetail?: boolean;
	onMouseDown?: () => void;
	index?: number;
}) {
	const { title, subtitle, accessories, active } = props;
	const [isHovered, setIsHovered] = useState(false);
	const colors = useThemeColors();
	const componentStyles = useComponentStyles();

	// Format accessories for display
	const accessoryElements: ReactNode[] = [];
	if (accessories) {
		accessories.forEach((accessory) => {
			if ("text" in accessory && accessory.text) {
				const textValue =
					typeof accessory.text === "string" ? accessory.text : accessory.text?.value;
				if (textValue) {
					accessoryElements.push(
						<text
							key={`text-${textValue}`}
							fg={active ? componentStyles.list.item.activeBackgroundColor : colors.status.info}
						>
							{textValue}
						</text>
					);
				}
			}
			if ("tag" in accessory && accessory.tag) {
				const tagValue = typeof accessory.tag === "string" ? accessory.tag : accessory.tag?.value;
				if (tagValue) {
					accessoryElements.push(
						<text
							key={`tag-${tagValue}`}
							fg={active ? componentStyles.list.item.activeBackgroundColor : colors.status.warning}
						>
							[{tagValue}]
						</text>
					);
				}
			}
		});
	}

	return (
		<box
			style={{
				flexDirection: "row",
				justifyContent: "space-between",
				backgroundColor: active
					? componentStyles.list.item.activeBackgroundColor
					: isHovered
						? componentStyles.list.item.hoverBackgroundColor
						: componentStyles.list.item.backgroundColor,
				paddingLeft: active ? 0 : 1,
				paddingRight: 1,
			}}
			border={false}
			onMouseMove={() => setIsHovered(true)}
			onMouseOut={() => setIsHovered(false)}
			onMouseDown={props.onMouseDown}
		>
			<box style={{ flexDirection: "row", flexGrow: 1, flexShrink: 1 }}>
				{active && (
					<text fg={colors.text.muted} selectable={false}>
						›
					</text>
				)}
				<text
					fg={active ? colors.background.main : componentStyles.list.item.textColor}
					attributes={active ? TextAttributes.BOLD : undefined}
					selectable={false}
				>
					{title}
				</text>
				{subtitle && (
					<text
						fg={active ? colors.background.main : componentStyles.list.item.subtextColor}
						selectable={false}
					>
						{" "}
						{subtitle}
					</text>
				)}
			</box>
			{accessoryElements.length > 0 && (
				<box style={{ flexDirection: "row" }}>
					{accessoryElements.map((elem, i) => (
						<box key={`accessory-${i}`} style={{ flexDirection: "row" }}>
							{i > 0 && <text> </text>}
							{elem}
						</box>
					))}
				</box>
			)}
		</box>
	);
}
