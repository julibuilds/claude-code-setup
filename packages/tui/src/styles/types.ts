// ============================================================================
// Theme System Core Types
// ============================================================================

export interface ColorPalette {
	// Text colors
	text: {
		primary: string;
		secondary: string;
		muted: string;
		dim: string;
		inverse: string;
	};

	// Background colors
	background: {
		main: string;
		panel: string;
		elevated: string;
		highlight: string;
		input: string;
		overlay: string;
	};

	// Accent colors
	accent: {
		primary: string;
		secondary: string;
		tertiary: string;
	};

	// Semantic colors
	status: {
		success: string;
		warning: string;
		error: string;
		info: string;
	};

	// Border colors
	border: {
		default: string;
		focus: string;
		muted: string;
		bright: string;
	};

	// Special colors
	special: {
		transparent: string;
		selection: string;
		hover: string;
		active: string;
	};

	// Diff colors
	diff: {
		added: string;
		removed: string;
		unchanged: string;
		addedLineNumber: string;
		removedLineNumber: string;
		lineNumber: string;
		lineNumberBright: string;
		lineNumberDim: string;
	};
}

export interface ComponentStyles {
	// Container styles
	container: {
		backgroundColor: string;
		padding: number;
		gap: number;
	};

	panel: {
		backgroundColor: string;
		border: boolean;
		borderStyle: "single" | "double" | "rounded" | "heavy";
		padding: number;
	};

	elevated: {
		backgroundColor: string;
		border: boolean;
		borderStyle: "single" | "double" | "rounded" | "heavy";
		padding: number;
	};

	inputContainer: {
		border: boolean;
		borderStyle: "single" | "double" | "rounded" | "heavy";
		height: number;
		backgroundColor: string;
	};

	// Message box styles
	messageBox: {
		success: {
			backgroundColor: string;
			border: boolean;
			borderStyle: "single" | "double" | "rounded" | "heavy";
			padding: number;
		};
		error: {
			backgroundColor: string;
			border: boolean;
			borderStyle: "single" | "double" | "rounded" | "heavy";
			padding: number;
		};
		warning: {
			backgroundColor: string;
			border: boolean;
			borderStyle: "single" | "double" | "rounded" | "heavy";
			padding: number;
		};
		info: {
			backgroundColor: string;
			border: boolean;
			borderStyle: "single" | "double" | "rounded" | "heavy";
			padding: number;
		};
	};

	// Loading bar styles
	loadingBar: {
		title: string;
		bar: string;
		wave: string[];
		background: string;
	};

	// Scrollbox styles
	scrollbox: {
		root: {
			backgroundColor: string;
		};
		scrollbar: {
			track: {
				foregroundColor: string;
				backgroundColor: string;
			};
		};
	};

	// Dropdown styles
	dropdown: {
		container: {
			backgroundColor: string;
			border: boolean;
			borderStyle: "single" | "double" | "rounded" | "heavy";
		};
		item: {
			backgroundColor: string;
			hoverBackgroundColor: string;
			activeBackgroundColor: string;
			selectedBackgroundColor: string;
		};
		text: {
			default: string;
			hover: string;
			active: string;
			selected: string;
		};
	};

	// Dialog styles
	dialog: {
		backdrop: string;
		container: {
			backgroundColor: string;
			borderColor: string;
		};
	};

	// List styles
	list: {
		searchBar: {
			backgroundColor: string;
			cursorColor: string;
			textColor: string;
		};
		item: {
			backgroundColor: string;
			hoverBackgroundColor: string;
			activeBackgroundColor: string;
			textColor: string;
			subtextColor: string;
		};
		section: {
			titleColor: string;
		};
		footer: {
			shortcutKeyColor: string;
			shortcutTextColor: string;
		};
		detail: {
			borderColor: string;
			backgroundColor: string;
		};
	};

	// Card styles
	card: {
		backgroundColor: string;
		borderColor: string;
		border: boolean;
		borderStyle: "single" | "double" | "rounded" | "heavy";
		padding: number;
	};

	// Button styles
	button: {
		default: {
			backgroundColor: string;
			textColor: string;
			hoverBackgroundColor: string;
			activeBackgroundColor: string;
		};
		primary: {
			backgroundColor: string;
			textColor: string;
			hoverBackgroundColor: string;
			activeBackgroundColor: string;
		};
		secondary: {
			backgroundColor: string;
			textColor: string;
			hoverBackgroundColor: string;
			activeBackgroundColor: string;
		};
		ghost: {
			backgroundColor: string;
			textColor: string;
			hoverBackgroundColor: string;
			activeBackgroundColor: string;
		};
		padding: number;
		border: boolean;
		pressEffect: {
			enabled: boolean;
			character: string;
			color: string;
			duration: number;
		};
		hover: {
			brightenFactor: number;
		};
	};

	// Input styles
	input: {
		backgroundColor: string;
		textColor: string;
		cursorColor: string;
		placeholderColor: string;
		borderColor: string;
		focusBorderColor: string;
		border: boolean;
		borderStyle: "single" | "double" | "rounded" | "heavy";
		padding: number;
	};

