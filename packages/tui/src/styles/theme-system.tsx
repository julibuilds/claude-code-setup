// ============================================================================
// Theme System - Main Export File
// ============================================================================

// Re-export default themes
export { defaultThemes } from "./default-themes";

// Re-export all components and hooks
export { ThemeProvider, type ThemeProviderProps } from "./theme-context";
export { useComponentStyles, useTheme, useThemeColors } from "./theme-hooks";

// Re-export utilities
export {
	createCustomTheme,
	createThemeBuilder,
	createThemeFromVariables,
	mergeThemes,
	validateTheme,
} from "./theme-utils";
// Re-export all types
export type {
	ColorPalette,
	ComponentStyles,
	Theme as ThemeInterface,
	ThemeContextValue,
} from "./types";
