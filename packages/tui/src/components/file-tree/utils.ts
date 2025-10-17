import type { FileTreeNode } from "./types";

/**
 * Flatten tree structure into a list for keyboard navigation
 */
export function flattenTree(
	nodes: FileTreeNode[],
	expandedIds: Set<string>,
	filter?: (node: FileTreeNode) => boolean
): FileTreeNode[] {
	const result: FileTreeNode[] = [];

	const traverse = (node: FileTreeNode) => {
		if (filter && !filter(node)) {
			return;
		}

		result.push(node);

		if (node.type === "folder" && node.children && expandedIds.has(node.id)) {
			for (const child of node.children) {
				traverse(child);
			}
		}
	};

	for (const node of nodes) {
		traverse(node);
	}

	return result;
}

/**
 * Find a node by ID in the tree
 */
export function findNodeById(nodes: FileTreeNode[], id: string): FileTreeNode | null {
	for (const node of nodes) {
		if (node.id === id) {
			return node;
		}
		if (node.type === "folder" && node.children) {
			const found = findNodeById(node.children, id);
			if (found) {
				return found;
			}
		}
	}
	return null;
}

/**
 * Get all folder IDs that should be expanded by default
 */
export function getDefaultExpandedIds(nodes: FileTreeNode[]): Set<string> {
	const expanded = new Set<string>();

	const traverse = (node: FileTreeNode) => {
		if (node.type === "folder" && node.defaultExpanded) {
			expanded.add(node.id);
		}
		if (node.children) {
			for (const child of node.children) {
				traverse(child);
			}
		}
	};

	for (const node of nodes) {
		traverse(node);
	}

	return expanded;
}

/**
 * Format file size to human readable string
 */
export function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 B";
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/**
 * Get the depth/level of a node in the tree
 */
export function getNodeLevel(nodes: FileTreeNode[], nodeId: string, currentLevel = 0): number {
	for (const node of nodes) {
		if (node.id === nodeId) {
			return currentLevel;
		}
		if (node.type === "folder" && node.children) {
			const level = getNodeLevel(node.children, nodeId, currentLevel + 1);
			if (level !== -1) {
				return level;
			}
		}
	}
	return -1;
}

/**
 * Sort nodes: folders first, then alphabetically
 */
export function sortNodes(nodes: FileTreeNode[]): FileTreeNode[] {
	return [...nodes].sort((a, b) => {
		// Folders first
		if (a.type === "folder" && b.type === "file") return -1;
		if (a.type === "file" && b.type === "folder") return 1;
		// Then alphabetically
		return a.name.localeCompare(b.name);
	});
}

/**
 * Build a tree from a flat list of paths
 */
export function buildTreeFromPaths(paths: string[]): FileTreeNode[] {
	const root: Map<string, FileTreeNode> = new Map();

	for (const path of paths) {
		const parts = path.split("/").filter((p) => p.length > 0);
		let currentMap = root;
		let currentPath = "";

		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];
			if (!part) continue; // Skip empty parts

			currentPath = currentPath ? `${currentPath}/${part}` : part;
			const isLastPart = i === parts.length - 1;

			if (!currentMap.has(part)) {
				const node: FileTreeNode = {
					id: currentPath,
					name: part,
					path: currentPath,
					type: isLastPart ? "file" : "folder",
					children: isLastPart ? undefined : [],
				};

				currentMap.set(part, node);
			}

			const node = currentMap.get(part);
			if (!node) continue; // Skip if node not found

			if (!isLastPart) {
				if (!node.children) {
					node.children = [];
				}
				// Create a new map for the next level
				const childMap = new Map<string, FileTreeNode>();
				for (const child of node.children) {
					childMap.set(child.name, child);
				}
				currentMap = childMap;
			}
		}
	}

	return Array.from(root.values());
}

/**
 * Count total files in a tree
 */
export function countFiles(nodes: FileTreeNode[]): number {
	let count = 0;

	const traverse = (node: FileTreeNode) => {
		if (node.type === "file") {
			count++;
		}
		if (node.children) {
			for (const child of node.children) {
				traverse(child);
			}
		}
	};

	for (const node of nodes) {
		traverse(node);
	}

	return count;
}

/**
 * Count total folders in a tree
 */
export function countFolders(nodes: FileTreeNode[]): number {
	let count = 0;

	const traverse = (node: FileTreeNode) => {
		if (node.type === "folder") {
			count++;
		}
		if (node.children) {
			for (const child of node.children) {
				traverse(child);
			}
		}
	};

	for (const node of nodes) {
		traverse(node);
	}

	return count;
}
