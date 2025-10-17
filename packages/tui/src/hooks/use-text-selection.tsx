import { createContext, type ReactNode, useContext, useState } from "react";

/**
 * Selection range
 */
export interface SelectionRange {
	start: number;
	end: number;
	componentId?: string;
}

/**
 * Text selection context value
 */
interface TextSelectionContextValue {
	selection: SelectionRange | null;
	selectedText: string;
	setSelection: (range: SelectionRange | null, text: string) => void;
	clearSelection: () => void;
	hasSelection: boolean;
}

const TextSelectionContext = createContext<TextSelectionContextValue | undefined>(undefined);

/**
 * Provider for text selection state
 */
export function TextSelectionProvider({ children }: { children: ReactNode }): ReactNode {
	const [selection, setSelectionState] = useState<SelectionRange | null>(null);
	const [selectedText, setSelectedText] = useState("");

	const setSelection = (range: SelectionRange | null, text: string) => {
		setSelectionState(range);
		setSelectedText(text);
	};

	const clearSelection = () => {
		setSelectionState(null);
		setSelectedText("");
	};

	return (
		<TextSelectionContext.Provider
			value={{
				selection,
				selectedText,
				setSelection,
				clearSelection,
				hasSelection: selection !== null,
			}}
		>
			{children}
		</TextSelectionContext.Provider>
	);
}

/**
 * Hook for accessing text selection state
 *
 * @example
 * ```tsx
 * const { selection, selectedText, setSelection, clearSelection } = useTextSelection();
 *
 * // Set selection
 * setSelection({ start: 0, end: 5, componentId: 'text-1' }, 'Hello');
 *
 * // Clear selection
 * clearSelection();
 * ```
 */
export function useTextSelection(): TextSelectionContextValue {
	const context = useContext(TextSelectionContext);
	if (!context) {
		throw new Error("useTextSelection must be used within a TextSelectionProvider");
	}
	return context;
}
