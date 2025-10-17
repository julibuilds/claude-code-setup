import { useKeyboard } from "@opentui/react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useComponentStyles } from "../../styles/theme-system";
import { FileTreeItem } from "./file-tree-item";
import type { FileTreeNode, FileTreeProps } from "./types";
import { findNodeById, flattenTree, getDefaultExpandedIds } from "./utils"; // TODO: Address this ("'findNodeById' is declared but its value is never read")

/**
 * FileTree component - Interactive file/folder tree with keyboard navigation
 */
export function FileTree({
	data,
	onSelectFile,
	onToggleFolder,
	selectedId,
	showIcons = true,
	showChevrons = true,
	useChevronIcons = false,
	showSizes = false,
	showExtensions = false,
	rootIndent = 0,
	indentSize = 2,
	maxHeight,
	filter,
	renderFile,
	renderFolder,
	focused = false,
}: FileTreeProps): ReactNode {
	const componentStyles = useComponentStyles();

	// Normalize data to array
	const nodes = Array.isArray(data) ? data : [data];

	// State for expanded folders
	const [expandedIds, setExpandedIds] = useState<Set<string>>(() => getDefaultExpandedIds(nodes));

	// State for selection and focus
	const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
	const [focusedIndex, setFocusedIndex] = useState(0);

	const currentSelectedId = selectedId ?? internalSelectedId;

	// Flatten tree for keyboard navigation
	const flatNodes = flattenTree(nodes, expandedIds, filter);

	// Update focused index when tree structure changes
	useEffect(() => {
		if (focusedIndex >= flatNodes.length && flatNodes.length > 0) {
			setFocusedIndex(flatNodes.length - 1);
		}
	}, [flatNodes.length, focusedIndex]);

	// Keyboard navigation
	useKeyboard((evt) => {
		if (!focused || flatNodes.length === 0) return;

		if (evt.name === "up") {
			setFocusedIndex((prev) => Math.max(0, prev - 1));
		} else if (evt.name === "down") {
			setFocusedIndex((prev) => Math.min(flatNodes.length - 1, prev + 1));
		} else if (evt.name === "return" || evt.name === "space") {
			const node = flatNodes[focusedIndex];
			if (node) {
				handleNodeAction(node);
			}
		} else if (evt.name === "right") {
			// Expand folder
			const node = flatNodes[focusedIndex];
			if (node?.type === "folder" && !expandedIds.has(node.id)) {
				handleToggle(node);
			}
		} else if (evt.name === "left") {
			// Collapse folder
			const node = flatNodes[focusedIndex];
			if (node?.type === "folder" && expandedIds.has(node.id)) {
				handleToggle(node);
			}
		}
	});

	const handleNodeAction = (node: FileTreeNode) => {
		if (node.type === "file") {
			handleSelect(node);
		} else {
			handleToggle(node);
		}
	};

	const handleSelect = (node: FileTreeNode) => {
		if (selectedId === undefined) {
			setInternalSelectedId(node.id);
		}
		onSelectFile?.(node);
	};

	const handleToggle = (node: FileTreeNode) => {
		if (node.type !== "folder") return;

		const isExpanded = expandedIds.has(node.id);
		const newExpandedIds = new Set(expandedIds);

		if (isExpanded) {
			newExpandedIds.delete(node.id);
		} else {
			newExpandedIds.add(node.id);
		}

		setExpandedIds(newExpandedIds);
		onToggleFolder?.(node, !isExpanded);
	};

	const renderNode = (node: FileTreeNode, level: number, nodeIndex: number): ReactNode => {
		const isSelected = currentSelectedId === node.id;
		const isExpanded = expandedIds.has(node.id);
		const isFocused = focused && nodeIndex === focusedIndex;

		return (
			<box key={node.id} style={{ width: "100%", flexDirection: "column" }}>
				<FileTreeItem
					node={node}
					level={level}
					indentSize={indentSize}
					isSelected={isSelected}
					isExpanded={isExpanded}
					isFocused={isFocused}
					showIcons={showIcons}
					showChevrons={showChevrons}
					useChevronIcons={useChevronIcons}
					showSizes={showSizes}
					showExtensions={showExtensions}
					onSelect={handleSelect}
					onToggle={handleToggle}
					renderFile={renderFile}
					renderFolder={renderFolder}
				/>
			</box>
		);
	};

	const renderTree = (
		nodes: FileTreeNode[],
		level: number,
		startIndex: number
	): { elements: ReactNode[]; nextIndex: number } => {
		const elements: ReactNode[] = [];
		let currentIndex = startIndex;

		for (const node of nodes) {
			// Apply filter
			if (filter && !filter(node)) {
				continue;
			}

			elements.push(renderNode(node, level, currentIndex));
			currentIndex++;

			// Render children if folder is expanded
			if (node.type === "folder" && node.children && expandedIds.has(node.id)) {
				const childResult = renderTree(node.children, level + 1, currentIndex);
				elements.push(...childResult.elements);
				currentIndex = childResult.nextIndex;
			}
		}

		return { elements, nextIndex: currentIndex };
	};

	const { elements } = renderTree(nodes, rootIndent, 0);

	const containerStyle = {
		width: "100%" as const,
		flexDirection: "column" as const,
		backgroundColor: componentStyles.fileTree.container.backgroundColor,
		...(maxHeight && { height: maxHeight, overflow: "hidden" as const }),
	};

	return (
		<box
			style={containerStyle}
			border={componentStyles.fileTree.container.border}
			borderStyle={componentStyles.fileTree.container.borderStyle}
		>
			{elements.length > 0 ? (
				elements
			) : (
				<box style={{ padding: 2 }}>
					<text fg={componentStyles.fileTree.emptyText.color} selectable={false}>
						{componentStyles.fileTree.emptyText.message}
					</text>
				</box>
			)}
		</box>
	);
}
