import type { PasteEvent } from "@opentui/core";
import { useAppContext } from "@opentui/react";
import { useEffect, useRef } from "react";

export type PasteHandler = (event: PasteEvent) => void;

/**
 * useOpentuiPaste hook - Subscribe to OpenTUI paste events.
 * Allows React components to handle bracketed paste sequences from the terminal.
 *
 * @param handler - Callback function to handle paste events
 *
 * @example
 * ```tsx
 * useOpentuiPaste((event) => {
 *   console.log('Pasted text:', event.text);
 * });
 * ```
 */
export function useOpentuiPaste(
  handler: PasteHandler | null | undefined
): void {
  const { keyHandler } = useAppContext();
  const handlerRef = useRef<PasteHandler | null | undefined>(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!keyHandler) return;

    const listener = (event: PasteEvent) => {
      handlerRef.current?.(event);
    };

    keyHandler.on("paste", listener);

    return () => {
      keyHandler.off("paste", listener);
    };
  }, [keyHandler]);
}
