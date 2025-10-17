/**
 * Centralized design system and theme constants for Claude Code Router CLI
 * All color schemes, spacing, and styling patterns are defined here
 */

export const theme = {
	// Color palette - organized by semantic meaning
	colors: {
		// Background colors
		bg: {
			/** Darkest background, used for main content areas */
			dark: "#1a1b26",
			/** Medium background, used for secondary containers */
			mid: "#1f2335",
			/** Light background, used for hover states (rarely used) */
			light: "#28293a",
		},

		// Primary accent colors
		accent: {
			/** Primary action color - cyan for main interactions */
			cyan: "#00D9FF",
			/** Secondary accent - purple for alternative interactions */
			purple: "#bb9af7",
		},

		// Status colors
		success: "#9ece6a", // Green - for confirmations, success states
		warning: "#e0af68", // Yellow - for alerts, warnings
		error: "#f7768e", // Red - for errors, critical states
		info: "#7aa2f7", // Blue - for informational messages

		// Text colors
		text: {
			/** Primary text color, high contrast */
			primary: "#7aa2f7",
			/** Muted text, for secondary information */
			dim: "#565f89",
			/** Very dim text, for minimal visibility hints */
			veryDim: "#3b4261",
		},

		// Status-specific text colors
		statusText: {
			success: "#9ece6a",
			warning: "#e0af68",
			error: "#f7768e",
			info: "#7aa2f7",
		},
	},

	// Spacing scale - use for consistent spacing throughout the app
	spacing: {
		0: 0,
		1: 1,
		2: 2,
		3: 3,
		4: 4,
		6: 6,
		8: 8,
	},

	// Border and box styling
	borderStyles: {
		standard: {
			border: true,
			backgroundColor: "#1a1b26",
		},
		focused: {
			border: true,
			backgroundColor: "#1f2335",
		},
		secondary: {
			border: true,
			backgroundColor: "#28293a",
		},
	},

	// Reusable style objects for common patterns
	components: {
		// Header style - used for screen titles
		header: {
			marginBottom: 2,
			padding: 2,
			border: true,
			flexDirection: "column" as const,
			backgroundColor: "#1a1b26",
		},

		// Panel style - used for bordered sections
		panel: {
			border: true,
			backgroundColor: "#1f2335",
			padding: 2,
		},

		// Footer style - used for keyboard shortcuts
		footer: {
			marginTop: 2,
			padding: 2,
			border: true,
			flexDirection: "column" as const,
			backgroundColor: "#1a1b26",
		},

		// Select/Input container
		selectContainer: {
			border: true,
			backgroundColor: "#1f2335",
			flexDirection: "column" as const,
		},

		// Message/status box
		statusBox: {
			padding: 1,
			border: true,
			backgroundColor: "#1a1b26",
		},
	},

	// Text attributes for consistent typography
	textStyles: {
		bold: {
			attributes: 1, // TextAttributes.BOLD equivalent
		},
		dim: {
			attributes: 2, // TextAttributes.DIM equivalent
		},
	},
};

/**
 * Get color based on status type
 * @example
 * getStatusColor('success') // returns '#9ece6a'
 * getStatusColor('error') // returns '#f7768e'
 */
export function getStatusColor(
	status: "success" | "error" | "warning" | "info",
): string {
	return theme.colors[status];
}

/**
 * Get style object for a component type
 * @example
 * const headerStyle = getComponentStyle('header')
 */
export function getComponentStyle(
	component: keyof typeof theme.components,
): Record<string, unknown> {
	return theme.components[component];
}

/**
 * Apply spacing consistently
 * @example
 * style={{ margin: spacing(2) }}
 */
export function spacing(size: keyof typeof theme.spacing): number {
	return theme.spacing[size];
}

export default theme;
