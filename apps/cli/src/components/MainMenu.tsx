import { type SelectOption, TextAttributes } from "@opentui/core";
import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import { useState } from "react";
import { useConfig } from "../context/ConfigContext";

interface MainMenuProps {
	onNavigate: (screen: "quick-config" | "deploy" | "secrets") => void;
}

export function MainMenu({ onNavigate }: MainMenuProps) {
	const { width, height } = useTerminalDimensions();
	const { config } = useConfig();
	const [selectedIndex, setSelectedIndex] = useState(0);

	const options: SelectOption[] = [
		{
			name: "⚡ Quick Config",
			description: "Configure all router models in one place",
			value: "quick-config",
		},
		{
			name: "🚀 Deploy to Workers",
			description: "Deploy configuration to Cloudflare Workers",
			value: "deploy",
		},
		{
			name: "🔐 Manage Secrets",
			description: "Update Cloudflare Workers secrets",
			value: "secrets",
		},
		{
			name: "❌ Exit",
			description: "Exit the application",
			value: "exit",
		},
	];

	useKeyboard((key) => {
		if (key.name === "return") {
			const selected = options[selectedIndex];
			if (selected?.value === "exit") {
				process.exit(0);
			} else if (selected) {
				onNavigate(selected.value as "quick-config" | "deploy" | "secrets");
			}
		}
	});

	return (
		<box
			style={{
				flexDirection: "column",
				width: Math.min(90, width - 4),
				height: height - 4,
				padding: 2,
			}}
		>
			{/* Header with branding */}
			<box
				style={{
					flexDirection: "column",
					marginBottom: 2,
					padding: 2,
					border: true,
					backgroundColor: "#1a1b26",
				}}
			>
				<text
					style={{
						attributes: TextAttributes.BOLD,
						fg: "#00D9FF",
						marginBottom: 1,
					}}
				>
					⚡ Claude Code Router CLI
				</text>
				<text fg="#7aa2f7">Manage your router configuration and deployments</text>
			</box>

			{/* Current Config Preview */}
			{config && (
				<box
					style={{
						border: true,
						padding: 2,
						marginBottom: 2,
						flexDirection: "column",
						backgroundColor: "#1a1b26",
					}}
				>
					<text style={{ attributes: TextAttributes.BOLD, fg: "#bb9af7", marginBottom: 1 }}>
						📋 Current Configuration
					</text>
					<box style={{ flexDirection: "column", gap: 0 }}>
						{[
							{ label: "Default", value: config.Router.default },
							{ label: "Background", value: config.Router.background },
							{ label: "Think", value: config.Router.think },
							{ label: "Long Context", value: config.Router.longContext },
						].map(({ label, value }) => {
							const modelId = value.split(",")[1];
							const isSet = !!modelId;
							return (
								<text key={label} fg={isSet ? "#9ece6a" : "#f7768e"}>
									{isSet ? "✓" : "✗"} {label}: {modelId || "Not configured"}
								</text>
							);
						})}
					</box>
				</box>
			)}

			{/* Menu Options */}
			<box
				style={{
					border: true,
					height: Math.min(20, height - 16),
					flexDirection: "column",
					backgroundColor: "#1f2335",
				}}
			>
				<select
					style={{ height: Math.min(18, height - 18) }}
					options={options}
					focused={true}
					onChange={(index) => {
						setSelectedIndex(index);
					}}
					showScrollIndicator
				/>
			</box>

			{/* Footer with keyboard shortcuts */}
			<box
				style={{
					marginTop: 2,
					padding: 2,
					border: true,
					flexDirection: "column",
					backgroundColor: "#1a1b26",
				}}
			>
				<text style={{ attributes: TextAttributes.BOLD, fg: "#bb9af7", marginBottom: 1 }}>
					⌨️  Keyboard Shortcuts
				</text>
				<text fg="#7aa2f7">↑↓ Navigate  •  Enter Select  •  ESC Exit</text>
			</box>
		</box>
	);
}
