import { TextAttributes } from "@opentui/core";
import { useThemeColors } from "@repo/tui";

export function LayoutsDemo() {
	const colors = useThemeColors();

	return (
		<box flexGrow={1} style={{ padding: 2 }}>
			<box alignItems="center" style={{ paddingBottom: 2 }}>
				<ascii-font font="tiny" text="Layout Components" />
			</box>

			<box style={{ flexDirection: "row", gap: 2, flexGrow: 1 }}>
				{/* Left column */}
				<box style={{ flexDirection: "column", gap: 1, flexGrow: 1 }}>
					<box border title="Vertical Stack" style={{ padding: 1, flexGrow: 1 }}>
						<text fg={colors.text.primary}>Item 1</text>
						<text fg={colors.text.primary}>Item 2</text>
						<text fg={colors.text.primary}>Item 3</text>
					</box>

					<box border title="Horizontal Row" style={{ padding: 1 }}>
						<box style={{ flexDirection: "row", gap: 2 }}>
							<text fg={colors.accent.primary}>Col A</text>
							<text fg={colors.accent.secondary}>Col B</text>
							<text fg={colors.accent.primary}>Col C</text>
						</box>
					</box>
				</box>

				{/* Right column */}
				<box style={{ flexDirection: "column", gap: 1, flexGrow: 1 }}>
					<box border title="Grid Layout" style={{ padding: 1, flexGrow: 1 }}>
						<box style={{ flexDirection: "row", gap: 1 }}>
							<box border style={{ padding: 1, flexGrow: 1 }}>
								<text fg={colors.text.primary}>1</text>
							</box>
							<box border style={{ padding: 1, flexGrow: 1 }}>
								<text fg={colors.text.primary}>2</text>
							</box>
						</box>
						<box style={{ flexDirection: "row", gap: 1, paddingTop: 1 }}>
							<box border style={{ padding: 1, flexGrow: 1 }}>
								<text fg={colors.text.primary}>3</text>
							</box>
							<box border style={{ padding: 1, flexGrow: 1 }}>
								<text fg={colors.text.primary}>4</text>
							</box>
						</box>
					</box>

					<box
						border
						title="Centered"
						style={{ padding: 1, alignItems: "center", justifyContent: "center" }}
					>
						<text fg={colors.accent.secondary} attributes={TextAttributes.BOLD}>
							Centered Content
						</text>
					</box>
				</box>
			</box>
		</box>
	);
}
