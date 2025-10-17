import { useEffect, useRef, useState } from "react";

/**
 * Hook to detect if content overflows by measuring in a hidden box
 *
 * Strategy:
 * 1. Render content in a hidden measurement box (no height constraint)
 * 2. Measure its natural height
 * 3. If height > maxHeight, render with scrollbox
 * 4. Otherwise render normally
 *
 * @param maxHeight - Maximum height before overflow is detected
 * @returns Object with hasOverflow flag, measured flag, and measurementRef
 *
 * @example
 * ```tsx
 * const { hasOverflow, measured, measurementRef } = useOverflowDetection(60);
 *
 * return (
 *   <>
 *     {!measured && (
 *       <box
 *         ref={measurementRef}
 *         style={{ position: "absolute", left: -9999, flexDirection: "column" }}
 *       >
 *         {children}
 *       </box>
 *     )}
 *     {measured && hasOverflow ? (
 *       <scrollbox maxHeight={60} scrollY={true}>{children}</scrollbox>
 *     ) : measured ? (
 *       <box style={{ flexDirection: "column" }}>{children}</box>
 *     ) : null}
 *   </>
 * );
 * ```
 */
export function useOverflowDetection(maxHeight: number) {
	// biome-ignore lint/suspicious/noExplicitAny: BoxRenderable type has complex nested dependency issues
	const measurementRef = useRef<any>(null);
	const [hasOverflow, setHasOverflow] = useState(false);
	const [measured, setMeasured] = useState(false);

	useEffect(() => {
		const measureBox = measurementRef.current;
		if (!measureBox) {
			return;
		}

		// Measure the natural height of content
		const checkOverflow = () => {
			const contentHeight = measureBox.height;
			const needsScrolling = contentHeight > maxHeight;
			setHasOverflow(needsScrolling);
			setMeasured(true);
		};

		// Small delay to ensure content is rendered
		const timer = setTimeout(checkOverflow, 0);

		// Listen for layout changes (when content is added/resized)
		const handleLayoutChange = () => {
			checkOverflow();
		};

		measureBox.on?.("layout-changed", handleLayoutChange);

		return () => {
			clearTimeout(timer);
			measureBox.off?.("layout-changed", handleLayoutChange);
		};
	}, [maxHeight]);

	return {
		hasOverflow,
		measured,
		measurementRef,
	};
}
