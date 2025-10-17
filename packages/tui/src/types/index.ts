// Common types for TUI components

export interface SelectOption {
	name: string;
	description?: string;
	value: string;
}

export interface ThemeColors {
	primary: string;
	secondary: string;
	info: string;
	success: string;
	warning: string;
	error: string;
	muted: string;
	text: string;
	background: string;
	border: string;
}
