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
				width: Math.min(80, width - 4),
				height: height - 4,
				padding: 2,
			}}
		>
			<box
				style={{
					flexDirection: "column",
					marginBottom: 2,
				}}
			>
				<text
					style={{
						attributes: TextAttributes.BOLD,
						fg: "#00D9FF",
					}}
				>
					Claude Code Router CLI
				</text>
				<text fg="#888">Manage your router configuration and deployments</text>
			</box>

			{/* Current Config Preview */}
			{config && (
				<box
					style={{
						border: true,
						padding: 1,
						marginBottom: 2,
						flexDirection: "column",
						backgroundColor: "#1a1b26",
					}}
				>
					<text style={{ attributes: TextAttributes.BOLD, fg: "#7aa2f7" }}>
						Current Configuration
					</text>
					<text fg="#888">Default: {config.Router.default.split(",")[1] || "Not set"}</text>
					<text fg="#888">Background: {config.Router.background.split(",")[1] || "Not set"}</text>
					<text fg="#888">Think: {config.Router.think.split(",")[1] || "Not set"}</text>
					<text fg="#888">
						Long Context: {config.Router.longContext.split(",")[1] || "Not set"}
					</text>
				</box>
			)}

			<box
				style={{
					border: true,
					height: Math.min(20, height - 12),
					flexDirection: "column",
				}}
			>
				<select
					style={{ height: Math.min(18, height - 14) }}
					options={options}
					focused={true}
					onChange={(index) => {
						setSelectedIndex(index);
					}}
					showScrollIndicator
				/>
			</box>

			<box
				style={{
					marginTop: 2,
					flexDirection: "column",
				}}
			>
				<text fg="#666">↑↓ Navigate • Enter Select • ESC Exit</text>
			</box>
		</box>
	);
}
