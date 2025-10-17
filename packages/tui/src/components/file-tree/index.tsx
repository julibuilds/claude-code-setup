/**
 * FileTree Component
 *
 * Interactive file/folder tree with keyboard navigation, icons, and customization.
 */

export { FileTree } from "./file-tree";
export { FileTreeItem } from "./file-tree-item";
export type {
	FileTreeItemProps,
	FileTreeNode,
	FileTreeProps,
} from "./types";
export {
	buildTreeFromPaths,
	countFiles,
	countFolders,
	findNodeById,
	flattenTree,
	formatFileSize,
	getDefaultExpandedIds,
	getNodeLevel,
	sortNodes,
} from "./utils";
