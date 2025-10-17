import { RGBA } from "@opentui/core";
import { defaultThemes } from "./default-themes";
import type { ColorPalette, ComponentStyles, Theme } from "./types";

// ============================================================================
// Theme Utilities
// ============================================================================

/**
 * Deep merge utility for nested objects
 */
function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
	const result = { ...target };

	for (const key in source) {
		if (source[key] !== undefined) {
			if (typeof source[key] === "object" && source[key] !== null && !Array.isArray(source[key])) {
				result[key] = deepMerge(target[key] || ({} as any), source[key] as any);
			} else {
				result[key] = source[key] as any;
			}
		}
	}

	return result;
}

/**
 * Create a custom theme by extending a base theme with customizations
 * Supports deep merging for nested color and component properties
 */
export function createCustomTheme(
	baseTheme: Theme | keyof typeof defaultThemes = "dark",
	customizations: Partial<Theme> = {}
): Theme {
	const base = typeof baseTheme === "string" ? defaultThemes[baseTheme] : baseTheme;

	return deepMerge(base, customizations);
}

/**
 * Merge multiple themes together, with later themes overriding earlier ones
 */
export function mergeThemes(...themes: Partial<Theme>[]): Theme {
	return themes.reduce(
		(acc: Theme, theme: Partial<Theme>): Theme => {
			return deepMerge(acc, theme);
		},
		{ ...defaultThemes.dark }
	);
}

/**
 * Create a theme builder for fluent API customization
 */
export function createThemeBuilder(baseTheme: Theme | keyof typeof defaultThemes = "dark") {
	const base = typeof baseTheme === "string" ? defaultThemes[baseTheme] : baseTheme;
	const customizations: Partial<Theme> = {};

	return {
		/**
		 * Set theme metadata
		 */
		name(name: string) {
			customizations.name = name;
			return this;
		},

		description(description: string) {
			customizations.description = description;
			return this;
		},

		/**
		 * Customize colors
		 */
		colors(colors: Partial<ColorPalette>) {
			customizations.colors = deepMerge(customizations.colors || ({} as any), colors);
			return this;
		},

		/**
		 * Customize specific color categories
		 */
		textColors(colors: Partial<ColorPalette["text"]>) {
			customizations.colors = deepMerge(customizations.colors || ({} as any), {
				text: colors,
			});
			return this;
		},

		backgroundColors(colors: Partial<ColorPalette["background"]>) {
			customizations.colors = deepMerge(customizations.colors || ({} as any), {
				background: colors,
			});
			return this;
		},

		accentColors(colors: Partial<ColorPalette["accent"]>) {
			customizations.colors = deepMerge(customizations.colors || ({} as any), {
				accent: colors,
			});
			return this;
		},

		statusColors(colors: Partial<ColorPalette["status"]>) {
			customizations.colors = deepMerge(customizations.colors || ({} as any), {
				status: colors,
			});
			return this;
		},

		borderColors(colors: Partial<ColorPalette["border"]>) {
			customizations.colors = deepMerge(customizations.colors || ({} as any), {
				border: colors,
			});
			return this;
		},

		specialColors(colors: Partial<ColorPalette["special"]>) {
			customizations.colors = deepMerge(customizations.colors || ({} as any), {
				special: colors,
			});
			return this;
		},

		/**
		 * Customize component styles
		 */
		components(styles: Partial<ComponentStyles>) {
			customizations.components = deepMerge(customizations.components || ({} as any), styles);
			return this;
		},

		/**
		 * Customize specific component categories
		 */
		containerStyles(styles: Partial<ComponentStyles["container"]>) {
			customizations.components = deepMerge(customizations.components || ({} as any), {
				container: styles,
			});
			return this;
		},

		panelStyles(styles: Partial<ComponentStyles["panel"]>) {
			customizations.components = deepMerge(customizations.components || ({} as any), {
				panel: styles,
			});
			return this;
		},

		elevatedStyles(styles: Partial<ComponentStyles["elevated"]>) {
			customizations.components = deepMerge(customizations.components || ({} as any), {
				elevated: styles,
			});
			return this;
		},

		inputContainerStyles(styles: Partial<ComponentStyles["inputContainer"]>) {
			customizations.components = deepMerge(customizations.components || ({} as any), {
				inputContainer: styles,
			});
			return this;
		},

		messageBoxStyles(styles: Partial<ComponentStyles["messageBox"]>) {
			customizations.components = deepMerge(customizations.components || ({} as any), {
				messageBox: styles,
			});
			return this;
		},

		loadingBarStyles(styles: Partial<ComponentStyles["loadingBar"]>) {
			customizations.components = deepMerge(customizations.components || ({} as any), {
				loadingBar: styles,
			});
			return this;
		},

		scrollboxStyles(styles: Partial<ComponentStyles["scrollbox"]>) {
			customizations.components = deepMerge(customizations.components || ({} as any), {
				scrollbox: styles,
			});
			return this;
		},

		dropdownStyles(styles: Partial<ComponentStyles["dropdown"]>) {
			customizations.components = deepMerge(customizations.components || ({} as any), {
				dropdown: styles,
			});
			return this;
		},

		/**
		 * Build the final theme
		 */
		build(): Theme {
			return deepMerge(base, customizations);
		},
	};
}

