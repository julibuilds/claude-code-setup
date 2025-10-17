import { createContext, type ReactNode, useCallback, useMemo, useState } from "react";
import { defaultThemes } from "./default-themes";
import { validateTheme } from "./theme-utils";
import type { ColorPalette, ComponentStyles, Theme, ThemeContextValue } from "./types";

// ============================================================================
// Theme Context and Provider
// ============================================================================

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
	children: ReactNode;
	initialTheme?: Theme | keyof typeof defaultThemes;
	/**
	 * Whether to validate and fill missing theme properties with defaults
	 * @default true
	 */
	validate?: boolean;
	/**
	 * Custom theme overrides that will be applied on top of the initial theme
	 */
	overrides?: Partial<Theme>;
}

export function ThemeProvider({
	children,
	initialTheme = "dark",
	validate = true,
	overrides = {},
}: ThemeProviderProps) {
	const [theme, setTheme] = useState<Theme>(() => {
		let baseTheme: Theme;

		if (typeof initialTheme === "string") {
			baseTheme = defaultThemes[initialTheme];
		} else {
			baseTheme = initialTheme || defaultThemes.dark;
		}

		// Apply overrides if provided
		if (Object.keys(overrides).length > 0) {
			baseTheme = {
				...baseTheme,
				...overrides,
				colors: {
					...baseTheme.colors,
					...overrides.colors,
				},
				components: {
					...baseTheme.components,
					...overrides.components,
				},
			};
		}

		// Validate and fill missing properties if requested
		return validate ? validateTheme(baseTheme) : baseTheme;
	});

	const updateColors = useCallback((colors: Partial<ColorPalette>) => {
		setTheme((prev) => ({
			...prev,
			colors: {
				...prev.colors,
				...colors,
			},
		}));
	}, []);

	const updateComponentStyles = useCallback((styles: Partial<ComponentStyles>) => {
		setTheme((prev) => ({
			...prev,
			components: {
				...prev.components,
				...styles,
			},
		}));
	}, []);

	const resetToDefault = useCallback(() => {
		setTheme(defaultThemes.dark);
	}, []);

	/**
	 * Apply a complete theme override
	 */
	const applyTheme = useCallback(
		(newTheme: Theme | Partial<Theme>) => {
			setTheme(validate ? validateTheme(newTheme) : (newTheme as Theme));
		},
		[validate]
	);

	/**
	 * Merge additional customizations into the current theme
	 */
	const mergeCustomizations = useCallback(
		(customizations: Partial<Theme>) => {
			setTheme((prev) => {
				const merged = {
					...prev,
					...customizations,
					colors: {
						...prev.colors,
						...customizations.colors,
					},
					components: {
						...prev.components,
						...customizations.components,
					},
				};
				return validate ? validateTheme(merged) : (merged as Theme);
			});
		},
		[validate]
	);

	const contextValue = useMemo<ThemeContextValue>(
		() => ({
			theme,
			setTheme,
			updateColors,
			updateComponentStyles,
			resetToDefault,
			applyTheme,
			mergeCustomizations,
		}),
		[theme, updateColors, updateComponentStyles, resetToDefault, applyTheme, mergeCustomizations]
	);

	return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

export { ThemeContext };
