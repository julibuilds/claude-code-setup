import { nanoid } from "nanoid";
import { useRef } from "react";

/**
 * Hook that generates a unique ID that is stable across re-renders
 * The ID is generated once on the first render and remains the same
 * throughout the component's lifecycle
 *
 * @example
 * ```tsx
 * const id = useId()
 * return <box id={id}>Content</box>
 * ```
 */
export const useId = (): string => {
	const idRef = useRef<string | undefined>(undefined);

	if (!idRef.current) {
		idRef.current = nanoid();
	}

	return idRef.current;
};
