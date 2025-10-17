import { useKeyboard } from "@opentui/react";
import { useState } from "react";

/**
 * Manages focus across multiple panels with Tab key navigation
 * Uses React's useKeyboard hook for compatibility
 * 
 * @param panelCount - Total number of panels
 * @returns Object with focusedPanel index and setter
 * 
 * @example
 * ```tsx
 * const { focusedPanel, setFocusedPanel } = useMultiPanelFocus(3)
 * 
 * return (
 *   <box style={{ flexDirection: "row" }}>
 *     <Panel focused={focusedPanel === 0} />
 *     <Panel focused={focusedPanel === 1} />
 *     <Panel focused={focusedPanel === 2} />
 *   </box>
 * )
 * ```
 */
export function useMultiPanelFocus(panelCount: number) {
	const [focusedPanel, setFocusedPanel] = useState(0);

	useKeyboard((key) => {
		if (key.name === "tab") {
			setFocusedPanel((current) =>
				key.shift
					? (current - 1 + panelCount) % panelCount
					: (current + 1) % panelCount
			);
		}
	});

	return { focusedPanel, setFocusedPanel };
}
