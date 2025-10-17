import type { BoxRenderable } from "@opentui/core";
import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import React, { createContext, type ReactNode, useContext, useRef, useState } from "react";
import { InFocus, useIsInFocus } from "../utils/focus-context";

export interface OverlayProps {
	children: ReactNode;
	alignItems?: "flex-start" | "center" | "flex-end";
	justifyContent?: "flex-start" | "center" | "flex-end";
	paddingTop?: number;
	paddingRight?: number;
	paddingBottom?: number;
	paddingLeft?: number;
	backgroundColor?: string;
	onClickOutside?: () => void;
	style?: Partial<BoxRenderable>;
}

/**
 * A primitive overlay component that renders children in an absolute positioned layer.
 * Provides basic layout, padding, and click-outside handling - all customizable.
 */
export function Overlay({
	children,
	alignItems = "center",
	justifyContent = "center",
	paddingTop,
	paddingRight,
	paddingBottom,
	paddingLeft,
	backgroundColor,
	onClickOutside,
	style = {},
}: OverlayProps): ReactNode {
	const dimensions = useTerminalDimensions();
	const inFocus = useIsInFocus();
	const clickedInside = useRef(false);

	const handleBackdropClick = () => {
		if (!inFocus) return;
		if (!clickedInside.current) {
			onClickOutside?.();
		}
		clickedInside.current = false;
	};

	const handleContentClick = () => {
		clickedInside.current = true;
	};

	return (
		<box
			border={false}
			width={dimensions.width}
			height={dimensions.height}
			alignItems={alignItems}
			justifyContent={justifyContent}
			position="absolute"
			paddingTop={paddingTop}
			paddingRight={paddingRight}
			paddingBottom={paddingBottom}
			paddingLeft={paddingLeft}
			left={0}
			top={0}
			backgroundColor={backgroundColor}
			onMouseDown={handleBackdropClick}
			{...style}
		>
			<box onMouseDown={handleContentClick}>{children}</box>
		</box>
	);
}

// Legacy Dialog component - now implemented using Overlay primitive
export type DialogPosition = "center" | "top-right" | "bottom-right";

export interface DialogStackItem {
	element: ReactNode;
	position?: DialogPosition;
}

interface DialogProps {
	children: ReactNode;
	position?: DialogPosition;
	onClickOutside?: () => void;
}

/**
 * Internal Dialog component used by DialogProvider.
 * For external use, prefer the Overlay component directly for more flexibility.
 */
export function Dialog({ children, position = "center", onClickOutside }: DialogProps): ReactNode {
	const dimensions = useTerminalDimensions();

	// Convert legacy position to Overlay props
	const getOverlayProps = (): Partial<OverlayProps> => {
		switch (position) {
			case "top-right":
				return {
					alignItems: "flex-end",
					justifyContent: "flex-start",
					paddingTop: 2,
					paddingRight: 2,
				};
			default:
				return {
					alignItems: "center",
					justifyContent: "flex-start",
					paddingTop: Math.floor(dimensions.height / 4),
				};
		}
	};

	return (
		<Overlay {...getOverlayProps()} onClickOutside={onClickOutside}>
			<box border={false} width={76} maxWidth={dimensions.width - 2} paddingTop={1}>
				{children}
			</box>
		</Overlay>
	);
}

// Dialog context for managing dialog stack
interface DialogContextType {
	dialogStack: DialogStackItem[];
	push: (element: ReactNode, position?: DialogPosition) => void;
	clear: () => void;
	replace: (element: ReactNode, position?: DialogPosition) => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

interface DialogProviderProps {
	children: ReactNode;
}

export function DialogProvider({ children }: DialogProviderProps): ReactNode {
	const [dialogStack, setDialogStack] = useState<DialogStackItem[]>([]);
	const inFocus = useIsInFocus();

	useKeyboard((evt) => {
		if (!inFocus) return;
		if (evt.name === "escape") {
			if (dialogStack.length > 0) {
				setDialogStack((prev) => prev.slice(0, -1));
			}
		}
	});

	const push = React.useCallback((element: ReactNode, position?: DialogPosition) => {
		setDialogStack((prev) => [...prev, { element, position }]);
	}, []);

	const clear = React.useCallback(() => {
		setDialogStack([]);
	}, []);

	const replace = React.useCallback((element: ReactNode, position?: DialogPosition) => {
		setDialogStack([{ element, position }]);
	}, []);

	const value = React.useMemo(
		() => ({
			dialogStack,
			push,
			clear,
			replace,
		}),
		[dialogStack, clear, push, replace]
	);

	return (
		<DialogContext.Provider value={value}>
			<InFocus inFocus={!dialogStack?.length}>{children}</InFocus>
			{dialogStack.length > 0 && (
				<box position="absolute">
					{dialogStack.map((item, index) => {
						const isLastItem = index === dialogStack.length - 1;
						return (
							<box key={`dialog${String(index)}`}>
								<InFocus inFocus={isLastItem}>
									<Dialog
										position={item.position}
										onClickOutside={() => {
											if (!isLastItem) return;
											setDialogStack((prev) => prev.slice(0, -1));
										}}
									>
										{item.element}
									</Dialog>
								</InFocus>
							</box>
						);
					})}
				</box>
			)}
		</DialogContext.Provider>
	);
}

/**
 * Hook to access dialog management functions
 *
 * @example
 * ```tsx
 * const dialog = useDialog()
 *
 * // Push a new dialog
 * dialog.push(<MyDialog />, 'center')
 *
 * // Clear all dialogs
 * dialog.clear()
 *
 * // Replace current dialog stack
 * dialog.replace(<NewDialog />)
 * ```
 */
export function useDialog() {
	const context = useContext(DialogContext);
	if (!context) {
		throw new Error("useDialog must be used within a DialogProvider");
	}
	return {
		push: context.push,
		clear: context.clear,
		replace: context.replace,
		stack: context.dialogStack,
	};
}
