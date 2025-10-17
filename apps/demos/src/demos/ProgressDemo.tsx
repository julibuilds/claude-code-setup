import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useThemeColors } from "@repo/tui";
import { useEffect, useState } from "react";

export function ProgressDemo() {
	const colors = useThemeColors();
	const [progress, setProgress] = useState(0);
	const [isRunning, setIsRunning] = useState(false);

	useKeyboard((key) => {
		if (key.name === "space") {
			setIsRunning(!isRunning);
			if (!isRunning) {
				setProgress(0);
			}
		}
		if (key.name === "r") {
			setProgress(0);
			setIsRunning(false);
		}
	});

	useEffect(() => {
		if (!isRunning || progress >= 100) return;

		const interval = setInterval(() => {
			setProgress((prev) => {
				const next = prev + 2;
				if (next >= 100) {
					setIsRunning(false);
					return 100;
				}
				return next;
			});
		}, 100);

		return () => clearInterval(interval);
	}, [isRunning, progress]);

	const barWidth = 40;
	const filledWidth = Math.floor((progress / 100) * barWidth);
	const emptyWidth = barWidth - filledWidth;

	return (
		<box flexGrow={1} alignItems="center" justifyContent="center">
			<box style={{ padding: 2 }}>
				<ascii-font font="tiny" text="Progress Primitive" />

				<box style={{ paddingTop: 2, paddingBottom: 1 }}>
					<text fg={colors.text.muted}>Space: Start/Pause | R: Reset</text>
				</box>

				<box style={{ paddingTop: 2 }} border borderStyle="rounded">
					<box style={{ padding: 2 }}>
						<text fg={colors.text.primary} attributes={TextAttributes.BOLD}>
							Loading Progress: {progress}%
						</text>

						<box style={{ paddingTop: 1, flexDirection: "row" }}>
							<text fg={colors.accent.primary}>{"█".repeat(filledWidth)}</text>
							<text fg={colors.text.muted}>{"░".repeat(emptyWidth)}</text>
						</box>

						<box style={{ paddingTop: 1 }}>
							<text fg={colors.text.muted}>
								Status: {isRunning ? "Running..." : progress === 100 ? "Complete!" : "Paused"}
							</text>
						</box>
					</box>
				</box>

				<box style={{ paddingTop: 2 }} border>
					<box style={{ padding: 1 }}>
						<text fg={colors.accent.secondary}>Spinner: </text>
						<text fg={colors.text.primary}>
							{isRunning
								? ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"][Math.floor(progress / 10) % 10]
								: "⠿"}
						</text>
					</box>
				</box>
			</box>
		</box>
	);
}
