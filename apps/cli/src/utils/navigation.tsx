import { useKeyboard } from "@opentui/react";
import React, {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useState,
	useTransition,
} from "react";
import { useIsInFocus } from "./focus-context";

export interface NavigationStackItem {
	element: ReactNode;
	onPop?: () => void;
}

interface Navigation {
	push: (element: ReactNode, onPop?: () => void) => void;
	pop: () => void;
}

interface NavigationContextType {
	navigation: Navigation;
	stack: NavigationStackItem[];
	isPending: boolean;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
	children: ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps): ReactNode {
	const [stack, setStack] = useState<NavigationStackItem[]>([{ element: children }]);
	const [isPending, startNavigationTransition] = useTransition();

	const push = useCallback((element: ReactNode, onPop?: () => void) => {
		if (!element) {
			throw new Error(`cannot push falsy value ${element}`);
		}

		startNavigationTransition(() => {
			setStack((prev) => [...prev, { element, onPop }]);
		});
	}, []);

	const pop = useCallback(() => {
		setStack((prev) => {
			if (prev.length <= 1) return prev;

			const poppedItem = prev[prev.length - 1];
			if (poppedItem?.onPop) {
				poppedItem.onPop();
			}

			return prev.slice(0, -1);
		});
	}, []);

	const navigation = React.useMemo(
		() => ({
			push,
			pop,
		}),
		[push, pop]
	);

	const value = React.useMemo(
		() => ({
			navigation,
			stack,
			isPending,
		}),
		[navigation, stack, isPending]
	);

	const inFocus = useIsInFocus();

	// Handle ESC key to pop navigation
	useKeyboard((evt) => {
		if (!inFocus) return;
		if (evt.name === "escape" && stack.length > 1) {
			pop();
		}
	});

	const currentItem = stack[stack.length - 1];

	return (
		<NavigationContext.Provider value={value}>
			{React.cloneElement(currentItem?.element as React.ReactElement, {
				key: stack.length,
			})}
		</NavigationContext.Provider>
	);
}

export function useNavigation(): Navigation {
	const context = useContext(NavigationContext);
	if (!context) {
		throw new Error("useNavigation must be used within a NavigationProvider");
	}
	return context.navigation;
}

export function useNavigationPending(): boolean {
	const context = useContext(NavigationContext);
	return context?.isPending || false;
}

interface NavigationContainerProps {
	children: ReactNode;
}

export function NavigationContainer({ children }: NavigationContainerProps): ReactNode {
	return <NavigationProvider>{children}</NavigationProvider>;
}
