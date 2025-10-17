/**
 * Layout constants for consistent spacing and sizing
 */

export const SPACING = {
	xs: 0,
	sm: 1,
	md: 2,
	lg: 3,
	xl: 4,
} as const;

export const MIN_TERMINAL_SIZE = {
	width: 50,
	height: 20,
} as const;

export const BREAKPOINTS = {
	wide: 100,
	medium: 70,
	narrow: 50,
} as const;

export const PANEL_HEIGHTS = {
	header: 5,
	footer: 4,
	minContent: 10,
} as const;