	// Checkbox styles
	checkbox: {
		boxColor: string;
		checkedColor: string;
		uncheckedColor: string;
		labelColor: string;
		focusBorderColor: string;
	};

	// Switch styles
	switch: {
		onBackgroundColor: string;
		offBackgroundColor: string;
		thumbColor: string;
		focusBorderColor: string;
	};

	// Tabs styles
	tabs: {
		container: {
			backgroundColor: string;
			borderColor: string;
		};
		tab: {
			backgroundColor: string;
			activeBackgroundColor: string;
			hoverBackgroundColor: string;
			textColor: string;
			activeTextColor: string;
		};
		content: {
			backgroundColor: string;
			padding: number;
		};
	};

	// Slider styles
	slider: {
		track: {
			backgroundColor: string;
			filledColor: string;
		};
		thumb: {
			color: string;
			focusColor: string;
		};
		label: {
			textColor: string;
		};
		vertical: {
			width: number;
			indicatorPosition: "left" | "right";
		};
		animation: {
			speed: number;
			smoothing: number;
		};
		progress: {
			char: string;
			emptyChar: string;
		};
	};

	// Kbd/Command styles
	kbd: {
		backgroundColor: string;
		textColor: string;
		borderColor: string;
		border: boolean;
		borderStyle: "single" | "double" | "rounded" | "heavy";
	};

	// Separator styles
	separator: {
		color: string;
		horizontalChar: string;
		verticalChar: string;
	};

	// Accordion styles
	accordion: {
		header: {
			backgroundColor: string;
			textColor: string;
			focusBackgroundColor: string;
			focusTextColor: string;
		};
		icon: {
			color: string;
		};
		content: {
			backgroundColor: string;
			paddingLeft: number;
		};
	};

	// FileTree styles
	fileTree: {
		container: {
			backgroundColor: string;
			border: boolean;
			borderStyle: "single" | "double" | "rounded" | "heavy";
		};
		item: {
			backgroundColor: string;
			textColor: string;
			selectedBackgroundColor: string;
			selectedTextColor: string;
			focusBackgroundColor: string;
			focusTextColor: string;
		};
		icon: {
			fileColor: string;
			folderColor: string;
		};
		chevron: {
			color: string;
		};
		emptyText: {
			color: string;
			message: string;
		};
	};

	// Draggable component
	draggable: {
		dragOpacity: number;
		dragBorderColor: string;
		activeBorderColor: string;
		hoverBorderColor: string;
		boundaryColor: string;
	};

	// Mouse trail effects
	mouseTrail: {
		enabled: boolean;
		trailColor: string;
		dragColor: string;
		activatedColor: string;
		fadeDuration: number;
	};

	// Animation defaults
	animation: {
		defaultDuration: number;
		defaultEasing: string;
		enableReducedMotion: boolean;
	};

	// Stats/Dashboard
	stats: {
		labelColor: string;
		valueColor: string;
		warningColor: string;
		criticalColor: string;
		successColor: string;
		progressChar: string;
		emptyChar: string;
	};

	// Selection
	selection: {
		backgroundColor: string;
		textColor: string;
		borderColor: string;
		cursor: string;
	};

	// Charts
	chart: {
		lineChart: {
			primaryColor: string;
			secondaryColor: string;
			tertiaryColor: string;
			glowEnabled: boolean;
			filledOpacity: number;
		};
		gauge: {
			successColor: string;
			warningColor: string;
			errorColor: string;
			backgroundColor: string;
		};
	};

	// Layout components
	splitPane: {
		divider: {
			color: string;
			char: string;
			hoverColor: string;
			activeColor: string;
		};
		pane: {
			backgroundColor: string;
			padding: number;
		};
		resize: {
			enabled: boolean;
			minSize: number;
		};
	};

	appLayout: {
		header: {
			backgroundColor: string;
			borderColor: string;
			height: number;
			padding: number;
		};
		sidebar: {
			backgroundColor: string;
			borderColor: string;
			width: number;
			padding: number;
		};
		content: {
			backgroundColor: string;
			padding: number;
		};
		footer: {
			backgroundColor: string;
			borderColor: string;
			height: number;
			padding: number;
		};
	};
}

export interface Theme {
	colors: ColorPalette;
	components: ComponentStyles;
	name: string;
	description?: string;
}

export interface ThemeContextValue {
	theme: Theme;
	setTheme: (theme: Theme | ((prev: Theme) => Theme)) => void;
	updateColors: (colors: Partial<ColorPalette>) => void;
	updateComponentStyles: (styles: Partial<ComponentStyles>) => void;
	resetToDefault: () => void;
	/**
	 * Apply a complete theme override
	 */
	applyTheme: (newTheme: Theme | Partial<Theme>) => void;
	/**
	 * Merge additional customizations into the current theme
	 */
	mergeCustomizations: (customizations: Partial<Theme>) => void;
}
