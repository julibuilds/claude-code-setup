import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import type { ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";
import { useMouse } from "../hooks/use-mouse";
import { useTextSelection } from "../hooks/use-text-selection";
import { useComponentStyles } from "../styles/theme-system";
import { copyToClipboard as copyToSystemClipboard } from "../utils/clipboard";

export interface SelectableTextProps {
	/** Text content to display */
	children: string;
	/** Unique identifier for this text component (auto-generated if not provided) */
	id?: string;
	/** Custom foreground color */
	fg?: string;
	/** Custom background color */
	bg?: string;
	/** Text attributes (bold, dim, etc.) */
	attributes?: number;
	/** Enable mouse selection */
	enableMouseSelection?: boolean;
	/** Enable keyboard selection (Shift + arrow keys) */
	enableKeyboardSelection?: boolean;
	/** Whether this component is focused for keyboard selection */
	focused?: boolean;
	/** Callback when selection changes */
	onSelectionChange?: (start: number, end: number, text: string) => void;
	/** Callback when copy is requested */
	onCopy?: (text: string) => void;
	/** Custom selection colors */
	selectionBg?: string;
	selectionFg?: string;
	/** Enable automatic clipboard copy (default: false) */
	enableClipboard?: boolean;
	/** React key prop (special prop, not passed to component) */
	key?: string | number;
}

/**
 * SelectableText component - Text with character-level selection support
 *
 * Features:
 * - Multi-element selection tracking
 * - Selection range (start, end positions)
 * - Visual highlight with customizable colors
 * - Copy-to-clipboard integration (via global selection state)
 * - Character-level precision
 * - Mouse and keyboard selection support
 *
 * @example
 * ```tsx
 * <TextSelectionProvider>
 *   <SelectableText enableMouseSelection>
 *     This text can be selected
 *   </SelectableText>
 * </TextSelectionProvider>
 * ```
 */
export const SelectableText = function SelectableText({
	children,
	id: providedId,
	fg,
	bg,
	attributes,
	enableMouseSelection = true,
	enableKeyboardSelection = false,
	focused = false,
	onSelectionChange,
	onCopy,
	selectionBg,
	selectionFg,
	enableClipboard = false,
}: SelectableTextProps) {
	const autoId = useId();
	const componentId = providedId || autoId;
	const componentStyles = useComponentStyles();
	const { selection, setSelection, clearSelection } = useTextSelection();

	const [localSelection, setLocalSelection] = useState<{ start: number; end: number } | null>(null);
	const [isSelecting, setIsSelecting] = useState(false);
	const [selectionStart, setSelectionStart] = useState<number | null>(null);
	const [keyboardCursor, setKeyboardCursor] = useState(0);

	const textRef = useRef<string>(children);
	const { onMouseDown, onMouseUp, onMove } = useMouse();

	// Update text ref when children changes
	useEffect(() => {
		textRef.current = children;
	}, [children]);

	// Check if this component has the active selection
	const hasActiveSelection = selection?.componentId === componentId;

	// Handle mouse selection start
	const handleMouseDown = onMouseDown(() => {
		if (!enableMouseSelection) return;
		setIsSelecting(true);
		// Clear any existing selection
		setLocalSelection(null);
		setSelectionStart(null);
	});

	// Handle mouse selection end
	const handleMouseUp = onMouseUp(() => {
		if (!enableMouseSelection || !isSelecting) return;
		setIsSelecting(false);

		if (localSelection && localSelection.start !== localSelection.end) {
			const start = Math.min(localSelection.start, localSelection.end);
			const end = Math.max(localSelection.start, localSelection.end);
			const selectedText = textRef.current.substring(start, end);

			setSelection({ start, end, componentId }, selectedText);

			onSelectionChange?.(start, end, selectedText);
		}
	});

	// Handle mouse move during selection
	const handleMouseMove = onMove((x, y) => {
		if (!enableMouseSelection || !isSelecting) return;

		// Approximate character position based on x coordinate
		const charIndex = Math.max(0, Math.min(x, textRef.current.length));

		if (selectionStart === null) {
			setSelectionStart(charIndex);
			setLocalSelection({ start: charIndex, end: charIndex });
		} else {
			setLocalSelection({
				start: selectionStart,
				end: charIndex,
			});
		}
	});

	// Copy selection to clipboard
	const handleCopy = async (text: string) => {
		if (enableClipboard) {
			try {
				await copyToSystemClipboard(text);
				console.log(`Copied to clipboard: "${text}"`);
			} catch (error) {
				console.error("Failed to copy to clipboard:", error);
			}
		}
		onCopy?.(text);
	};

	// Keyboard selection support
	useKeyboard((evt) => {
		if (!enableKeyboardSelection || !focused) return;

		// Handle Ctrl/Cmd+C for copy
		if ((evt.ctrl || evt.meta) && evt.name === "c") {
			if (activeSelection && activeSelection.start !== activeSelection.end) {
				const start = Math.min(activeSelection.start, activeSelection.end);
				const end = Math.max(activeSelection.start, activeSelection.end);
				const selectedText = textRef.current.substring(start, end);
				handleCopy(selectedText);
			}
			return;
		}

		// Handle Escape to clear selection
		if (evt.name === "escape") {
			setLocalSelection(null);
			clearSelection();
			return;
		}

		// Handle Shift + arrow keys for selection
		if (evt.shift) {
			const currentCursor = keyboardCursor;
			let newCursor = currentCursor;

			if (evt.name === "left") {
				newCursor = Math.max(0, currentCursor - 1);
			} else if (evt.name === "right") {
				newCursor = Math.min(textRef.current.length, currentCursor + 1);
			}

			if (newCursor !== currentCursor) {
				setKeyboardCursor(newCursor);

				// Update selection
				if (!localSelection) {
					setLocalSelection({ start: currentCursor, end: newCursor });
				} else {
					setLocalSelection({ ...localSelection, end: newCursor });
				}

				// Update global selection
				const start = Math.min(localSelection?.start ?? currentCursor, newCursor);
				const end = Math.max(localSelection?.start ?? currentCursor, newCursor);
				if (start !== end) {
					const selectedText = textRef.current.substring(start, end);
					setSelection({ start, end, componentId }, selectedText);
					onSelectionChange?.(start, end, selectedText);
				}
			}
		} else if (evt.name === "left" || evt.name === "right") {
			// Move cursor without selection
			let newCursor = keyboardCursor;
			if (evt.name === "left") {
				newCursor = Math.max(0, keyboardCursor - 1);
			} else if (evt.name === "right") {
				newCursor = Math.min(textRef.current.length, keyboardCursor + 1);
			}
			setKeyboardCursor(newCursor);
			setLocalSelection(null);
		}
	});

	// Determine which selection to use (local or global)
	const activeSelection =
		hasActiveSelection && selection
			? { start: selection.start, end: selection.end }
			: localSelection;

	// Render text with selection highlights
	const renderText = (): ReactNode[] => {
		if (!activeSelection || activeSelection.start === activeSelection.end) {
			// No selection - render normally
			return [
				<text key="text" fg={fg} bg={bg} attributes={attributes} selectable={false}>
					{children}
				</text>,
			];
		}

		const start = Math.min(activeSelection.start, activeSelection.end);
		const end = Math.max(activeSelection.start, activeSelection.end);

		const beforeSelection = children.substring(0, start);
		const selectedText = children.substring(start, end);
		const afterSelection = children.substring(end);

		const selBg = selectionBg || componentStyles.selection.backgroundColor;
		const selFg = selectionFg || componentStyles.selection.textColor;

		return [
			beforeSelection && (
				<text key="before" fg={fg} bg={bg} attributes={attributes} selectable={false}>
					{beforeSelection}
				</text>
			),
			<text
				key="selected"
				fg={selFg}
				bg={selBg}
				attributes={attributes || TextAttributes.BOLD}
				selectable={false}
			>
				{selectedText}
			</text>,
			afterSelection && (
				<text key="after" fg={fg} bg={bg} attributes={attributes} selectable={false}>
					{afterSelection}
				</text>
			),
		].filter(Boolean);
	};

	return (
		<box
			style={{ flexDirection: "row" }}
			onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}
			onMouseMove={handleMouseMove}
		>
			{renderText()}
		</box>
	);
};

