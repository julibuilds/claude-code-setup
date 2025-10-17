import { TextAttributes } from "@opentui/core";
import { useKeyboard, useTimeline } from "@opentui/react";
import { Progress, useThemeColors } from "@repo/tui";
import { useEffect, useState } from "react";

export function AnimationDemo() {
	const colors = useThemeColors();
	const [isAnimating, setIsAnimating] = useState(false);
	const [progress, setProgress] = useState(0);
	const [barWidth, setBarWidth] = useState(0);
	const [pulseScale, setPulseScale] = useState(1);
	const [spinnerFrame, setSpinnerFrame] = useState(0);

	// Animated progress bar
	const progressTimeline = useTimeline({
		duration: 3000,
		loop: false,
		autoplay: false,
	});

	progressTimeline.add(
		{ value: 0 },
		{
			value: 100,
			duration: 3000,
			ease: "inOutQuad",
			onUpdate: (anim) => {
				setProgress(Math.round(anim.targets[0].value));
			},
		}
	);

	// Animated width bar
	const widthTimeline = useTimeline({
		duration: 2000,
		loop: false,
		autoplay: false,
	});

	widthTimeline.add(
		{ width: 0 },
		{
			width: 50,
			duration: 2000,
			ease: "outElastic",
			onUpdate: (anim) => {
				setBarWidth(Math.round(anim.targets[0].width));
			},
		}
	);

	// Pulse animation
	useEffect(() => {
		if (!isAnimating) return;
		const interval = setInterval(() => {
			setPulseScale((prev) => (prev === 1 ? 1.2 : 1));
		}, 500);
		return () => clearInterval(interval);
	}, [isAnimating]);

	// Spinner animation
	useEffect(() => {
		const interval = setInterval(() => {
			setSpinnerFrame((prev) => (prev + 1) % 8);
		}, 100);
		return () => clearInterval(interval);
	}, []);

	const spinnerFrames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧"];
	const dotsFrames = ["   ", ".  ", ".. ", "..."];
	const [dotsFrame, setDotsFrame] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setDotsFrame((prev) => (prev + 1) % 4);
		}, 300);
		return () => clearInterval(interval);
	}, []);

	useKeyboard((key) => {
		if (key.name === "space") {
			setIsAnimating(!isAnimating);
			if (!isAnimating) {
				progressTimeline.play();
				widthTimeline.play();
			} else {
				progressTimeline.pause();
				widthTimeline.pause();
			}
		}
		if (key.name === "r") {
			setProgress(0);
			setBarWidth(0);
			progressTimeline.restart();
			widthTimeline.restart();
			setIsAnimating(true);
		}
	});

	return (
		<box flexGrow={1} style={{ padding: 2, flexDirection: "column", gap: 1 }}>
			<box alignItems="center">
				<ascii-font font="tiny" text="Animations" />
			</box>

			<box style={{ flexDirection: "row", gap: 2, flexGrow: 1 }}>
				{/* Left Column */}
				<box style={{ flexDirection: "column", gap: 1, flexGrow: 1 }}>
					{/* Progress Animation */}
					<box border title="Progress Animation" style={{ padding: 1 }}>
						<box style={{ flexDirection: "column", gap: 1 }}>
							<box style={{ flexDirection: "row", justifyContent: "space-between" }}>
								<text fg={colors.text.muted}>Progress:</text>
								<text fg={colors.accent.primary} attributes={TextAttributes.BOLD}>
									{progress}%
								</text>
							</box>
							<box style={{ flexDirection: "row" }}>
								<text fg={colors.accent.primary}>{"█".repeat(Math.floor(progress / 2))}</text>
								<text fg={colors.border.default}>{"░".repeat(50 - Math.floor(progress / 2))}</text>
							</box>
							<Progress length={50} isAnimating={isAnimating} />
						</box>
					</box>

					{/* Width Animation */}
					<box border title="Elastic Width" style={{ padding: 1 }}>
						<box style={{ flexDirection: "column", gap: 1 }}>
							<text fg={colors.text.muted}>Width: {barWidth} chars</text>
							<box style={{ flexDirection: "row" }}>
								<text fg={colors.accent.secondary}>{"▓".repeat(barWidth)}</text>
							</box>
						</box>
					</box>

					{/* Pulse Animation */}
					<box border title="Pulse Effect" style={{ padding: 1 }}>
						<box alignItems="center" justifyContent="center" style={{ padding: 2 }}>
							<text fg={colors.accent.primary} attributes={TextAttributes.BOLD}>
								{isAnimating ? (pulseScale > 1 ? "◉" : "●") : "○"}
							</text>
						</box>
					</box>

					{/* Controls */}
					<box border title="Controls" style={{ padding: 1 }}>
						<box style={{ flexDirection: "column", gap: 0 }}>
							<box style={{ flexDirection: "row", gap: 1 }}>
								<text fg={colors.accent.secondary}>[Space]</text>
								<text fg={colors.text.primary}>{isAnimating ? "Pause" : "Play"}</text>
							</box>
							<box style={{ flexDirection: "row", gap: 1 }}>
								<text fg={colors.accent.secondary}>[R]</text>
								<text fg={colors.text.primary}>Restart</text>
							</box>
							<box style={{ paddingTop: 1 }}>
								<text fg={colors.text.muted}>Status: {isAnimating ? "Playing" : "Paused"}</text>
							</box>
						</box>
					</box>
				</box>

				{/* Right Column */}
				<box style={{ flexDirection: "column", gap: 1, flexGrow: 1 }}>
					{/* Spinner Animations */}
					<box border title="Loading Spinners" style={{ padding: 1 }}>
						<box style={{ flexDirection: "column", gap: 1 }}>
							<box style={{ flexDirection: "row", gap: 2 }}>
								<text fg={colors.accent.primary} attributes={TextAttributes.BOLD}>
									{spinnerFrames[spinnerFrame]}
								</text>
								<text fg={colors.text.muted}>Loading{dotsFrames[dotsFrame]}</text>
							</box>
							<box style={{ flexDirection: "row", gap: 2 }}>
								<text fg={colors.accent.secondary} attributes={TextAttributes.BOLD}>
									⣾⣽⣻⢿⡿⣟⣯⣷
									{["⣾", "⣽", "⣻", "⢿", "⡿", "⣟", "⣯", "⣷"][spinnerFrame]}
								</text>
								<text fg={colors.text.muted}>Processing</text>
							</box>
							<box style={{ flexDirection: "row", gap: 2 }}>
								<text fg={colors.status.success} attributes={TextAttributes.BOLD}>
									{["◐", "◓", "◑", "◒"][spinnerFrame % 4]}
								</text>
								<text fg={colors.text.muted}>Syncing</text>
							</box>
							<box style={{ flexDirection: "row", gap: 2 }}>
								<text fg={colors.status.warning} attributes={TextAttributes.BOLD}>
									{["▁", "▃", "▄", "▅", "▆", "▇", "█", "▇"][spinnerFrame]}
								</text>
								<text fg={colors.text.muted}>Uploading</text>
							</box>
						</box>
					</box>

					{/* Wave Animation */}
					<box border title="Wave Pattern" style={{ padding: 1 }}>
						<box alignItems="center" justifyContent="center" style={{ padding: 1 }}>
							<text fg={colors.accent.primary}>
								{Array.from({ length: 20 }, (_, i) => {
									const offset = (spinnerFrame + i) % 8;
									const heights = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
									return heights[offset];
								}).join("")}
							</text>
						</box>
					</box>

					{/* Marquee Effect */}
					<box border title="Marquee Text" style={{ padding: 1 }}>
						<box style={{ overflow: "hidden" }}>
							<text fg={colors.accent.secondary}>
								{" ".repeat(Math.max(0, 10 - ((spinnerFrame * 2) % 20)))}
								{">>> SCROLLING TEXT <<<"}
							</text>
						</box>
					</box>

					{/* Stats */}
					<box border title="Animation Stats" style={{ padding: 1 }}>
						<box style={{ flexDirection: "column", gap: 0 }}>
							<box style={{ flexDirection: "row", justifyContent: "space-between" }}>
								<text fg={colors.text.muted}>Frame:</text>
								<text fg={colors.accent.primary}>{spinnerFrame}</text>
							</box>
							<box style={{ flexDirection: "row", justifyContent: "space-between" }}>
								<text fg={colors.text.muted}>Progress:</text>
								<text fg={colors.accent.secondary}>{progress}%</text>
							</box>
							<box style={{ flexDirection: "row", justifyContent: "space-between" }}>
								<text fg={colors.text.muted}>State:</text>
								<text fg={isAnimating ? colors.status.success : colors.status.error}>
									{isAnimating ? "Active" : "Idle"}
								</text>
							</box>
						</box>
					</box>

					{/* Info */}
					<box border title="Info" style={{ padding: 1 }}>
						<box style={{ flexDirection: "column", gap: 0 }}>
							<text fg={colors.text.primary}>Timeline API</text>
							<text fg={colors.text.muted}>• Easing functions</text>
							<text fg={colors.text.muted}>• Loop support</text>
							<text fg={colors.text.muted}>• Callback hooks</text>
						</box>
					</box>
				</box>
			</box>
		</box>
	);
}
