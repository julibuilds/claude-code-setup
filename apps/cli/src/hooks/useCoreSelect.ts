import type { SelectOption } from "@opentui/core";
import { type SelectRenderable, SelectRenderableEvents } from "@opentui/core";
import { useEffect, useRef } from "react";

/**
 * Provides access to Core SelectRenderable events and methods
 * 
 * @param onSelectionChanged - Callback when selection changes (arrow keys)
 * @param onItemSelected - Callback when item is selected (Enter key)
 * @returns Ref to attach to <select> component
 * 
 * @example
 * ```tsx
 * const selectRef = useCoreSelect(
 *   (index, option) => console.log('Navigated to', option),
 *   (index, option) => console.log('Selected', option)
 * )
 * 
 * return <select ref={selectRef} options={options} focused={true} />
 * ```
 */
export function useCoreSelect(
	onSelectionChanged?: (index: number, option: SelectOption) => void,
	onItemSelected?: (index: number, option: SelectOption) => void
) {
	const selectRef = useRef<SelectRenderable>(null);

	useEffect(() => {
		if (!selectRef.current) return;

		const select = selectRef.current;
		const handlers: Array<{ event: string; handler: (...args: any[]) => void }> = [];

		if (onSelectionChanged) {
			const handler = (index: number, option: SelectOption) => {
				onSelectionChanged(index, option);
			};
			select.on(SelectRenderableEvents.SELECTION_CHANGED, handler);
			handlers.push({ event: SelectRenderableEvents.SELECTION_CHANGED, handler });
		}

		if (onItemSelected) {
			const handler = (index: number, option: SelectOption) => {
				onItemSelected(index, option);
			};
			select.on(SelectRenderableEvents.ITEM_SELECTED, handler);
			handlers.push({ event: SelectRenderableEvents.ITEM_SELECTED, handler });
		}

		return () => {
			// Cleanup event listeners with proper handler references
			handlers.forEach(({ event, handler }) => {
				select.off(event, handler);
			});
		};
	}, [onSelectionChanged, onItemSelected]);

	return selectRef;
}
