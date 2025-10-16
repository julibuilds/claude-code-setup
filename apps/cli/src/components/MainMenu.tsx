import { type SelectOption, TextAttributes } from "@opentui/core";
import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import { useState } from "react";

interface MainMenuProps {
	onNavigate: (screen: "config" | "models" | "deploy" | "secrets") => void;
}

export function MainMenu({ onNavigate }: MainMenuProps) {
	const { width, height } = useTerminalDimensions();
	const [selectedIndex, setSelectedIndex] = useState(0);

	const options: SelectOption[] = [
		{
			name: "View Configuration",
			description: "View current router configuration",
			value: "config",
		},
		{
			name: "Select Models",
			description: "Browse and configure OpenRouter models",
			value: "models",
		},
		{
			name: "Deploy to Workers",
			description: "Deploy configuration to Cloudflare Workers",
			value: "deploy",
		},
		{
			name: "Manage Secrets",
			description: "Update Cloudflare Workers secrets",
			value: "secrets",
		},
		{
			name: "Exit",
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
				onNavigate(selected.value as "config" | "models" | "deploy" | "secrets");
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
