import { type BorderCharacters, TextAttributes } from "@opentui/core";
import type { ReactNode } from "react";
import { useComponentStyles, useThemeColors } from "../styles/theme-system";

const borderCharsWithoutVertical: BorderCharacters = {
	topLeft: "┌",
	topRight: "┐",
	bottomLeft: "└",
	bottomRight: "┘",
	horizontal: "─",
	vertical: " ",
	topT: " ",
	bottomT: " ",
	leftT: " ",
	rightT: " ",
	cross: " ",
};

export interface BranchItemProps {
	name: string;
	content: ReactNode;
	prompt?: string;
	agentId?: string;
	isCollapsed: boolean;
	isStreaming: boolean;
	branchChar?: string;
	streamingPreview?: string;
	finishedPreview?: string;
	onToggle: () => void;
}

/**
 * BranchItem component - Collapsible branch item with streaming support.
 * Used for displaying agent responses or nested content with expand/collapse functionality.
 */
export function BranchItem({
	name,
	content,
	prompt,
	agentId, // TODO: Address this ("'agentId' is declared but its value is never read.")
	isCollapsed,
	isStreaming,
	branchChar, // TODO: Address this ("'branchChar' is declared but its value is never read.")
	streamingPreview = "",
	finishedPreview = "",
	onToggle,
}: BranchItemProps): ReactNode {
	const colors = useThemeColors();
	const componentStyles = useComponentStyles();

	const cornerColor = colors.accent.primary;

	const toggleBackground = isStreaming
		? colors.background.elevated
		: isCollapsed
			? colors.accent.secondary
			: colors.accent.primary;
	const toggleTextColor = isStreaming ? colors.text.primary : colors.text.inverse;
	const toggleLabel = `${isCollapsed ? "▸" : "▾"} `;

	// Helper to check if content can be rendered as text
	const isTextRenderable = (value: ReactNode): boolean => {
		if (value === null || value === undefined || typeof value === "boolean") {
			return false;
		}

		if (typeof value === "string" || typeof value === "number") {
			return true;
		}

		if (Array.isArray(value)) {
			return value.every((child) => isTextRenderable(child));
		}

		return false;
	};

	// Render expanded content with proper wrapping
	const renderExpandedContent = (value: ReactNode): ReactNode => {
		if (value === null || value === undefined || value === false || value === true) {
			return null;
		}

		if (isTextRenderable(value)) {
			return (
				<text wrap fg={colors.text.primary} key="expanded-text" selectable={false}>
					{value}
				</text>
			);
		}

		if (Array.isArray(value)) {
			return (
				<box key="expanded-array" style={{ flexDirection: "column", gap: 0 }}>
					{value.map((child, idx) => (
						<box key={`expanded-array-${idx}`} style={{ flexDirection: "column", gap: 0 }}>
							{child}
						</box>
					))}
				</box>
			);
		}

		return (
			<box key="expanded-content" style={{ flexDirection: "column", gap: 0 }}>
				{value}
			</box>
		);
	};

	return (
		<box
			style={{
				flexDirection: "column",
				gap: 0,
				flexShrink: 0,
				marginTop: 1,
				marginBottom: 1,
			}}
		>
			<box style={{ flexDirection: "column", gap: 0 }}>
				<box
					style={{
						flexDirection: "row",
						alignSelf: "flex-start",
						backgroundColor: toggleBackground,
						paddingLeft: 1,
						paddingRight: 1,
					}}
					onMouseDown={onToggle}
				>
					<text wrap selectable={false}>
						<span fg={toggleTextColor}>{toggleLabel}</span>
						<span fg={toggleTextColor} attributes={TextAttributes.BOLD}>
							{name}
						</span>
					</text>
				</box>
				<box style={{ flexShrink: 1, marginBottom: 0 }}>
					{isStreaming && isCollapsed && streamingPreview && (
						<text
							key="streaming-preview"
							wrap
							fg={colors.text.secondary}
							attributes={TextAttributes.ITALIC}
							selectable={false}
						>
							{streamingPreview}
						</text>
					)}
					{!isStreaming && isCollapsed && finishedPreview && (
						<text
							key="finished-preview"
							wrap
							fg={colors.text.muted}
							attributes={TextAttributes.ITALIC}
							selectable={false}
						>
							{finishedPreview}
						</text>
					)}
					{!isCollapsed && (
						<box style={{ flexDirection: "column", gap: 1 }}>
							{content && (
								<box
									border
									borderStyle="single"
									borderColor={cornerColor}
									customBorderChars={borderCharsWithoutVertical}
									style={{
										flexDirection: "column",
										gap: 0,
										paddingLeft: 1,
										paddingRight: 1,
										paddingTop: 0,
										paddingBottom: 0,
									}}
								>
									{prompt && (
										<box style={{ flexDirection: "column", gap: 0 }}>
											<text wrap fg={colors.text.secondary} selectable={false}>
												Prompt
											</text>
											<text wrap fg={colors.text.primary} selectable={false}>
												{prompt}
											</text>
											<text selectable={false}> </text>
											<text wrap fg={colors.text.secondary} selectable={false}>
												Response
											</text>
										</box>
									)}
									{renderExpandedContent(content)}
								</box>
							)}
							<box
								style={{
									alignSelf: "flex-end",
									backgroundColor: colors.background.highlight,
									paddingLeft: 1,
									paddingRight: 1,
									paddingTop: 0,
									paddingBottom: 0,
								}}
								onMouseDown={onToggle}
							>
								<text wrap={false} selectable={false}>
									<span fg={toggleTextColor} attributes={TextAttributes.BOLD}>
										Collapse
									</span>
								</text>
							</box>
						</box>
					)}
				</box>
			</box>
		</box>
	);
}
