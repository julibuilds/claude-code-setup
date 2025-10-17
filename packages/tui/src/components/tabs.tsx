import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import type { ReactNode } from "react";
import { useState } from "react";
import { useComponentStyles } from "../styles/theme-system";

export interface Tab {
	id: string;
	label: string;
	content: ReactNode;
	icon?: string;
}

export interface TabsProps {
	tabs: Tab[];
	activeTab?: string;
	onChange?: (tabId: string) => void;
	orientation?: "horizontal" | "vertical";
	focused?: boolean;
	width?: number;
	height?: number;
}

/**
 * Tabs component - Tabbed interface with horizontal or vertical layout.
 * Supports keyboard navigation (arrow keys) and mouse interaction.
 */
export function Tabs({
	tabs,
	activeTab: controlledActiveTab,
	onChange,
	orientation = "horizontal",
	focused = false,
	width,
	height,
}: TabsProps): ReactNode {
	const [internalActiveTab, setInternalActiveTab] = useState(tabs[0]?.id || "");
	const componentStyles = useComponentStyles();

	const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;
	const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);

	const handleTabChange = (tabId: string) => {
		if (controlledActiveTab === undefined) {
			setInternalActiveTab(tabId);
		}
		onChange?.(tabId);
	};

	useKeyboard((evt) => {
		if (!focused) return;

		const isHorizontal = orientation === "horizontal";
		const nextKey = isHorizontal ? "right" : "down";
		const prevKey = isHorizontal ? "left" : "up";

		if (evt.name === nextKey) {
			const nextIndex = (activeIndex + 1) % tabs.length;
			const nextTab = tabs[nextIndex];
			if (nextTab) handleTabChange(nextTab.id);
		} else if (evt.name === prevKey) {
			const prevIndex = (activeIndex - 1 + tabs.length) % tabs.length;
			const prevTab = tabs[prevIndex];
			if (prevTab) handleTabChange(prevTab.id);
		}
	});

	const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;
	const isHorizontal = orientation === "horizontal";

	return (
		<box
			style={{
				flexDirection: isHorizontal ? "column" : "row",
				...(typeof width === "number" ? { width } : {}),
				...(typeof height === "number" ? { height } : {}),
			}}
		>
			{/* Tab List */}
			<box
				style={{
					flexDirection: isHorizontal ? "row" : "column",
					backgroundColor: componentStyles.tabs.container.backgroundColor,
					gap: isHorizontal ? 1 : 0,
				}}
				border={true}
				borderStyle="single"
				borderColor={componentStyles.tabs.container.borderColor}
			>
				{tabs.map((tab) => {
					const isActive = tab.id === activeTab;
					const bgColor = isActive
						? componentStyles.tabs.tab.activeBackgroundColor
						: componentStyles.tabs.tab.backgroundColor;
					const textColor = isActive
						? componentStyles.tabs.tab.activeTextColor
						: componentStyles.tabs.tab.textColor;

					return (
						<box
							key={tab.id}
							style={{
								backgroundColor: bgColor,
								padding: 1,
								flexDirection: "row",
								alignItems: "center",
								gap: 1,
							}}
							onMouseDown={() => handleTabChange(tab.id)}
						>
							{tab.icon && (
								<text fg={textColor} selectable={false}>
									{tab.icon}
								</text>
							)}
							<text
								fg={textColor}
								attributes={isActive ? TextAttributes.BOLD : undefined}
								selectable={false}
							>
								{tab.label}
							</text>
						</box>
					);
				})}
			</box>

			{/* Tab Content */}
			<box
				style={{
					flexGrow: 1,
					backgroundColor: componentStyles.tabs.content.backgroundColor,
					padding: componentStyles.tabs.content.padding,
				}}
			>
				{activeContent}
			</box>
		</box>
	);
}
