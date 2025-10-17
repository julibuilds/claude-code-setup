import { type SelectOption, TextAttributes } from "@opentui/core";
import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import { useCallback, useEffect, useState } from "react";
import { useConfig } from "../../../context/ConfigContext";
import type { OpenRouterModel } from "../../../types/config";
import {
	fetchOpenRouterModels,
	filterAnthropicModels,
	filterOpenAIModels,
	formatModelForDisplay,
	sortModelsByContextLength,
} from "../../../utils/openrouter";
import { Header } from "../../layout/Header";
import { Footer } from "../../layout/Footer";
import { StatusBox } from "../../common/StatusBox";
import { theme } from "../../../design/theme";
import { RouterTypePanel } from "./RouterTypePanel";
import { FilterPanel } from "./FilterPanel";
import { ModelListPanel } from "./ModelListPanel";
import { StatusOverlay } from "./StatusOverlay";
import { PendingChangesBox } from "./PendingChangesBox";

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

	// Loading and saving overlays
	if (loading) {
		return <StatusOverlay type="loading" width={width} height={height} />;
	}

	if (saving) {
		return (
			<StatusOverlay
				type="saving"
				width={width}
				height={height}
				pendingChangesCount={Object.keys(pendingChanges).length}
			/>
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

	// Helper function to get current value for router type
	function getCurrentValue(key: RouterKey): string {
		if (pendingChanges[key]) {
			return `→ ${pendingChanges[key].split(",")[1] || ""}`;
		}
		return config?.Router[key]?.split(",")[1] || "Not set";
	}

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
			<Header
				icon="⚡"
				title="Quick Config"
				subtitle="Configure all router models • Tab to switch panels"
			/>

			<box
				style={{
					flexDirection: "row",
					gap: 2,
					height: height - 12,
				}}
			>
				<box style={{ flexGrow: 1, flexDirection: "column" }}>
					<RouterTypePanel
						focused={focusedPanel === "router-type"}
						selectedRouterType={selectedRouterType}
						routerTypeOptions={routerTypeOptions}
						onSelect={(type) => setSelectedRouterType(type as RouterKey)}
						height={panelHeight}
					/>
				</box>
				<box style={{ flexGrow: 1, flexDirection: "column" }}>
					<FilterPanel
						focused={focusedPanel === "filter"}
						filter={filter}
						filterOptions={filterOptions}
						onSelect={(f) => setFilter(f as FilterType)}
						height={panelHeight}
					/>
				</box>
				<box style={{ flexGrow: 1, flexDirection: "column" }}>
					<ModelListPanel
						focused={focusedPanel === "model-list"}
						modelOptions={modelOptions}
						onSelect={handleModelSelect}
						height={panelHeight}
						modelCount={displayModels.length}
					/>
				</box>
			</box>

			{/* Pending Changes Display */}
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

			{/* Error Display */}
			{error && (
				<StatusBox
					status="error"
					message={error}
					details="Failed to load or save configuration"
				/>
			)}

			{/* Footer with shortcuts and pending changes warning */}
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
				<PendingChangesBox changes={pendingChanges} />
			</box>
		</box>
	);
}