/**
 * SelectableTextBlock component - Multi-line text with selection support
 *
 * @example
 * ```tsx
 * <SelectableTextBlock>
 *   Line 1: First line of text
 *   Line 2: Second line of text
 *   Line 3: Third line of text
 * </SelectableTextBlock>
 * ```
 */
export function SelectableTextBlock({
	children,
	id,
	enableMouseSelection = true,
	enableKeyboardSelection = false,
	onSelectionChange,
	selectionBg,
	selectionFg,
}: Omit<SelectableTextProps, "fg" | "bg" | "attributes">): ReactNode {
	const lines = (children || "").split("\n");

	return (
		<box style={{ flexDirection: "column" }}>
			{lines.map((line, index) => (
				<SelectableText
					key={`${id || "block"}-line-${index}`}
					id={`${id || "block"}-line-${index}`}
					enableMouseSelection={enableMouseSelection}
					enableKeyboardSelection={enableKeyboardSelection}
					onSelectionChange={onSelectionChange}
					selectionBg={selectionBg}
					selectionFg={selectionFg}
				>
					{line}
				</SelectableText>
			))}
		</box>
	);
}

/**
 * SelectionToolbar component - Shows current selection info and actions
 *
 * @example
 * ```tsx
 * <TextSelectionProvider>
 *   <SelectionToolbar enableClipboard={true} />
 *   <SelectableText>Select this text</SelectableText>
 * </TextSelectionProvider>
 * ```
 */
