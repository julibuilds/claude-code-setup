import { useEffect, useState } from "react";

export interface ActivityLogScrollOptions {
	/** Current list of items */
	itemCount: number;
	/** Viewport height in lines */
	viewportHeight: number;
	/** Initial follow mode state */
	initialFollowMode?: boolean;
	/** Height of each item (default: 1 line per item) */
	getItemHeight?: (index: number) => number;
}

export interface ActivityLogScrollState {
	/** Currently selected item index */
	selectedIndex: number;
	/** Scroll position (top line visible in viewport) */
	scrollPosition: number;
	/** Whether auto-follow mode is active */
	isFollowMode: boolean;
	/** Number of items above the viewport */
	itemsAbove: number;
	/** Number of items below the viewport */
	itemsBelow: number;
	/** Check if an item is visible in the viewport */
	isItemVisible: (index: number) => boolean;
	/** Set the selected index */
	setSelectedIndex: (index: number | ((prev: number) => number)) => void;
	/** Set follow mode */
	setIsFollowMode: (value: boolean) => void;
	/** Set scroll position */
	setScrollPosition: (position: number) => void;
}

/**
 * Hook to manage scroll state and viewport logic for activity logs
 *
 * Features:
 * - Auto-follow new entries when in follow mode
 * - Pause on manual scroll up
 * - Resume follow with End key
 * - Overflow indicators (items above/below)
 * - Viewport management
 * - Variable item heights support
 *
 * @example
 * ```tsx
 * const {
 *   selectedIndex,
 *   isFollowMode,
 *   isItemVisible,
 *   itemsAbove,
 *   itemsBelow,
 *   setSelectedIndex,
 *   setIsFollowMode
 * } = useActivityLogScroll({
 *   itemCount: logs.length,
 *   viewportHeight: 20,
 *   initialFollowMode: true
 * });
 *
 * // Keyboard handling
 * useKeyboard((key) => {
 *   if (key.name === 'up') {
 *     setSelectedIndex(prev => Math.max(0, prev - 1));
 *     setIsFollowMode(false); // Disable follow mode on manual navigation
 *   }
 *   if (key.name === 'end') {
 *     setIsFollowMode(true); // Re-enable follow mode
 *   }
 * });
 * ```
 */
export function useActivityLogScroll({
	itemCount,
	viewportHeight,
	initialFollowMode = true,
	getItemHeight = () => 1,
}: ActivityLogScrollOptions): ActivityLogScrollState {
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [scrollPosition, setScrollPosition] = useState(0);
	const [isFollowMode, setIsFollowMode] = useState(initialFollowMode);

	// Defensive: ensure selectedIndex is always valid
	const safeSelectedIndex = Math.max(0, Math.min(selectedIndex, Math.max(0, itemCount - 1)));

	// Calculate cumulative positions (where each item starts in line-space)
	const itemPositions: number[] = [];
	let cumulative = 0;
	for (let i = 0; i < itemCount; i++) {
		itemPositions.push(cumulative);
		cumulative += getItemHeight(i);
	}

	// Viewport info
	const viewportStart = scrollPosition;
	const viewportEnd = scrollPosition + viewportHeight;

	// Helper: is an item visible in current viewport?
	const isItemVisible = (index: number): boolean => {
		if (index < 0 || index >= itemCount) return false;
		const itemStart = itemPositions[index] ?? 0;
		const itemEnd = itemStart + getItemHeight(index);
		return itemEnd > viewportStart && itemStart < viewportEnd;
	};

	// Calculate overflow indicators
	const itemsAbove =
		itemCount > 0
			? itemPositions.filter((pos, i) => {
					const itemEnd = pos + getItemHeight(i);
					return itemEnd <= viewportStart;
				}).length
			: 0;

	const itemsBelow = itemCount > 0 ? itemPositions.filter((pos) => pos >= viewportEnd).length : 0;

	// Auto-scroll to keep selection visible
	useEffect(() => {
		if (itemCount === 0 || itemPositions.length === 0) return;

		const selectedItemStart = itemPositions[safeSelectedIndex] ?? 0;
		const selectedItemEnd = selectedItemStart + getItemHeight(safeSelectedIndex);

		// If selected item starts above viewport, scroll up to show it at top
		if (selectedItemStart < viewportStart) {
			setScrollPosition(Math.max(0, selectedItemStart));
			return;
		}

		// If selected item ends below viewport, scroll down to show it at bottom
		if (selectedItemEnd > viewportEnd) {
			setScrollPosition(Math.max(0, selectedItemEnd - viewportHeight));
			return;
		}

		// Item is fully visible, don't scroll
	}, [
		itemCount,
		safeSelectedIndex,
		viewportHeight,
		viewportStart,
		viewportEnd,
		itemPositions,
		getItemHeight,
	]);

	// Auto-follow when in follow mode and new items arrive
	useEffect(() => {
		if (itemCount === 0) {
			setSelectedIndex(0);
			setScrollPosition(0);
			return;
		}

		// Ensure selected index is valid
		if (selectedIndex >= itemCount) {
			setSelectedIndex(itemCount - 1);
		}

		// When in follow mode, always move selection to the last item
		if (isFollowMode) {
			setSelectedIndex(itemCount - 1);
		}
	}, [itemCount, isFollowMode, selectedIndex]);

	return {
		selectedIndex: safeSelectedIndex,
		scrollPosition,
		isFollowMode,
		itemsAbove,
		itemsBelow,
		isItemVisible,
		setSelectedIndex,
		setIsFollowMode,
		setScrollPosition,
	};
}
