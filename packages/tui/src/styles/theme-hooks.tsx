import { useContext } from "react";
import { ThemeContext } from "./theme-context";
import type { ColorPalette, ComponentStyles, ThemeContextValue } from "./types";

// ============================================================================
// Theme Hooks
// ============================================================================

export function useTheme(): ThemeContextValue {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
}

export function useThemeColors(): ColorPalette {
	const { theme } = useTheme();
	return theme.colors;
}

export function useComponentStyles(): ComponentStyles {
	const { theme } = useTheme();
	return theme.components;
}
