import type { Theme } from "../types";

export const darkTheme: Theme = {
	name: "Dark",
	description: "Default dark theme with high contrast",
	colors: {
		text: {
			primary: "#FFFFFF",
			secondary: "#CCCCCC",
			muted: "#999999",
			dim: "#666666",
			inverse: "#000000",
		},
		background: {
			main: "#000000",
			panel: "#1E1E1E",
			elevated: "#2A2A2A",
			highlight: "#333333",
			input: "#1A1A1A",
			overlay: "#000000CC",
		},
		accent: {
			primary: "#0080FF",
			secondary: "#00FF80",
			tertiary: "#FF8000",
		},
		status: {
			success: "#00FF80",
			warning: "#FF8000",
			error: "#FF0000",
			info: "#0080FF",
		},
		border: {
			default: "#333333",
			focus: "#0080FF",
			muted: "#1A1A1A",
			bright: "#555555",
		},
		special: {
			transparent: "transparent",
			selection: "#0080FF",
			hover: "#333333",
			active: "#0080FF",
		},
		diff: {
			added: "#00FF80",
			removed: "#FF0000",
			unchanged: "#FFFFFF",
			addedLineNumber: "#001A0A",
			removedLineNumber: "#1A0A0A",
			lineNumber: "#0F0F0F",
			lineNumberBright: "#FFFFFF",
			lineNumberDim: "#666666",
		},
	},
	components: {
		container: {
			backgroundColor: "#000000",
			padding: 2,
			gap: 2,
		},
		panel: {
			backgroundColor: "#1E1E1E",
			border: true,
			borderStyle: "single",
			padding: 2,
		},
		elevated: {
			backgroundColor: "#2A2A2A",
			border: true,
			borderStyle: "single",
			padding: 2,
		},
		inputContainer: {
			border: true,
			borderStyle: "single",
			height: 3,
			backgroundColor: "#1A1A1A",
		},
		messageBox: {
			success: {
				backgroundColor: "#001A14",
				border: true,
				borderStyle: "single",
				padding: 1,
			},
			error: {
				backgroundColor: "#1A0A0A",
				border: true,
				borderStyle: "single",
				padding: 1,
			},
			warning: {
				backgroundColor: "#1A1400",
				border: true,
				borderStyle: "single",
				padding: 1,
			},
			info: {
				backgroundColor: "#001A1F",
				border: true,
				borderStyle: "single",
				padding: 1,
			},
		},
		loadingBar: {
			title: "#999999",
			bar: "#626262",
			wave: [
				"#585858",
				"#585858",
				"#6c6c6c",
				"#6c6c6c",
				"#808080",
				"#808080",
				"#949494",
				"#949494",
				"#a8a8a8",
				"#a8a8a8",
				"#bcbcbc",
				"#bcbcbc",
				"#d0d0d0",
				"#d0d0d0",
				"#bcbcbc",
				"#bcbcbc",
				"#a8a8a8",
				"#a8a8a8",
				"#949494",
				"#949494",
				"#808080",
				"#808080",
				"#6c6c6c",
				"#6c6c6c",
				"#585858",
				"#585858",
			],
			background: "#626262",
		},
		scrollbox: {
			root: {
				backgroundColor: "#1a1b26",
			},
			scrollbar: {
				track: {
					foregroundColor: "#7aa2f7",
					backgroundColor: "#414868",
				},
			},
		},
		dropdown: {
			container: {
				backgroundColor: "#1E1E1E",
				border: true,
				borderStyle: "single",
			},
			item: {
				backgroundColor: "transparent",
				hoverBackgroundColor: "#333333",
				activeBackgroundColor: "#0080FF",
				selectedBackgroundColor: "#0080FF",
			},
			text: {
				default: "#FFFFFF",
				hover: "#FFFFFF",
				active: "#000000",
				selected: "#000000",
			},
		},
		dialog: {
			backdrop: "#000000CC",
			container: {
				backgroundColor: "#1E1E1E",
				borderColor: "#333333",
			},
		},
		list: {
			searchBar: {
				backgroundColor: "#1E1E1E",
				cursorColor: "#0080FF",
				textColor: "#999999",
			},
			item: {
				backgroundColor: "#000000",
				hoverBackgroundColor: "#333333",
				activeBackgroundColor: "#0080FF",
				textColor: "#FFFFFF",
				subtextColor: "#999999",
			},
			section: {
				titleColor: "#00FF80",
			},
			footer: {
				shortcutKeyColor: "#FFFFFF",
				shortcutTextColor: "#999999",
			},
			detail: {
				borderColor: "#333333",
				backgroundColor: "#1E1E1E",
			},
		},
		card: {
			backgroundColor: "#1E1E1E",
			borderColor: "#333333",
			border: true,
			borderStyle: "single",
			padding: 2,
		},
		button: {
			default: {
				backgroundColor: "#1E1E1E",
				textColor: "#FFFFFF",
				hoverBackgroundColor: "#333333",
				activeBackgroundColor: "#0080FF",
			},
			primary: {
				backgroundColor: "#0080FF",
				textColor: "#000000",
				hoverBackgroundColor: "#0099FF",
				activeBackgroundColor: "#0066CC",
			},
			secondary: {
				backgroundColor: "#00FF80",
				textColor: "#000000",
				hoverBackgroundColor: "#00FF99",
				activeBackgroundColor: "#00CC66",
			},
			ghost: {
				backgroundColor: "transparent",
				textColor: "#FFFFFF",
				hoverBackgroundColor: "#333333",
				activeBackgroundColor: "#0080FF",
			},
			padding: 1,
			border: true,
		},
		input: {
			backgroundColor: "#1A1A1A",
			textColor: "#FFFFFF",
			cursorColor: "#0080FF",
			placeholderColor: "#666666",
			borderColor: "#333333",
			focusBorderColor: "#0080FF",
			border: true,
			borderStyle: "single",
			padding: 1,
		},
		checkbox: {
			boxColor: "#333333",
			checkedColor: "#00FF80",
			uncheckedColor: "#666666",
			labelColor: "#FFFFFF",
			focusBorderColor: "#0080FF",
		},
		switch: {
			onBackgroundColor: "#00FF80",
			offBackgroundColor: "#333333",
			thumbColor: "#FFFFFF",
			focusBorderColor: "#0080FF",
		},
		tabs: {
			container: {
				backgroundColor: "#000000",
				borderColor: "#333333",
			},
			tab: {
				backgroundColor: "#1E1E1E",
				activeBackgroundColor: "#0080FF",
				hoverBackgroundColor: "#333333",
				textColor: "#FFFFFF",
				activeTextColor: "#000000",
			},
			content: {
				backgroundColor: "#1E1E1E",
				padding: 2,
			},
		},
		slider: {
			track: {
				backgroundColor: "#333333",
				filledColor: "#0080FF",
			},
			thumb: {
				color: "#0080FF",
				focusColor: "#00FF80",
			},
			label: {
				textColor: "#FFFFFF",
			},
		},
		kbd: {
			backgroundColor: "#1E1E1E",
			textColor: "#FFFFFF",
			borderColor: "#555555",
			border: true,
			borderStyle: "rounded",
		},
		separator: {
			color: "#333333",
			horizontalChar: "─",
			verticalChar: "│",
		},
		accordion: {
			header: {
				backgroundColor: "#1E1E1E",
				textColor: "#FFFFFF",
				focusBackgroundColor: "#0080FF",
				focusTextColor: "#000000",
			},
			icon: {
				color: "#0080FF",
			},
			content: {
				backgroundColor: "transparent",
				paddingLeft: 2,
			},
		},
		fileTree: {
			container: {
				backgroundColor: "#000000",
				border: true,
				borderStyle: "single",
			},
			item: {
				backgroundColor: "transparent",
				textColor: "#FFFFFF",
				selectedBackgroundColor: "#333333",
				selectedTextColor: "#FFFFFF",
				focusBackgroundColor: "#0080FF",
				focusTextColor: "#000000",
			},
			icon: {
				fileColor: "#CCCCCC",
				folderColor: "#00FF80",
			},
			chevron: {
				color: "#0080FF",
			},
			emptyText: {
				color: "#666666",
				message: "No files to display",
			},
		},
	},
};