/**
 * Create a theme from CSS-like color variables
 * Useful for integrating with CSS custom properties or design tokens
 */
export function createThemeFromVariables(variables: Record<string, string>): Partial<Theme> {
	const theme: Partial<Theme> = {
		colors: {} as any,
		components: {} as any,
	};

	// Map common CSS variable patterns to theme properties
	const colorMappings: Record<string, string> = {
		"--color-primary": "accent.primary",
		"--color-secondary": "accent.secondary",
		"--color-tertiary": "accent.tertiary",
		"--color-success": "status.success",
		"--color-warning": "status.warning",
		"--color-error": "status.error",
		"--color-info": "status.info",
		"--color-text-primary": "text.primary",
		"--color-text-secondary": "text.secondary",
		"--color-text-muted": "text.muted",
		"--color-background-main": "background.main",
		"--color-background-panel": "background.panel",
		"--color-background-elevated": "background.elevated",
		"--color-border-default": "border.default",
		"--color-border-focus": "border.focus",
	};

	for (const [variable, value] of Object.entries(variables)) {
		const mapping = colorMappings[variable];
		if (mapping) {
			const parts = mapping.split(".");
			const category = parts[0];
			const property = parts[1];

			if (theme.colors && category && property) {
				(theme.colors as any)[category] = {
					...((theme.colors as any)[category] || {}),
					[property]: value,
				};
			}
		}
	}

	return theme;
}

/**
 * Validate a theme object and provide fallbacks for missing properties
 */
export function validateTheme(theme: Partial<Theme>): Theme {
	const defaultTheme = defaultThemes.dark;

	return {
		name: theme.name || defaultTheme.name,
		description: theme.description || defaultTheme.description,
		colors: deepMerge(defaultTheme.colors, theme.colors || ({} as any)),
		components: deepMerge(defaultTheme.components, theme.components || ({} as any)),
	};
}

/**
 * Parse a color string (hex with or without alpha) and convert to RGBA for OpenTUI
 * Supports formats: #RGB, #RRGGBB, #RRGGBBAA
 */
export function parseColor(color: string): RGBA {
	// Remove # prefix if present
	const hex = color.startsWith("#") ? color.slice(1) : color;

	let r = 0;
	let g = 0;
	let b = 0;
	let a = 255;

	if (hex.length === 3) {
		// #RGB format
		r = Number.parseInt(hex[0] + hex[0]!, 16);
		g = Number.parseInt(hex[1] + hex[1]!, 16);
		b = Number.parseInt(hex[2] + hex[2]!, 16);
	} else if (hex.length === 6) {
		// #RRGGBB format
		r = Number.parseInt(hex.slice(0, 2), 16);
		g = Number.parseInt(hex.slice(2, 4), 16);
		b = Number.parseInt(hex.slice(4, 6), 16);
	} else if (hex.length === 8) {
		// #RRGGBBAA format
		r = Number.parseInt(hex.slice(0, 2), 16);
		g = Number.parseInt(hex.slice(2, 4), 16);
		b = Number.parseInt(hex.slice(4, 6), 16);
		a = Number.parseInt(hex.slice(6, 8), 16);
	} else {
		// Invalid format, return transparent black
		return RGBA.fromInts(0, 0, 0, 0);
	}

	return RGBA.fromInts(r, g, b, a);
}
