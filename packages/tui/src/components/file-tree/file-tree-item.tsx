import { TextAttributes } from "@opentui/core";
import type { ReactNode } from "react";
import { useComponentStyles } from "../../styles/theme-system";
import { getFileIcon, getFolderIcon, getSpecialFolderIcon } from "../../utils/icons";
import type { FileTreeItemProps } from "./types";
import { formatFileSize } from "./utils";

/**
 * FileTreeItem component - Renders a single node in the file tree
 */
export function FileTreeItem({
	node,
	level,
	indentSize,
	isSelected,
	isExpanded,
	isFocused,
	showIcons,
	showChevrons,
	useChevronIcons,
	showSizes,
	showExtensions,
	onSelect,
	onToggle,
	renderFile,
	renderFolder,
}: FileTreeItemProps): ReactNode {
	const componentStyles = useComponentStyles();
	const indent = level * indentSize;

	const handleClick = () => {
		if (node.type === "file") {
			onSelect(node);
		} else {
			onToggle(node);
		}
	};

	// Determine background color
	let backgroundColor = componentStyles.fileTree.item.backgroundColor;
	if (isFocused) {
		backgroundColor = componentStyles.fileTree.item.focusBackgroundColor;
	} else if (isSelected) {
		backgroundColor = componentStyles.fileTree.item.selectedBackgroundColor;
	}

	// Determine text color
	const textColor = isFocused
		? componentStyles.fileTree.item.focusTextColor
		: isSelected
			? componentStyles.fileTree.item.selectedTextColor
			: componentStyles.fileTree.item.textColor;

	// Custom rendering
	if (node.type === "file" && renderFile) {
		return (
			<box
				style={{
					width: "100%",
					flexDirection: "row",
					backgroundColor,
					paddingLeft: indent,
				}}
				onMouseDown={handleClick}
			>
				{renderFile(node, isSelected)}
			</box>
		);
	}

	if (node.type === "folder" && renderFolder) {
		return (
			<box
				style={{
					width: "100%",
					flexDirection: "row",
					backgroundColor,
					paddingLeft: indent,
				}}
				onMouseDown={handleClick}
			>
				{renderFolder(node, isExpanded, isSelected)}
			</box>
		);
	}

	// File node
	if (node.type === "file") {
		const icon = node.icon ?? getFileIcon(node.name);
		const displayName = showExtensions ? node.name : node.name.replace(/\.[^/.]+$/, "");
		const sizeText = showSizes && node.size ? ` (${formatFileSize(node.size)})` : "";

		return (
			<box
				style={{
					width: "100%",
					flexDirection: "row",
					alignItems: "center",
					backgroundColor,
					paddingLeft: indent,
					gap: 1,
				}}
				onMouseDown={handleClick}
			>
				{showIcons && (
					<text fg={componentStyles.fileTree.icon.fileColor} selectable={false}>
						{icon}
					</text>
				)}
				<text
					fg={textColor}
					attributes={isFocused ? TextAttributes.BOLD : undefined}
					selectable={false}
				>
					{displayName}
					{sizeText}
				</text>
			</box>
		);
	}

	// Folder node
	const specialIcon = getSpecialFolderIcon(node.name);
	const folderIcon = node.icon ?? specialIcon ?? getFolderIcon(isExpanded, useChevronIcons);
	const chevron = showChevrons && !useChevronIcons ? (isExpanded ? "▼ " : "▶ ") : ""; // TODO: Address this ("'chevron' is declared but its value is never read")

	const childCount = node.children && node.children.length > 0 ? ` (${node.children.length})` : "";

	return (
		<box
			style={{
				width: "100%",
				flexDirection: "row",
				alignItems: "center",
				backgroundColor,
				paddingLeft: indent,
				gap: 1,
			}}
			onMouseDown={handleClick}
		>
			{showChevrons && !useChevronIcons && (
				<text
					fg={componentStyles.fileTree.chevron.color}
					attributes={TextAttributes.BOLD}
					selectable={false}
				>
					{isExpanded ? "▼" : "▶"}
				</text>
			)}
			{showIcons && (
				<text fg={componentStyles.fileTree.icon.folderColor} selectable={false}>
					{folderIcon}
				</text>
			)}
			<text
				fg={textColor}
				attributes={isFocused ? TextAttributes.BOLD : undefined}
				selectable={false}
			>
				{node.name}
				{showSizes && childCount}
			</text>
		</box>
	);
}
