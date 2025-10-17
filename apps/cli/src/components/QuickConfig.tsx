import { type SelectOption, TextAttributes } from "@opentui/core";
import { useTerminalDimensions } from "@opentui/react";
import { useCallback, useEffect, useState } from "react";
import { useConfig } from "../context/ConfigContext";
import type { OpenRouterModel } from "../types/config";
import {
	fetchOpenRouterModels,
	filterAnthropicModels,
	filterOpenAIModels,
	formatModelForDisplay,
	sortModelsByContextLength,
} from "../utils/openrouter";
import { Header } from "./layout/Header";
import { Footer } from "./layout/Footer";
import { Panel } from "./layout/Panel";
import { StatusBox } from "./common/StatusBox";
import { Spinner } from "./common/Spinner";
import { theme } from "../design/theme";
import { useScreenFocus } from "../hooks/useScreenFocus";
import { useMultiPanelFocus } from "../hooks/useMultiPanelFocus";

interface QuickConfigProps {
	onBack: () => void;
}

type RouterKey = "default" | "background" | "think" | "longContext";
type FilterType = "popular" | "anthropic" | "openai" | "all";
type FocusedPanel = "router-type" | "filter" | "model-list";

interface PendingChanges {
	[key: string]: string;
}

export function QuickConfig(_props: QuickConfigProps) {
	const { width, height } = useTerminalDimensions();
	const { config, updateConfig } = useConfig();
	const [models, setModels] = useState<OpenRouterModel[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);

	// UI State - Use Core-powered multi-panel focus
	const { focusedPanel: focusedPanelIndex } = useMultiPanelFocus(3);
	const focusedPanel: FocusedPanel =
		focusedPanelIndex === 0
			? "router-type"
			: focusedPanelIndex === 1
			? "filter"
			: "model-list";

	const [selectedRouterType, setSelectedRouterType] = useState<RouterKey>("default");
	const [filter, setFilter] = useState<FilterType>("popular");
	const [pendingChanges, setPendingChanges] = useState<PendingChanges>({});

	const loadModels = useCallback(
		async (forceRefresh = false) => {
			try {
				setLoading(true);
				setError(null);
				const fetchedModels = await fetchOpenRouterModels(!forceRefresh);
				setModels(fetchedModels);
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : "Failed to load models";
				setError(errorMessage);
				// Keep any existing models if we have them
				if (models.length === 0) {
					setModels([]);
				}
			} finally {
				setLoading(false);
			}
		},
		[models.length]
	);

	useEffect(() => {
		loadModels();
	}, [loadModels]);

	// Use Core renderer for keyboard events
	useScreenFocus({
		onCtrlS: () => handleSaveAll(),
		onCtrlR: () => setPendingChanges({}),
		onCtrlF: () => loadModels(true),
	});

	const handleModelSelect = useCallback(
		(modelId: string) => {
			const routerValue = `openrouter,${modelId}`;
			setPendingChanges((prev) => ({
				...prev,
				[selectedRouterType]: routerValue,
			}));
		},
		[selectedRouterType]
	);

	const handleSaveAll = useCallback(async () => {
		if (!config || Object.keys(pendingChanges).length === 0) return;

		try {
			setSaving(true);
			const newConfig = { ...config };

			// Apply all pending changes
			for (const [key, value] of Object.entries(pendingChanges)) {
				newConfig.Router[key as RouterKey] = value;

				// Extract model ID and add to provider if needed
				const modelId = value.split(",")[1];
				if (modelId) {
					const openrouterProvider = newConfig.Providers.find((p) => p.name === "openrouter");
					if (openrouterProvider && !openrouterProvider.models.includes(modelId)) {
						openrouterProvider.models.push(modelId);
					}
				}
			}

			await updateConfig(newConfig);
			setPendingChanges({});
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to save config");
		} finally {
			setSaving(false);
		}
	}, [config, pendingChanges, updateConfig]);

	if (loading) {
		return (
			<box
				style={{
					flexDirection: "column",
					padding: 2,
					width: Math.min(60, width - 4),
					height: height - 4,
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<box
					style={{
						border: true,
						padding: 3,
						backgroundColor: theme.colors.bg.dark,
						flexDirection: "column",
						alignItems: "center",
						gap: 2,
					}}
				>
					<Spinner label="Loading OpenRouter Models" />
					<text fg={theme.colors.text.primary}>Fetching model list from API...</text>
					<text fg={theme.colors.text.dim}>This may take a few seconds</text>
				</box>
			</box>
		);
	}

	if (saving) {
		return (
			<box
				style={{
					flexDirection: "column",
					padding: 2,
					width: Math.min(60, width - 4),
					height: height - 4,
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<box
					style={{
						border: true,
						padding: 3,
						backgroundColor: theme.colors.bg.dark,
						flexDirection: "column",
						alignItems: "center",
						gap: 2,
					}}
				>
					<Spinner label="Saving Configuration" color={theme.colors.success} />
					<text fg={theme.colors.text.primary}>Writing changes to config.json...</text>
					<text fg={theme.colors.text.dim}>
						{Object.keys(pendingChanges).length} router(s) being updated
					</text>
				</box>
			</box>
		);
	}

	// Filter models based on selected filter
	let filteredModels = models;
	if (filter === "popular") {
		const popularProviders = [
			"anthropic",
			"openai",
			"google",
			"meta-llama",
			"deepseek",
			"x-ai",
			"qwen",
		];
		filteredModels = models.filter((model) =>
			popularProviders.some((provider) => model.id.startsWith(`${provider}/`))
		);
	} else if (filter === "anthropic") {
		filteredModels = filterAnthropicModels(models);
	} else if (filter === "openai") {
		filteredModels = filterOpenAIModels(models);
	}

	filteredModels = sortModelsByContextLength(filteredModels);
	const displayModels = filteredModels.slice(0, 100);

	// Router type options
	const routerTypeOptions: SelectOption[] = [
		{
			name: "Default",
			description: getCurrentValue("default"),
			value: "default",
		},
		{
			name: "Background",
			description: getCurrentValue("background"),
			value: "background",
		},
		{
			name: "Think",
			description: getCurrentValue("think"),
			value: "think",
		},
		{
			name: "Long Context",
			description: getCurrentValue("longContext"),
			value: "longContext",
		},
	];

	function getCurrentValue(key: RouterKey): string {
		if (pendingChanges[key]) {
			return `→ ${pendingChanges[key].split(",")[1] || ""}`;
		}
		return config?.Router[key]?.split(",")[1] || "Not set";
	}

	// Filter options
	const filterOptions: SelectOption[] = [
		{ name: "⭐ Popular", description: "Top providers", value: "popular" },
		{ name: "🤖 Anthropic", description: "Claude models", value: "anthropic" },
		{ name: "🧠 OpenAI", description: "GPT models", value: "openai" },
		{ name: "📋 All", description: `${models.length} models`, value: "all" },
	];

	// Model options
	const modelOptions: SelectOption[] = displayModels.map((model) => ({
		name: model.id,
		description: formatModelForDisplay(model),
		value: model.id,
	}));

	const hasChanges = Object.keys(pendingChanges).length > 0;
	const panelHeight = Math.floor((height - 12) / 3);

	return (
		<box
			style={{
				flexDirection: "column",
				width: Math.min(120, width - 4),
				height: height - 4,
				padding: 2,
			}}
		>
			{/* Header */}
			<Header
				icon="⚡"
				title="Quick Config"
				subtitle="Configure all router models • Tab to switch panels"
			/>

			{/* Three-panel layout */}
			<box style={{ flexDirection: "row", gap: 2, height: height - 12 }}>
				{/* Left: Router Type */}
				<Panel
					title="Router Type"
					focused={focusedPanel === "router-type"}
					height={panelHeight}
					width={30}
				>
					<select
						style={{ height: "100%" }}
						options={routerTypeOptions}
						focused={focusedPanel === "router-type"}
						onChange={(index, option) => {
							if (option) {
								setSelectedRouterType(option.value as RouterKey);
							}
						}}
						showScrollIndicator
					/>
				</Panel>

				{/* Middle: Filter */}
				<Panel
					title="Filter"
					focused={focusedPanel === "filter"}
					height={panelHeight}
					width={25}
				>
					<select
						style={{ height: "100%" }}
						options={filterOptions}
						focused={focusedPanel === "filter"}
						onChange={(index, option) => {
							if (option) {
								setFilter(option.value as FilterType);
							}
						}}
						showScrollIndicator
					/>
				</Panel>

				{/* Right: Models */}
				<Panel
					title={`Models (${displayModels.length})`}
					focused={focusedPanel === "model-list"}
					height={panelHeight}
					width="auto"
				>
					<select
						style={{ height: "100%" }}
						options={modelOptions}
						focused={focusedPanel === "model-list"}
						onChange={(index, option) => {
							if (option) {
								handleModelSelect(option.value);
							}
						}}
						showScrollIndicator
					/>
				</Panel>
			</box>

			{/* Pending Changes */}
			{hasChanges && (
				<box
					style={{
						...theme.components.statusBox,
						marginTop: 2,
						flexDirection: "column",
						backgroundColor: theme.colors.bg.dark,
					}}
				>
					<text
						style={{
							attributes: TextAttributes.BOLD,
							fg: theme.colors.warning,
							marginBottom: 1,
						}}
					>
						⚠️ Pending Changes ({Object.keys(pendingChanges).length})
					</text>
					<box style={{ flexDirection: "column" }}>
						{Object.entries(pendingChanges).map(([key, value]) => (
							<text key={key} fg={theme.colors.success}>
								✓ {key}: {value.split(",")[1]}
							</text>
						))}
					</box>
				</box>
			)}

			{/* Error */}
			{error && (
				<StatusBox status="error" message={error} details="Failed to load or save configuration" />
			)}

			{/* Footer */}
			<box style={{ flexDirection: "column" }}>
				<Footer
					shortcuts={[
						{ keys: "Tab", description: "Switch panels" },
						{ keys: "Enter", description: "Select" },
						{ keys: "Ctrl+S", description: "Save" },
						{ keys: "Ctrl+R", description: "Reset" },
						{ keys: "Ctrl+F", description: "Refresh" },
						{ keys: "ESC", description: "Back" },
					]}
				/>
				{hasChanges && (
					<box
						style={{
							padding: 1,
							marginTop: 1,
							border: true,
							backgroundColor: theme.colors.bg.dark,
						}}
					>
						<text
							style={{
								attributes: TextAttributes.BOLD,
								fg: theme.colors.warning,
							}}
						>
							⚠️ {Object.keys(pendingChanges).length} unsaved change(s) - Press Ctrl+S to save
						</text>
					</box>
				)}
			</box>
		</box>
	);
}
