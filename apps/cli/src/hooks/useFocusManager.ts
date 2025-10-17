import { useKeyboard } from "@opentui/react";
import { useCallback, useState } from "react";

type FocusItem = string | number;

interface UseFocusManagerOptions<T extends FocusItem> {
	/** Initial focused item */
	initialFocus: T;
	/** Array of focusable items (for linear cycling) */
	items?: T[];
	/** Custom focus cycle function (for non-linear navigation) */
	onCycle?: (current: T, direction: "forward" | "backward") => T;
	/** Whether to enable Tab key cycling (default: true) */
	enableTab?: boolean;
	/** Whether to enable Shift+Tab for backward cycling (default: true) */
	enableShiftTab?: boolean;
}

/**
 * Unified focus management hook for consistent keyboard navigation
 * Supports both linear (array-based) and custom cycling patterns
 * 
 * @example Linear cycling
 * ```tsx
 * const { focused, setFocused } = useFocusManager({
 *   initialFocus: "field1",
 *   items: ["field1", "field2", "field3"]
 * });
 * 
 * <input focused={focused === "field1"} />
 * <input focused={focused === "field2"} />
 * <input focused={focused === "field3"} />
 * ```
 * 
 * @example Custom cycling
 * ```tsx
 * const { focused } = useFocusManager({
 *   initialFocus: "menu",
 *   onCycle: (current, direction) => {
 *     if (current === "menu" && direction === "forward") return "key";
 *     if (current === "key" && direction === "forward") return "value";
 *     if (current === "value" && direction === "backward") return "key";
 *     return "menu";
 *   }
 * });
 * ```
 */
export function useFocusManager<T extends FocusItem>({
	initialFocus,
	items,
	onCycle,
	enableTab = true,
	enableShiftTab = true,
}: UseFocusManagerOptions<T>) {
	const [focused, setFocused] = useState<T>(initialFocus);

	// Linear cycling using items array
	const cycleLinear = useCallback(
		(direction: "forward" | "backward"): T => {
			if (!items || items.length === 0) return focused;

			const currentIndex = items.indexOf(focused);
			if (currentIndex === -1) return items[0] as T;

			if (direction === "forward") {
				return items[(currentIndex + 1) % items.length] as T;
			}
			return items[(currentIndex - 1 + items.length) % items.length] as T;
		},
		[items, focused]
	);

	// Handle keyboard navigation
	useKeyboard((key) => {
		if (!enableTab && !enableShiftTab) return;

		if (key.name === "tab") {
			const direction = key.shift && enableShiftTab ? "backward" : "forward";

			if (!key.shift && !enableTab) return;

			const nextFocus = onCycle
				? onCycle(focused, direction)
				: cycleLinear(direction);

			setFocused(nextFocus);
		}
	});

	return {
		focused,
		setFocused,
		/** Manually cycle focus */
		cycle: (direction: "forward" | "backward" = "forward") => {
			const nextFocus = onCycle ? onCycle(focused, direction) : cycleLinear(direction);
			setFocused(nextFocus);
		},
		/** Check if a specific item is focused */
		isFocused: (item: T) => focused === item,
	};
}
