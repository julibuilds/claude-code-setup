import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { defaultThemes, useTheme, useThemeColors } from "@repo/tui";
import { useState } from "react";

type ThemeName = keyof typeof defaultThemes;

export function ThemeDemo() {
	const colors = useThemeColors();
	const { setTheme } = useTheme();
	const [currentTheme, setCurrentTheme] = useState<ThemeName>("dark");

	const themes: ThemeName[] = ["dark", "light", "neon"];

	useKeyboard((key) => {
		if (key.name === "left" || key.name === "right") {
			const currentIndex = themes.indexOf(currentTheme);
			const nextIndex =
				key.name === "right"
					? (currentIndex + 1) % themes.length
					: (currentIndex - 1 + themes.length) % themes.length;
			const newTheme = themes[nextIndex];
			if (newTheme) {
				setCurrentTheme(newTheme);
				setTheme(defaultThemes[newTheme]);
			}
		}
	});

	return (
		<box flexGrow={1} alignItems="center" justifyContent="center">
			<box style={{ padding: 2 }}>
				<ascii-font font="tiny" text="Theme System" />

				<box style={{ paddingTop: 2, paddingBottom: 1 }}>
					<text fg={colors.text.muted}>Use arrow keys to switch themes</text>
				</box>

				<box style={{ flexDirection: "row", gap: 2, paddingTop: 2 }}>
					{themes.map((theme) => (
						<box
							key={theme}
							border
							borderStyle={currentTheme === theme ? "double" : "single"}
							style={{
								padding: 1,
								backgroundColor: currentTheme === theme ? colors.accent.primary : undefined,
							}}
						>
							<text
								fg={currentTheme === theme ? colors.background.main : colors.text.primary}
								attributes={currentTheme === theme ? TextAttributes.BOLD : undefined}
							>
								{theme.charAt(0).toUpperCase() + theme.slice(1)}
							</text>
						</box>
					))}
				</box>

				<box style={{ paddingTop: 3 }} border borderStyle="rounded">
					<box style={{ padding: 2 }}>
						<text fg={colors.text.primary} attributes={TextAttributes.BOLD}>
							Color Palette Preview
						</text>
						<box style={{ paddingTop: 1 }}>
							<text fg={colors.accent.primary}>Primary Accent</text>
							<text fg={colors.accent.secondary}>Secondary Accent</text>
							<text fg={colors.text.primary}>Primary Text</text>
							<text fg={colors.text.muted}>Muted Text</text>
						</box>
					</box>
				</box>
			</box>
		</box>
	);
}
