import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useThemeColors } from "@repo/tui";
import { useState } from "react";

export function NavigationDemo() {
	const colors = useThemeColors();
	const [selectedButton, setSelectedButton] = useState(0);
	const buttons = ["Primary", "Secondary", "Danger", "Success"];

	useKeyboard((key) => {
		if (key.name === "left") {
			setSelectedButton((prev) => (prev > 0 ? prev - 1 : buttons.length - 1));
		}
		if (key.name === "right") {
			setSelectedButton((prev) => (prev < buttons.length - 1 ? prev + 1 : 0));
		}
	});

	return (
		<box flexGrow={1} alignItems="center" justifyContent="center">
			<box style={{ padding: 2 }}>
				<ascii-font font="tiny" text="Navigation & Buttons" />

				<box style={{ paddingTop: 2, paddingBottom: 1 }}>
					<text fg={colors.text.muted}>Use arrow keys to navigate between buttons</text>
				</box>

				<box style={{ flexDirection: "row", gap: 2, paddingTop: 2 }}>
					{buttons.map((label, index) => (
						<box
							key={label}
							border
							borderStyle={selectedButton === index ? "double" : "single"}
							style={{
								padding: 1,
								backgroundColor: selectedButton === index ? colors.accent.primary : undefined,
							}}
						>
							<text
								fg={selectedButton === index ? colors.background.main : colors.text.primary}
								attributes={selectedButton === index ? TextAttributes.BOLD : undefined}
							>
								{label}
							</text>
						</box>
					))}
				</box>

				<box style={{ paddingTop: 3 }}>
					<text fg={colors.accent.secondary}>Selected: </text>
					<text fg={colors.text.primary}>{buttons[selectedButton]}</text>
				</box>
			</box>
		</box>
	);
}