export function SelectionToolbar({
	enableClipboard = false,
}: {
	enableClipboard?: boolean;
}): ReactNode {
	const { selectedText, hasSelection, clearSelection } = useTextSelection();
	const componentStyles = useComponentStyles();

	if (!hasSelection) {
		return null;
	}

	const handleCopy = async () => {
		if (enableClipboard) {
			try {
				await copyToSystemClipboard(selectedText);
				console.log(`Copied to clipboard: "${selectedText}"`);
			} catch (error) {
				console.error("Failed to copy to clipboard:", error);
			}
		} else {
			console.log(`Copy requested: "${selectedText}"`);
		}
	};

	const handleClear = () => {
		clearSelection();
	};

	// Handle keyboard shortcuts
	useKeyboard((evt) => {
		// Hook must be called unconditionally, but we can check hasSelection inside
		if (!hasSelection) {
			// Do nothing if no selection, but hook is still called
			return;
		}

		// Ctrl/Cmd+C to copy
		if ((evt.ctrl || evt.meta) && evt.name === "c") {
			handleCopy();
			return;
		}

		// Escape to clear
		if (evt.name === "escape") {
			handleClear();
			return;
		}

		// 'c' key to copy (without modifier)
		if (evt.name === "c") {
			handleCopy();
			return;
		}
	});

	return (
		<box
			style={{
				flexDirection: "row",
				gap: 2,
				padding: 1,
				backgroundColor: componentStyles.panel.backgroundColor,
				borderColor: componentStyles.selection.borderColor,
			}}
		>
			<text fg={componentStyles.selection.textColor} selectable={false}>
				Selected: "{selectedText.substring(0, 30)}
				{selectedText.length > 30 ? "..." : ""}"
			</text>
			<text fg="gray" selectable={false}>
				({selectedText.length} chars)
			</text>
			<text fg="blue" selectable={false}>
				[C]opy
			</text>
			<text fg="red" selectable={false}>
				[Esc] Clear
			</text>
		</box>
	);
}
