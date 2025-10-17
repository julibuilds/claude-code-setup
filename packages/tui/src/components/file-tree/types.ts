/**
 * File tree types and interfaces
 */

export interface FileTreeNode {
	/**
	 * Unique identifier for the node
	 */
	id: string;
	/**
	 * Display name
	 */
	name: string;
	/**
	 * Type of node
	 */
	type: "file" | "folder";
	/**
	 * Full path to the node
	 */
	path: string;
	/**
	 * Children nodes (only for folders)
	 */
	children?: FileTreeNode[];
	/**
	 * File size in bytes (only for files)
	 */
	size?: number;
	/**
	 * File extension (only for files)
	 */
	extension?: string;
	/**
	 * Whether this node is initially expanded
	 */
	defaultExpanded?: boolean;
	/**
	 * Custom icon override
	 */
	icon?: string;
	/**
	 * Custom metadata
	 */
	metadata?: Record<string, unknown>;
}

export interface FileTreeProps {
	/**
	 * Root node(s) of the tree
	 */
	data: FileTreeNode | FileTreeNode[];
	/**
	 * Callback when a file is selected
	 */
	onSelectFile?: (node: FileTreeNode) => void;
	/**
	 * Callback when a folder is toggled
	 */
	onToggleFolder?: (node: FileTreeNode, isExpanded: boolean) => void;
	/**
	 * Currently selected file ID
	 */
	selectedId?: string;
	/**
	 * Show file icons
	 * @default true
	 */
	showIcons?: boolean;
	/**
	 * Show folder chevrons
	 * @default true
	 */
	showChevrons?: boolean;
	/**
	 * Use checkbox icons for folders instead of emoji
	 * @default false
	 */
	useChevronIcons?: boolean;
	/**
	 * Show file sizes
	 * @default false
	 */
	showSizes?: boolean;
	/**
	 * Show file extensions inline with names
	 * @default false
	 */
	showExtensions?: boolean;
	/**
	 * Root indent level
	 * @default 0
	 */
	rootIndent?: number;
	/**
	 * Indent size per level
	 * @default 2
	 */
	indentSize?: number;
	/**
	 * Maximum height of the tree (enables scrolling)
	 */
	maxHeight?: number;
	/**
	 * Filter function to hide certain nodes
	 */
	filter?: (node: FileTreeNode) => boolean;
	/**
	 * Custom render function for file nodes
	 */
	renderFile?: (node: FileTreeNode, isSelected: boolean) => React.ReactNode;
	/**
	 * Custom render function for folder nodes
	 */
	renderFolder?: (node: FileTreeNode, isExpanded: boolean, isSelected: boolean) => React.ReactNode;
	/**
	 * Whether the tree is focused for keyboard navigation
	 * @default false
	 */
	focused?: boolean;
}

export interface FileTreeItemProps {
	node: FileTreeNode;
	level: number;
	indentSize: number;
	isSelected: boolean;
	isExpanded: boolean;
	isFocused: boolean;
	showIcons: boolean;
	showChevrons: boolean;
	useChevronIcons: boolean;
	showSizes: boolean;
	showExtensions: boolean;
	onSelect: (node: FileTreeNode) => void;
	onToggle: (node: FileTreeNode) => void;
	renderFile?: (node: FileTreeNode, isSelected: boolean) => React.ReactNode;
	renderFolder?: (node: FileTreeNode, isExpanded: boolean, isSelected: boolean) => React.ReactNode;
}
