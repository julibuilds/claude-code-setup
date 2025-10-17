import { useRenderer } from "@opentui/react";

/**
 * Hook that provides easy access to the debug console
 * The debug console allows viewing output without interfering with the TUI
 *
 * @example
 * ```tsx
 * const debug = useDebugConsole()
 *
 * // Show/hide console
 * debug.show()
 * debug.hide()
 * debug.toggle()
 *
 * // Toggle debug overlay
 * debug.toggleOverlay()
 * ```
 */
export function useDebugConsole() {
	const renderer = useRenderer();

	return {
		show: () => renderer.console.show(),
		hide: () => renderer.console.hide(),
		toggle: () => renderer.console.toggle(),
		toggleOverlay: () => renderer.toggleDebugOverlay(),
	};
}
