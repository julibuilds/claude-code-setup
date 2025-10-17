import { useKeyboard } from "@opentui/react";

/**
 * Handles screen-level keyboard events using React's useKeyboard hook
 * 
 * @param handlers - Object with keyboard event handlers
 * 
 * @example
 * ```tsx
 * useScreenFocus({
 *   onTab: () => cycleFocus(),
 *   onEscape: () => goBack(),
 *   onCtrlS: () => save(),
 * })
 * ```
 */
export function useScreenFocus(handlers: {
	onTab?: () => void;
	onEscape?: () => void;
	onCtrlS?: () => void;
	onCtrlR?: () => void;
	onCtrlF?: () => void;
	onEnter?: () => void;
}) {
	useKeyboard((key) => {
		if (key.name === "tab" && handlers.onTab) {
			handlers.onTab();
		}
		if (key.name === "escape" && handlers.onEscape) {
			handlers.onEscape();
		}
		if (key.name === "return" && handlers.onEnter) {
			handlers.onEnter();
		}
		if (key.ctrl) {
			if (key.name === "s" && handlers.onCtrlS) {
				handlers.onCtrlS();
			}
			if (key.name === "r" && handlers.onCtrlR) {
				handlers.onCtrlR();
			}
			if (key.name === "f" && handlers.onCtrlF) {
				handlers.onCtrlF();
			}
		}
	});
}
