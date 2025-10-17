import { type SelectOption } from "@opentui/core";
import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import { useState } from "react";
import { useConfig } from "../context/ConfigContext";
import { Header } from "./layout/Header";
import { Footer } from "./layout/Footer";
import { SelectList } from "./common/SelectList";
import { theme } from "../design/theme";

interface MainMenuProps {
	onNavigate: (screen: "quick-config" | "deploy" | "secrets") => void;
}

/**
 * Main menu screen - entry point for all CLI operations
 * Shows current config status and navigation options
 */
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

	const contentHeight = Math.max(8, height - 16);

	return (
		<box
			style={{
				flexDirection: "column",
				width: Math.min(90, width - 4),
				height: height - 4,
				padding: 2,
			}}
		>
			{/* Header */}
			<Header
				icon="⚡"
				title="Claude Code Router CLI"
				subtitle="Manage your router configuration and deployments"
			/>

			{/* Current Config Preview */}
			{config && (
				<box
					style={{
						...theme.components.header,
						marginBottom: 2,
					}}
				>
					<text
						style={{
							attributes: 1, // BOLD
							fg: theme.colors.accent.purple,
							marginBottom: 1,
						}}
					>
						📋 Current Configuration
					</text>
					<box style={{ flexDirection: "column" }}>
						{[
							{ label: "Default", value: config.Router.default },
							{ label: "Background", value: config.Router.background },
							{ label: "Think", value: config.Router.think },
							{ label: "Long Context", value: config.Router.longContext },
						].map(({ label, value }) => {
							const modelId = value.split(",")[1];
							const isSet = !!modelId;
							return (
								<text
									key={label}
									fg={isSet ? theme.colors.success : theme.colors.error}
								>
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
					...theme.components.selectContainer,
					height: contentHeight,
					marginBottom: 2,
				}}
			>
				<select
					style={{ height: "100%" }}
					options={options}
					focused={true}
					onChange={(index) => {
						setSelectedIndex(index);
					}}
					showScrollIndicator
				/>
			</box>

			{/* Footer */}
			<Footer
				shortcuts={[
					{ keys: "↑↓", description: "Navigate" },
					{ keys: "Enter", description: "Select" },
					{ keys: "ESC", description: "Exit" },
				]}
			/>
		</box>
	);
}
