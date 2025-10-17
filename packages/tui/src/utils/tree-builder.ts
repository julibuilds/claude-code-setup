/**
 * Utilities for building hierarchical tree structures from flat data
 * Based on opentui-treegraph example
 */

export interface TreeNode<T = any> {
	id: string;
	data: T;
	children?: TreeNode<T>[];
	parent?: TreeNode<T>;
}

export interface Edge {
	source: string;
	target: string;
}

export interface BuildTreeOptions {
	/** If true, will detect and handle cycles */
	detectCycles?: boolean;
	/** Custom function to determine if two nodes are equal */
	isEqual?: (a: string, b: string) => boolean;
}

/**
 * Build a tree structure from a list of edges (source -> target relationships)
 *
 * @example
 * ```ts
 * const edges = [
 *   { source: 'a', target: 'b' },
 *   { source: 'a', target: 'c' },
 *   { source: 'b', target: 'd' },
 * ];
 * const tree = buildTreeFromEdges(edges);
 * // Returns root node 'a' with children 'b' and 'c', where 'b' has child 'd'
 * ```
 */
export function buildTreeFromEdges<T = any>(
	edges: Edge[],
	getData?: (id: string) => T,
	options: BuildTreeOptions = {}
): TreeNode<T> {
	const { detectCycles = true, isEqual = (a, b) => a === b } = options;

	// Create node map
	const nodeMap = new Map<string, TreeNode<T>>();
	const childrenMap = new Map<string, Set<string>>();
	const visited = new Set<string>();

	// Initialize all nodes
	for (const edge of edges) {
		if (!nodeMap.has(edge.source)) {
			nodeMap.set(edge.source, {
				id: edge.source,
				data: getData?.(edge.source) as T,
				children: [],
			});
		}

		if (!nodeMap.has(edge.target)) {
			nodeMap.set(edge.target, {
				id: edge.target,
				data: getData?.(edge.target) as T,
				children: [],
			});
		}

		// Track children relationships
		if (!childrenMap.has(edge.source)) {
			childrenMap.set(edge.source, new Set());
		}
		childrenMap.get(edge.source)?.add(edge.target);
	}

	// Find root nodes (nodes that are never targets)
	const roots = findRootNodes(edges, isEqual);

	// If no roots found (cycle detected), pick the first node
	if (roots.size === 0 && nodeMap.size > 0) {
		const firstNode = edges[0];
		if (firstNode) {
			roots.add(firstNode.source);
		}
	}

	// Build tree structure
	const buildNode = (id: string): TreeNode<T> | null => {
		if (detectCycles && visited.has(id)) {
			// Cycle detected - skip to prevent infinite recursion
			return null;
		}

		visited.add(id);

		const node = nodeMap.get(id);
		if (!node) return null;

		const children = childrenMap.get(id);
		if (children) {
			node.children = Array.from(children)
				.map((childId) => buildNode(childId))
				.filter((child): child is TreeNode<T> => child !== null);

			// Set parent references
			for (const child of node.children) {
				child.parent = node;
			}
		}

		return node;
	};

	// Build from roots
	const rootChildren: TreeNode<T>[] = [];
	for (const rootId of roots) {
		const rootNode = buildNode(rootId);
		if (rootNode) {
			rootChildren.push(rootNode);
		}
	}

	// Create virtual root if multiple roots exist
	if (rootChildren.length === 1) {
		return rootChildren[0]!;
	}

	return {
		id: "__root__",
		data: undefined as T,
		children: rootChildren,
	};
}

/**
 * Find all root nodes in a graph (nodes that have no incoming edges)
 */
export function findRootNodes(
	edges: Edge[],
	isEqual: (a: string, b: string) => boolean = (a, b) => a === b
): Set<string> {
	const allTargets = new Set<string>();
	const allSources = new Set<string>();

	for (const edge of edges) {
		allTargets.add(edge.target);
		allSources.add(edge.source);
	}

	// Root nodes are sources that are never targets
	const roots = new Set<string>();
	for (const source of allSources) {
		if (!allTargets.has(source)) {
			roots.add(source);
		}
	}

	return roots;
}

/**
 * Find all leaf nodes in a tree (nodes with no children)
 */
export function findLeafNodes<T>(root: TreeNode<T>): TreeNode<T>[] {
	const leaves: TreeNode<T>[] = [];

	const traverse = (node: TreeNode<T>) => {
		if (!node.children || node.children.length === 0) {
			leaves.push(node);
			return;
		}

		for (const child of node.children) {
			traverse(child);
		}
	};

	traverse(root);
	return leaves;
}

/**
 * Detect cycles in a graph
 */
export function detectCycles(edges: Edge[]): boolean {
	const adjacencyList = new Map<string, string[]>();

	// Build adjacency list
	for (const edge of edges) {
		if (!adjacencyList.has(edge.source)) {
			adjacencyList.set(edge.source, []);
		}
		adjacencyList.get(edge.source)?.push(edge.target);
	}

	const visited = new Set<string>();
	const recursionStack = new Set<string>();

	const hasCycle = (node: string): boolean => {
		visited.add(node);
		recursionStack.add(node);

		const neighbors = adjacencyList.get(node) || [];
		for (const neighbor of neighbors) {
			if (!visited.has(neighbor)) {
				if (hasCycle(neighbor)) {
					return true;
				}
			} else if (recursionStack.has(neighbor)) {
				return true;
			}
		}

		recursionStack.delete(node);
		return false;
	};

	// Check all nodes
	for (const node of adjacencyList.keys()) {
		if (!visited.has(node)) {
			if (hasCycle(node)) {
				return true;
			}
		}
	}

	return false;
}

/**
 * Calculate tree depth (maximum distance from root to any leaf)
 */
export function calculateTreeDepth<T>(root: TreeNode<T>): number {
	const traverse = (node: TreeNode<T>, depth: number): number => {
		if (!node.children || node.children.length === 0) {
			return depth;
		}

		return Math.max(...node.children.map((child) => traverse(child, depth + 1)));
	};

	return traverse(root, 0);
}

/**
 * Flatten a tree into a list of nodes (depth-first)
 */
export function flattenTree<T>(root: TreeNode<T>): TreeNode<T>[] {
	const result: TreeNode<T>[] = [];

	const traverse = (node: TreeNode<T>) => {
		result.push(node);
		if (node.children) {
			for (const child of node.children) {
				traverse(child);
			}
		}
	};

	traverse(root);
	return result;
}

/**
 * Filter tree nodes based on predicate
 */
export function filterTree<T>(
	root: TreeNode<T>,
	predicate: (node: TreeNode<T>) => boolean
): TreeNode<T> | null {
	const filterNode = (node: TreeNode<T>): TreeNode<T> | null => {
		// Filter children first
		const filteredChildren =
			node.children
				?.map((child) => filterNode(child))
				.filter((child): child is TreeNode<T> => child !== null) || [];

		// Include node if it matches predicate or has matching children
		if (predicate(node) || filteredChildren.length > 0) {
			return {
				...node,
				children: filteredChildren,
			};
		}

		return null;
	};

	return filterNode(root);
}

/**
 * Transform tree nodes using a mapping function
 */
export function mapTree<T, U>(root: TreeNode<T>, mapper: (node: TreeNode<T>) => U): TreeNode<U> {
	const mapNode = (node: TreeNode<T>): TreeNode<U> => ({
		id: node.id,
		data: mapper(node),
		children: node.children?.map(mapNode),
		parent: undefined, // Parent references need to be rebuilt
	});

	return mapNode(root);
}
