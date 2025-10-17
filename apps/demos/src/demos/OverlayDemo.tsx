import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useThemeColors } from "@repo/tui";
import { useState } from "react";

export function OverlayDemo() {
	const colors = useThemeColors();
	const [showOverlay, setShowOverlay] = useState(false);

	useKeyboard((key) => {
		if (key.name === "space") {
			setShowOverlay(!showOverlay);
		}
	});

	return (
		<box flexGrow={1} style={{ padding: 2 }}>
			<box alignItems="center" style={{ paddingBottom: 2 }}>
				<ascii-font font="tiny" text="Overlay Primitive" />
			</box>

			<box style={{ paddingTop: 1, paddingBottom: 2 }}>
				<text fg={colors.text.muted}>Press Space to toggle overlay</text>
			</box>

			<box border style={{ padding: 2, flexGrow: 1 }}>
				<text fg={colors.text.primary}>Base Content Layer</text>
				<text fg={colors.text.muted}>This is the main content underneath</text>
			</box>

			{showOverlay && (
				<box
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: colors.background.overlay,
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<box
						border
						borderStyle="double"
						style={{ padding: 3, backgroundColor: colors.background.main }}
					>
						<text fg={colors.accent.primary} attributes={TextAttributes.BOLD}>
							Overlay Content
						</text>
						<box style={{ paddingTop: 1 }}>
							<text fg={colors.text.primary}>This appears on top of everything</text>
							<text fg={colors.text.muted}>Press Space to close</text>
						</box>
					</box>
				</box>
			)}
		</box>
	);
}
