import { type SelectOption, TextAttributes } from "@opentui/core";
import { useKeyboard, useTerminalDimensions } from "@opentui/react";
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

	// UI State
	const [focusedPanel, setFocusedPanel] = useState<FocusedPanel>("router-type");
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

	// Keyboard navigation
	useKeyboard((key) => {
		if (key.name === "tab") {
			setFocusedPanel((prev) => {
				if (prev === "router-type") return "filter";
				if (prev === "filter") return "model-list";
				return "router-type";
			});
		}

		if (key.ctrl && key.name === "s") {
			handleSaveAll();
		}

		if (key.ctrl && key.name === "r") {
			setPendingChanges({});
		}

		// Ctrl+F to force refresh models (bypass cache)
		if (key.ctrl && key.name === "f") {
			loadModels(true);
		}
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
			<box style={{ flexDirection: "column", padding: 2 }}>
				<text fg="#00D9FF">Loading OpenRouter models...</text>
			</box>
		);
	}

	if (saving) {
		return (
			<box style={{ flexDirection: "column", padding: 2 }}>
				<text fg="#00D9FF">Saving configuration...</text>
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
			<box style={{ marginBottom: 1, flexDirection: "column" }}>
				<text style={{ attributes: TextAttributes.BOLD, fg: "#00D9FF" }}>⚡ Quick Config</text>
				<text fg="#888">Configure all router models • Tab to switch panels</text>
			</box>

			{/* Three-panel layout */}
			<box style={{ flexDirection: "row", gap: 1, height: height - 10 }}>
				{/* Left: Router Type */}
				<box style={{ flexDirection: "column", width: 30 }}>
					<box style={{ marginBottom: 1 }}>
						<text fg={focusedPanel === "router-type" ? "#00D9FF" : "#666"}>Router Type</text>
					</box>
					<box style={{ border: true, height: panelHeight }}>
						<select
							style={{ height: panelHeight - 2 }}
							options={routerTypeOptions}
							focused={focusedPanel === "router-type"}
							onChange={(_, option) => {
								if (option) {
									setSelectedRouterType(option.value as RouterKey);
								}
							}}
							showScrollIndicator
						/>
					</box>
				</box>

				{/* Middle: Filter */}
				<box style={{ flexDirection: "column", width: 25 }}>
					<box style={{ marginBottom: 1 }}>
						<text fg={focusedPanel === "filter" ? "#00D9FF" : "#666"}>Filter</text>
					</box>
					<box style={{ border: true, height: panelHeight }}>
						<select
							style={{ height: panelHeight - 2 }}
							options={filterOptions}
							focused={focusedPanel === "filter"}
							onChange={(_, option) => {
								if (option) {
									setFilter(option.value as FilterType);
								}
							}}
							showScrollIndicator
						/>
					</box>
				</box>

				{/* Right: Models */}
				<box style={{ flexDirection: "column", flexGrow: 1 }}>
					<box style={{ marginBottom: 1 }}>
						<text fg={focusedPanel === "model-list" ? "#00D9FF" : "#666"}>
							Models ({displayModels.length})
						</text>
					</box>
					<box style={{ border: true, height: panelHeight }}>
						<select
							style={{ height: panelHeight - 2 }}
							options={modelOptions}
							focused={focusedPanel === "model-list"}
							onChange={(_, option) => {
								if (option) {
									handleModelSelect(option.value);
								}
							}}
							showScrollIndicator
						/>
					</box>
				</box>
			</box>

			{/* Pending Changes */}
			{hasChanges && (
				<box
					style={{
						marginTop: 1,
						padding: 1,
						border: true,
						flexDirection: "column",
						backgroundColor: "#1a1b26",
					}}
				>
					<text style={{ attributes: TextAttributes.BOLD, fg: "#e0af68" }}>Pending Changes:</text>
					{Object.entries(pendingChanges).map(([key, value]) => (
						<text key={key} fg="#9ece6a">
							{key}: {value.split(",")[1]}
						</text>
					))}
				</box>
			)}

			{/* Error */}
			{error && (
				<box style={{ marginTop: 1 }}>
					<text fg="red">Error: {error}</text>
				</box>
			)}

			{/* Footer */}
			<box style={{ marginTop: 1, flexDirection: "column" }}>
				<text fg="#666">
					Tab Switch • Enter Select • Ctrl+S Save • Ctrl+R Reset • Ctrl+F Refresh • ESC Back
				</text>
				{hasChanges && <text fg="#e0af68">⚠ Unsaved changes</text>}
			</box>
		</box>
	);
}
