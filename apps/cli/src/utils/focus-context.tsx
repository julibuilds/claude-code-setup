import React, { createContext, type ReactNode, useContext } from "react";

interface FocusContextValue {
	inFocus: boolean;
}

const FocusContext = createContext<FocusContextValue>({ inFocus: true });

interface InFocusProps {
	children: ReactNode;
	inFocus: boolean;
}

export function InFocus({ children, inFocus }: InFocusProps): ReactNode {
	const value = React.useMemo(() => ({ inFocus }), [inFocus]);
	return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>;
}

export function useIsInFocus(): boolean {
	const context = useContext(FocusContext);
	return context.inFocus;
}
