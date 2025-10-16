import { TextAttributes } from "@opentui/core";
import { useTerminalDimensions } from "@opentui/react";
import { useConfig } from "../context/ConfigContext";

interface ConfigViewerProps {
	onBack: () => void;
}

export function ConfigViewer(_props: ConfigViewerProps) {
	const { width, height } = useTerminalDimensions();
	const { config, loading, error } = useConfig();

	if (loading) {
		return (
			<box
				style={{
					flexDirection: "column",
					width: Math.min(100, width - 4),
					padding: 2,
				}}
			>
				<text fg="#00D9FF">Loading configuration...</text>
			</box>
		);
	}

	if (error || !config) {
		return (
			<box
				style={{
					flexDirection: "column",
					width: Math.min(100, width - 4),
					padding: 2,
				}}
			>
				<text fg="red">Error: {error || "Config not found"}</text>
				<text fg="#666">Press ESC to go back</text>
			</box>
		);
	}

	const openrouterProvider = config.Providers.find((p) => p.name === "openrouter");

	return (
		<box
			style={{
				flexDirection: "column",
				width: Math.min(100, width - 4),
				height: height - 4,
				padding: 2,
			}}
		>
			<box style={{ marginBottom: 2 }}>
				<text
					style={{
						attributes: TextAttributes.BOLD,
						fg: "#00D9FF",
					}}
				>
					Current Configuration
				</text>
			</box>

			<scrollbox
				style={{
					rootOptions: { height: height - 10 },
					wrapperOptions: { backgroundColor: "#1f2335" },
					viewportOptions: { backgroundColor: "#1a1b26" },
					scrollbarOptions: { showArrows: true },
				}}
				focused
			>
				<box style={{ flexDirection: "column", padding: 1 }}>
					<box style={{ marginBottom: 1 }}>
						<text
							style={{
								attributes: TextAttributes.BOLD,
								fg: "#7aa2f7",
							}}
						>
							Router Settings
						</text>
					</box>

					<box style={{ flexDirection: "column", marginBottom: 2 }}>
						<text fg="#888">Default: </text>
						<text fg="#9ece6a">{config.Router.default}</text>

						<text fg="#888">Background: </text>
						<text fg="#9ece6a">{config.Router.background}</text>

						<text fg="#888">Think: </text>
						<text fg="#9ece6a">{config.Router.think}</text>

						<text fg="#888">Long Context: </text>
						<text fg="#9ece6a">{config.Router.longContext}</text>

						<text fg="#888">Long Context Threshold: </text>
						<text fg="#9ece6a">{config.Router.longContextThreshold} tokens</text>
					</box>

					{openrouterProvider && (
						<box style={{ flexDirection: "column" }}>
							<box style={{ marginBottom: 1 }}>
								<text
									style={{
										attributes: TextAttributes.BOLD,
										fg: "#7aa2f7",
									}}
								>
									OpenRouter Models
								</text>
							</box>

							{openrouterProvider.models.map((model) => (
								<text key={model} fg="#bb9af7">
									• {model}
								</text>
							))}
						</box>
					)}
				</box>
			</scrollbox>

			<box style={{ marginTop: 1 }}>
				<text fg="#666">↑↓ Scroll • ESC Back</text>
			</box>
		</box>
	);
}
