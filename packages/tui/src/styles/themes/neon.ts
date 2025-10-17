import type { Theme } from "../types";

export const neonTheme: Theme = {
	name: "Neon",
	description: "Vibrant neon-inspired theme",
	colors: {
		text: {
			primary: "#E0E0E0",
			secondary: "#909090",
			muted: "#606060",
			dim: "#404040",
			inverse: "#0A0A0A",
		},
		background: {
			main: "#0A0A0A",
			panel: "#141414",
			elevated: "#1A1A1A",
			highlight: "#1F1F1F",
			input: "#0F0F0F",
			overlay: "#0A0A0ACC",
		},
		accent: {
			primary: "#00D9FF",
			secondary: "#7B61FF",
			tertiary: "#FF006E",
		},
		status: {
			success: "#00FF88",
			warning: "#FFB800",
			error: "#FF3B5C",
			info: "#00D9FF",
		},
		border: {
			default: "#252525",
			focus: "#00D9FF",
			muted: "#1A1A1A",
			bright: "#404040",
		},
		special: {
			transparent: "transparent",
			selection: "#00D9FF",
			hover: "#1F1F1F",
			active: "#00D9FF",
		},
		diff: {
			added: "#00FF88",
			removed: "#FF3B5C",
			unchanged: "#E0E0E0",
			addedLineNumber: "#001A14",
			removedLineNumber: "#1A0A0A",
			lineNumber: "#0F0F0F",
			lineNumberBright: "#E0E0E0",
			lineNumberDim: "#606060",
		},
	},
	components: {
		container: {
			backgroundColor: "#0A0A0A",
			padding: 2,
			gap: 2,
		},
		panel: {
			backgroundColor: "#141414",
			border: true,
			borderStyle: "rounded",
			padding: 2,
		},
		elevated: {
			backgroundColor: "#1A1A1A",
			border: true,
			borderStyle: "rounded",
			padding: 2,
		},
		inputContainer: {
			border: true,
			borderStyle: "rounded",
			height: 3,
			backgroundColor: "#0F0F0F",
		},
		messageBox: {
			success: {
				backgroundColor: "#001A14",
				border: true,
				borderStyle: "rounded",
				padding: 1,
			},
			error: {
				backgroundColor: "#1A0A0A",
				border: true,
				borderStyle: "rounded",
				padding: 1,
			},
			warning: {
				backgroundColor: "#1A1400",
				border: true,
				borderStyle: "rounded",
				padding: 1,
			},
			info: {
				backgroundColor: "#001A1F",
				border: true,
				borderStyle: "rounded",
				padding: 1,
			},
		},
		loadingBar: {
			title: "#606060",
			bar: "#404040",
			wave: [
				"#404040",
				"#404040",
				"#505050",
				"#505050",
				"#606060",
				"#606060",
				"#707070",
				"#707070",
				"#808080",
				"#808080",
				"#909090",
				"#909090",
				"#A0A0A0",
				"#A0A0A0",
				"#909090",
				"#909090",
				"#808080",
				"#808080",
				"#707070",
				"#707070",
				"#606060",
				"#606060",
				"#505050",
				"#505050",
				"#404040",
				"#404040",
			],
			background: "#404040",
		},
		scrollbox: {
			root: {
				backgroundColor: "#0A0A0A",
			},
			scrollbar: {
				track: {
					foregroundColor: "#00D9FF",
					backgroundColor: "#252525",
				},
			},
		},
		dropdown: {
			container: {
				backgroundColor: "#141414",
				border: true,
				borderStyle: "rounded",
			},
			item: {
				backgroundColor: "transparent",
				hoverBackgroundColor: "#1F1F1F",
				activeBackgroundColor: "#00D9FF",
				selectedBackgroundColor: "#00D9FF",
			},
			text: {
				default: "#E0E0E0",
				hover: "#E0E0E0",
				active: "#0A0A0A",
				selected: "#0A0A0A",
			},
		},
		dialog: {
			backdrop: "#0A0A0ACC",
			container: {
				backgroundColor: "#141414",
				borderColor: "#252525",
			},
		},
		list: {
			searchBar: {
				backgroundColor: "#141414",
				cursorColor: "#00D9FF",
				textColor: "#606060",
			},
			item: {
				backgroundColor: "#0A0A0A",
				hoverBackgroundColor: "#1F1F1F",
				activeBackgroundColor: "#00D9FF",
				textColor: "#E0E0E0",
				subtextColor: "#606060",
			},
			section: {
				titleColor: "#7B61FF",
			},
			footer: {
				shortcutKeyColor: "#E0E0E0",
				shortcutTextColor: "#606060",
			},
			detail: {
				borderColor: "#252525",
				backgroundColor: "#141414",
			},
		},
		card: {
			backgroundColor: "#141414",
			borderColor: "#252525",
			border: true,
			borderStyle: "rounded",
			padding: 2,
		},
		button: {
			default: {
				backgroundColor: "#141414",
				textColor: "#E0E0E0",
				hoverBackgroundColor: "#1F1F1F",
				activeBackgroundColor: "#00D9FF",
			},
			primary: {
				backgroundColor: "#00D9FF",
				textColor: "#0A0A0A",
				hoverBackgroundColor: "#00E5FF",
				activeBackgroundColor: "#00BFE5",
			},
			secondary: {
				backgroundColor: "#7B61FF",
				textColor: "#0A0A0A",
				hoverBackgroundColor: "#8B71FF",
				activeBackgroundColor: "#6B51E5",
			},
			ghost: {
				backgroundColor: "transparent",
				textColor: "#E0E0E0",
				hoverBackgroundColor: "#1F1F1F",
				activeBackgroundColor: "#00D9FF",
			},
			padding: 1,
			border: true,
		},
		input: {
			backgroundColor: "#0F0F0F",
			textColor: "#E0E0E0",
			cursorColor: "#00D9FF",
			placeholderColor: "#404040",
			borderColor: "#252525",
			focusBorderColor: "#00D9FF",
			border: true,
			borderStyle: "rounded",
			padding: 1,
		},
		checkbox: {
			boxColor: "#252525",
			checkedColor: "#00FF88",
			uncheckedColor: "#404040",
			labelColor: "#E0E0E0",
			focusBorderColor: "#00D9FF",
		},
		switch: {
			onBackgroundColor: "#00FF88",
			offBackgroundColor: "#252525",
			thumbColor: "#E0E0E0",
			focusBorderColor: "#00D9FF",
		},
		tabs: {
			container: {
				backgroundColor: "#0A0A0A",
				borderColor: "#252525",
			},
			tab: {
				backgroundColor: "#141414",
				activeBackgroundColor: "#00D9FF",
				hoverBackgroundColor: "#1F1F1F",
				textColor: "#E0E0E0",
				activeTextColor: "#0A0A0A",
			},
			content: {
				backgroundColor: "#141414",
				padding: 2,
			},
		},
		slider: {
			track: {
				backgroundColor: "#252525",
				filledColor: "#00D9FF",
			},
			thumb: {
				color: "#00D9FF",
				focusColor: "#7B61FF",
			},
			label: {
				textColor: "#E0E0E0",
			},
		},
		kbd: {
			backgroundColor: "#141414",
			textColor: "#E0E0E0",
			borderColor: "#404040",
			border: true,
			borderStyle: "rounded",
		},
		separator: {
			color: "#252525",
			horizontalChar: "─",
			verticalChar: "│",
		},
		accordion: {
			header: {
				backgroundColor: "#141414",
				textColor: "#E0E0E0",
				focusBackgroundColor: "#00D9FF",
				focusTextColor: "#0A0A0A",
			},
			icon: {
				color: "#00D9FF",
			},
			content: {
				backgroundColor: "transparent",
				paddingLeft: 2,
			},
		},
		fileTree: {
			container: {
				backgroundColor: "#0A0A0A",
				border: true,
				borderStyle: "rounded",
			},
			item: {
				backgroundColor: "transparent",
				textColor: "#E0E0E0",
				selectedBackgroundColor: "#1F1F1F",
				selectedTextColor: "#E0E0E0",
				focusBackgroundColor: "#00D9FF",
				focusTextColor: "#0A0A0A",
			},
			icon: {
				fileColor: "#7B61FF",
				folderColor: "#00FF88",
			},
			chevron: {
				color: "#00D9FF",
			},
			emptyText: {
				color: "#404040",
				message: "No files to display",
			},
		},
	},
};
