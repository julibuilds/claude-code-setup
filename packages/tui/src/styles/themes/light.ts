import type { Theme } from "../types";

export const lightTheme: Theme = {
	name: "Light",
	description: "Clean light theme",
	colors: {
		text: {
			primary: "#000000",
			secondary: "#333333",
			muted: "#666666",
			dim: "#999999",
			inverse: "#FFFFFF",
		},
		background: {
			main: "#FFFFFF",
			panel: "#F5F5F5",
			elevated: "#EEEEEE",
			highlight: "#E0E0E0",
			input: "#FAFAFA",
			overlay: "#FFFFFFCC",
		},
		accent: {
			primary: "#0066CC",
			secondary: "#00AA44",
			tertiary: "#CC6600",
		},
		status: {
			success: "#00AA44",
			warning: "#CC6600",
			error: "#CC0000",
			info: "#0066CC",
		},
		border: {
			default: "#CCCCCC",
			focus: "#0066CC",
			muted: "#E0E0E0",
			bright: "#999999",
		},
		special: {
			transparent: "transparent",
			selection: "#0066CC",
			hover: "#E0E0E0",
			active: "#0066CC",
		},
		diff: {
			added: "#00AA44",
			removed: "#CC0000",
			unchanged: "#000000",
			addedLineNumber: "#F0F8F0",
			removedLineNumber: "#F8F0F0",
			lineNumber: "#F5F5F5",
			lineNumberBright: "#000000",
			lineNumberDim: "#999999",
		},
	},
	components: {
		container: {
			backgroundColor: "#FFFFFF",
			padding: 2,
			gap: 2,
		},
		panel: {
			backgroundColor: "#F5F5F5",
			border: true,
			borderStyle: "single",
			padding: 2,
		},
		elevated: {
			backgroundColor: "#EEEEEE",
			border: true,
			borderStyle: "single",
			padding: 2,
		},
		inputContainer: {
			border: true,
			borderStyle: "single",
			height: 3,
			backgroundColor: "#FAFAFA",
		},
		messageBox: {
			success: {
				backgroundColor: "#F0F8F0",
				border: true,
				borderStyle: "single",
				padding: 1,
			},
			error: {
				backgroundColor: "#F8F0F0",
				border: true,
				borderStyle: "single",
				padding: 1,
			},
			warning: {
				backgroundColor: "#F8F8F0",
				border: true,
				borderStyle: "single",
				padding: 1,
			},
			info: {
				backgroundColor: "#F0F0F8",
				border: true,
				borderStyle: "single",
				padding: 1,
			},
		},
		loadingBar: {
			title: "#666666",
			bar: "#CCCCCC",
			wave: [
				"#CCCCCC",
				"#CCCCCC",
				"#BBBBBB",
				"#BBBBBB",
				"#AAAAAA",
				"#AAAAAA",
				"#999999",
				"#999999",
				"#888888",
				"#888888",
				"#777777",
				"#777777",
				"#666666",
				"#666666",
				"#777777",
				"#777777",
				"#888888",
				"#888888",
				"#999999",
				"#999999",
				"#AAAAAA",
				"#AAAAAA",
				"#BBBBBB",
				"#BBBBBB",
				"#CCCCCC",
				"#CCCCCC",
			],
			background: "#CCCCCC",
		},
		scrollbox: {
			root: {
				backgroundColor: "#FFFFFF",
			},
			scrollbar: {
				track: {
					foregroundColor: "#0066CC",
					backgroundColor: "#E0E0E0",
				},
			},
		},
		dropdown: {
			container: {
				backgroundColor: "#F5F5F5",
				border: true,
				borderStyle: "single",
			},
			item: {
				backgroundColor: "transparent",
				hoverBackgroundColor: "#E0E0E0",
				activeBackgroundColor: "#0066CC",
				selectedBackgroundColor: "#0066CC",
			},
			text: {
				default: "#000000",
				hover: "#000000",
				active: "#FFFFFF",
				selected: "#FFFFFF",
			},
		},
		dialog: {
			backdrop: "#FFFFFFCC",
			container: {
				backgroundColor: "#F5F5F5",
				borderColor: "#CCCCCC",
			},
		},
		list: {
			searchBar: {
				backgroundColor: "#F5F5F5",
				cursorColor: "#0066CC",
				textColor: "#666666",
			},
			item: {
				backgroundColor: "#FFFFFF",
				hoverBackgroundColor: "#E0E0E0",
				activeBackgroundColor: "#0066CC",
				textColor: "#000000",
				subtextColor: "#666666",
			},
			section: {
				titleColor: "#00AA44",
			},
			footer: {
				shortcutKeyColor: "#000000",
				shortcutTextColor: "#666666",
			},
			detail: {
				borderColor: "#CCCCCC",
				backgroundColor: "#F5F5F5",
			},
		},
		card: {
			backgroundColor: "#F5F5F5",
			borderColor: "#CCCCCC",
			border: true,
			borderStyle: "single",
			padding: 2,
		},
		button: {
			default: {
				backgroundColor: "#F5F5F5",
				textColor: "#000000",
				hoverBackgroundColor: "#E0E0E0",
				activeBackgroundColor: "#0066CC",
			},
			primary: {
				backgroundColor: "#0066CC",
				textColor: "#FFFFFF",
				hoverBackgroundColor: "#0077DD",
				activeBackgroundColor: "#0055AA",
			},
			secondary: {
				backgroundColor: "#00AA44",
				textColor: "#FFFFFF",
				hoverBackgroundColor: "#00BB55",
				activeBackgroundColor: "#009933",
			},
			ghost: {
				backgroundColor: "transparent",
				textColor: "#000000",
				hoverBackgroundColor: "#E0E0E0",
				activeBackgroundColor: "#0066CC",
			},
			padding: 1,
			border: true,
		},
		input: {
			backgroundColor: "#FAFAFA",
			textColor: "#000000",
			cursorColor: "#0066CC",
			placeholderColor: "#999999",
			borderColor: "#CCCCCC",
			focusBorderColor: "#0066CC",
			border: true,
			borderStyle: "single",
			padding: 1,
		},
		checkbox: {
			boxColor: "#CCCCCC",
			checkedColor: "#00AA44",
			uncheckedColor: "#999999",
			labelColor: "#000000",
			focusBorderColor: "#0066CC",
		},
		switch: {
			onBackgroundColor: "#00AA44",
			offBackgroundColor: "#CCCCCC",
			thumbColor: "#FFFFFF",
			focusBorderColor: "#0066CC",
		},
		tabs: {
			container: {
				backgroundColor: "#FFFFFF",
				borderColor: "#CCCCCC",
			},
			tab: {
				backgroundColor: "#F5F5F5",
				activeBackgroundColor: "#0066CC",
				hoverBackgroundColor: "#E0E0E0",
				textColor: "#000000",
				activeTextColor: "#FFFFFF",
			},
			content: {
				backgroundColor: "#F5F5F5",
				padding: 2,
			},
		},
		slider: {
			track: {
				backgroundColor: "#CCCCCC",
				filledColor: "#0066CC",
			},
			thumb: {
				color: "#0066CC",
				focusColor: "#00AA44",
			},
			label: {
				textColor: "#000000",
			},
		},
		kbd: {
			backgroundColor: "#F5F5F5",
			textColor: "#000000",
			borderColor: "#999999",
			border: true,
			borderStyle: "rounded",
		},
		separator: {
			color: "#CCCCCC",
			horizontalChar: "─",
			verticalChar: "│",
		},
		accordion: {
			header: {
				backgroundColor: "#F5F5F5",
				textColor: "#000000",
				focusBackgroundColor: "#0066CC",
				focusTextColor: "#FFFFFF",
			},
			icon: {
				color: "#0066CC",
			},
			content: {
				backgroundColor: "transparent",
				paddingLeft: 2,
			},
		},
		fileTree: {
			container: {
				backgroundColor: "#FFFFFF",
				border: true,
				borderStyle: "single",
			},
			item: {
				backgroundColor: "transparent",
				textColor: "#000000",
				selectedBackgroundColor: "#E0E0E0",
				selectedTextColor: "#000000",
				focusBackgroundColor: "#0066CC",
				focusTextColor: "#FFFFFF",
			},
			icon: {
				fileColor: "#666666",
				folderColor: "#00AA44",
			},
			chevron: {
				color: "#0066CC",
			},
			emptyText: {
				color: "#999999",
				message: "No files to display",
			},
		},
	},
};
