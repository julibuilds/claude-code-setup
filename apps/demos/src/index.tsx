import { TextAttributes } from "@opentui/core";
import { render, useKeyboard } from "@opentui/react";
import { ThemeProvider, useThemeColors } from "@repo/tui";
import { useState } from "react";
import {
	AnimationDemo,
	CodeDemo,
	DataDemo,
	FormsDemo,
	InteractiveDemo,
	LayoutsDemo,
	NavigationDemo,
	OverlayDemo,
	ProgressDemo,
	ThemeDemo,
} from "./demos";

type DemoType =
	| "menu"
	| "navigation"
	| "forms"
	| "layouts"
	| "theme"
	| "data"
	| "interactive"
	| "overlay"
	| "progress"
	| "code"
	| "animation";

interface DemoMenuItem {
	key: string;
	demo: DemoType;
	label: string;
	description: string;
	category: string;
	icon: string;
}

const demoItems: DemoMenuItem[] = [
	{
		key: "1",
		demo: "data",
		label: "Data Display",
		description: "Tables, Tabs, Cards with live data",
		category: "🎯 Showcase",
		icon: "📊",
	},
	{
		key: "2",
		demo: "interactive",
		label: "Interactive Elements",
		description: "Dialogs, Command Menu, Toasts, Accordions",
		category: "🎯 Showcase",
		icon: "⚡",
	},
	{
		key: "3",
		demo: "code",
		label: "Code Highlighting",
		description: "Syntax highlighting, Diff view, Multi-language",
		category: "🎯 Showcase",
		icon: "💻",
	},
	{
		key: "4",
		demo: "animation",
		label: "Animations",
		description: "Timeline API, Spinners, Progress bars",
		category: "🎯 Showcase",
		icon: "🎬",
	},
	{
		key: "5",
		demo: "navigation",
		label: "Navigation & Buttons",
		description: "Button variants, focus management",
		category: "📦 Components",
		icon: "🧭",
	},
	{
		key: "6",
		demo: "forms",
		label: "Forms & Inputs",
		description: "TextInput, Select, Checkbox, Switch, Slider",
		category: "📦 Components",
		icon: "📝",
	},
	{
		key: "7",
		demo: "layouts",
		label: "Layout Components",
		description: "Stack, Grid, SplitView, BentoGrid",
		category: "📦 Components",
		icon: "📐",
	},
	{
		key: "8",
		demo: "theme",
		label: "Theme System",
		description: "Dark, Light, Neon themes with live switching",
		category: "🎨 Styling",
		icon: "🌈",
	},
	{
		key: "9",
		demo: "overlay",
		label: "Overlay Primitive",
		description: "Low-level overlay for dialogs and modals",
		category: "⚙️ Primitives",
		icon: "🔲",
	},
	{
		key: "0",
		demo: "progress",
		label: "Progress Primitive",
		description: "Animated loading indicators",
		category: "⚙️ Primitives",
		icon: "⏳",
	},
];

function DemoMenu({ onSelect }: { onSelect: (demo: DemoType) => void }) {
	const colors = useThemeColors();

	useKeyboard((evt) => {
		const item = demoItems.find((d) => d.key === evt.name);
		if (item) {
			onSelect(item.demo);
		}
		if (evt.name === "escape" || evt.name === "q") {
			process.exit(0);
		}
	});

	// Group demos by category
	const categories = Array.from(new Set(demoItems.map((d) => d.category)));

	return (
		<box alignItems="center" justifyContent="center" flexGrow={1}>
			<box style={{ padding: 2, maxWidth: 80 }}>
				{/* Header */}
				<box alignItems="center">
					<ascii-font font="block" text="TUI" />
				</box>
				<box alignItems="center" style={{ paddingTop: 1 }}>
					<text fg={colors.accent.primary} attributes={TextAttributes.BOLD}>
						🚀 Epic Interactive Playground
					</text>
				</box>
				<box alignItems="center">
					<text fg={colors.text.muted}>Showcasing @repo/tui library • Built with OpenTUI</text>
				</box>

				{/* Demo categories */}
				{categories.map((category, catIndex) => {
					const categoryDemos = demoItems.filter((d) => d.category === category);

					return (
						<box key={category} style={{ paddingTop: catIndex === 0 ? 2 : 1 }}>
							{/* Category header */}
							<text fg={colors.accent.secondary} attributes={TextAttributes.BOLD}>
								{category}
							</text>

							{/* Category items */}
							{categoryDemos.map((demo) => (
								<box key={demo.key} style={{ paddingTop: 0, paddingLeft: 2 }}>
									<box style={{ flexDirection: "row", gap: 1 }}>
										<text fg={colors.accent.primary} attributes={TextAttributes.BOLD}>
											[{demo.key}]
										</text>
										<text fg={colors.text.primary}>{demo.icon}</text>
										<text fg={colors.text.primary} attributes={TextAttributes.BOLD}>
											{demo.label}
										</text>
									</box>
									<box style={{ paddingLeft: 4 }}>
										<text fg={colors.text.muted}>{demo.description}</text>
									</box>
								</box>
							))}
						</box>
					);
				})}

				{/* Footer instructions */}
				<box style={{ paddingTop: 2 }} alignItems="center">
					<text fg={colors.text.muted}>Press 0-9 to select a demo • Press Q to exit</text>
				</box>
			</box>
		</box>
	);
}

function App() {
	const [currentDemo, setCurrentDemo] = useState<DemoType>("menu");
	const colors = useThemeColors();

	useKeyboard((evt) => {
		if (currentDemo !== "menu" && (evt.name === "q" || evt.name === "escape")) {
			setCurrentDemo("menu");
		}
	});

	return (
		<box flexGrow={1} flexDirection="column">
			{currentDemo === "menu" && <DemoMenu onSelect={setCurrentDemo} />}
			{currentDemo === "navigation" && <NavigationDemo />}
			{currentDemo === "forms" && <FormsDemo />}
			{currentDemo === "layouts" && <LayoutsDemo />}
			{currentDemo === "theme" && <ThemeDemo />}
			{currentDemo === "data" && <DataDemo />}
			{currentDemo === "interactive" && <InteractiveDemo />}
			{currentDemo === "overlay" && <OverlayDemo />}
			{currentDemo === "progress" && <ProgressDemo />}
			{currentDemo === "code" && <CodeDemo />}
			{currentDemo === "animation" && <AnimationDemo />}

			{/* Footer */}
			{currentDemo !== "menu" && (
				<box
					style={{
						flexDirection: "row",
						justifyContent: "center",
						paddingBottom: 1,
					}}
				>
					<text fg={colors.text.muted}>Press </text>
					<text fg={colors.accent.secondary}>Q</text>
					<text fg={colors.text.muted}> or </text>
					<text fg={colors.accent.secondary}>ESC</text>
					<text fg={colors.text.muted}> to return to menu</text>
				</box>
			)}
		</box>
	);
}

render(
	<ThemeProvider>
		<App />
	</ThemeProvider>
);
