/**
 * Centralized design system and theme constants for Claude Code Router CLI
 * All color schemes, spacing, and styling patterns are defined here
 */

import type { BorderStyle } from "@opentui/core";

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
			borderStyle: "single" as BorderStyle,
			borderColor: "#565f89",
			backgroundColor: "#1a1b26",
		},
		focused: {
			border: true,
			borderStyle: "single" as BorderStyle,
			borderColor: "#00D9FF",
			backgroundColor: "#1f2335",
		},
		secondary: {
			border: true,
			borderStyle: "single" as BorderStyle,
			borderColor: "#3b4261",
			backgroundColor: "#28293a",
		},
		accent: {
			border: true,
			borderStyle: "rounded" as BorderStyle,
			borderColor: "#bb9af7",
			backgroundColor: "#1a1b26",
		},
		success: {
			border: true,
			borderStyle: "single" as BorderStyle,
			borderColor: "#9ece6a",
			backgroundColor: "#1a1b26",
		},
		warning: {
			border: true,
			borderStyle: "single" as BorderStyle,
			borderColor: "#e0af68",
			backgroundColor: "#1a1b26",
		},
		error: {
			border: true,
			borderStyle: "heavy" as BorderStyle,
			borderColor: "#f7768e",
			backgroundColor: "#1a1b26",
		},
	},

	// Reusable style objects for common patterns
	components: {
		// Header style - used for screen titles
		header: {
			marginBottom: 2,
			padding: 2,
			border: true,
			borderStyle: "rounded" as BorderStyle,
			borderColor: "#bb9af7",
			backgroundColor: "#1a1b26",
			flexDirection: "column" as const,
		},

		// Panel style - used for bordered sections
		panel: {
			border: true,
			borderStyle: "single" as BorderStyle,
			borderColor: "#565f89",
			backgroundColor: "#1a1b26",
			padding: 2,
			flexDirection: "column" as const,
		},

		// Focused panel style
		panelFocused: {
			border: true,
			borderStyle: "single" as BorderStyle,
			borderColor: "#00D9FF",
			backgroundColor: "#1f2335",
			padding: 2,
			flexDirection: "column" as const,
		},

		// Footer style - used for keyboard shortcuts
		footer: {
			marginTop: 2,
			padding: 2,
			border: true,
			borderStyle: "single" as BorderStyle,
			borderColor: "#3b4261",
			backgroundColor: "#28293a",
			flexDirection: "column" as const,
		},

		// Select/Input container
		selectContainer: {
			border: true,
			borderStyle: "single" as BorderStyle,
			borderColor: "#565f89",
			backgroundColor: "#1a1b26",
			flexDirection: "column" as const,
		},

		// Focused select container
		selectContainerFocused: {
			border: true,
			borderStyle: "single" as BorderStyle,
			borderColor: "#00D9FF",
			backgroundColor: "#1f2335",
			flexDirection: "column" as const,
		},

		// Message/status box
		statusBox: {
			padding: 2,
			border: true,
			borderStyle: "single" as BorderStyle,
			borderColor: "#565f89",
			backgroundColor: "#1a1b26",
			flexDirection: "column" as const,
		},

		// Success status box
		statusBoxSuccess: {
			padding: 2,
			border: true,
			borderStyle: "single" as BorderStyle,
			borderColor: "#9ece6a",
			backgroundColor: "#1a1b26",
			flexDirection: "column" as const,
		},

		// Warning status box
		statusBoxWarning: {
			padding: 2,
			border: true,
			borderStyle: "single" as BorderStyle,
			borderColor: "#e0af68",
			backgroundColor: "#1a1b26",
			flexDirection: "column" as const,
		},

		// Error status box
		statusBoxError: {
			padding: 2,
			border: true,
			borderStyle: "heavy" as BorderStyle,
			borderColor: "#f7768e",
			backgroundColor: "#1a1b26",
			flexDirection: "column" as const,
		},

		// Main menu container
		mainMenu: {
			border: true,
			borderStyle: "single" as BorderStyle,
			borderColor: "#565f89",
			backgroundColor: "#1a1b26",
			padding: 3,
			flexDirection: "column" as const,
			alignItems: "center" as const,
		},

		// Quick config container
		quickConfig: {
			border: true,
			borderStyle: "single" as BorderStyle,
			borderColor: "#565f89",
			backgroundColor: "#1a1b26",
			padding: 2,
			flexDirection: "column" as const,
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

	// Animation configuration
	animation: {
		durations: {
			fast: 150,
			normal: 300,
			slow: 500,
			verySlow: 1000,
		},
		easing: {
			linear: "linear",
			inOutQuad: "inOutQuad",
			inOutSine: "inOutSine",
			inExpo: "inExpo",
			outExpo: "outExpo",
			inOutCubic: "inOutCubic",
		},
		frameRate: 60, // Target FPS for animations
	},

	// Focus and interaction states
	focus: {
		border: "#00D9FF",
		text: "#FFFFFF",
		backgroundColor: "#1f2335",
	},

	// Layout configuration
	layout: {
		gap: 2,
		padding: 2,
		margin: 1,
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
