import { type SelectOption, TextAttributes } from "@opentui/core";
import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import { useCallback, useEffect, useState } from "react";
import { useConfig } from "../context/ConfigContext";
import type { OpenRouterModel } from "../types/config";
import { fetchOpenRouterModels, formatModelForDisplay } from "../utils/openrouter";

interface ModelSelectorProps {
	onBack: () => void;
}

type RouterKey = "default" | "background" | "think" | "longContext";

export function ModelSelector(_props: ModelSelectorProps) {
	const { width, height } = useTerminalDimensions();
	const { config, updateConfig } = useConfig();
	const [models, setModels] = useState<OpenRouterModel[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [step, setStep] = useState<"select-type" | "select-filter" | "select-model">("select-type");
	const [selectedType, setSelectedType] = useState<RouterKey | null>(null);
	const [filter, setFilter] = useState<"popular" | "anthropic" | "openai" | "all">("popular");
	const [saving, setSaving] = useState(false);

	const loadModels = useCallback(async () => {
		try {
			setLoading(true);
			const fetchedModels = await fetchOpenRouterModels(true);
			setModels(fetchedModels);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load models");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadModels();
	}, [loadModels]);

	const handleTypeSelect = useCallback((type: RouterKey) => {
		setSelectedType(type);
		setStep("select-filter");
	}, []);

	const handleFilterSelect = useCallback(
		(selectedFilter: "popular" | "anthropic" | "openai" | "all") => {
			setFilter(selectedFilter);
			setStep("select-model");
		},
		[]
	);

	const handleModelSelect = useCallback(
		async (modelId: string) => {
			if (!config || !selectedType) return;

			try {
				setSaving(true);
				const newConfig = { ...config };
				newConfig.Router[selectedType] = `openrouter,${modelId}`;

				// Update models list in provider
				const openrouterProvider = newConfig.Providers.find((p) => p.name === "openrouter");
				if (openrouterProvider && !openrouterProvider.models.includes(modelId)) {
					openrouterProvider.models.push(modelId);
				}

				await updateConfig(newConfig);
				setStep("select-type");
				setSelectedType(null);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to save config");
			} finally {
				setSaving(false);
			}
		},
		[config, selectedType, updateConfig]
	);

	useKeyboard((key) => {
		if (key.name === "escape") {
			if (step === "select-model") {
				setStep("select-filter");
			} else if (step === "select-filter") {
				setStep("select-type");
				setSelectedType(null);
			}
		}
	});

	if (loading) {
		return (
			<box style={{ flexDirection: "column", padding: 2 }}>
				<text fg="#00D9FF">Loading OpenRouter models...</text>
			</box>
		);
	}

	if (error) {
		return (
			<box style={{ flexDirection: "column", padding: 2 }}>
				<text fg="red">Error: {error}</text>
				<text fg="#666">Press ESC to go back</text>
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

	if (step === "select-type") {
		const typeOptions: SelectOption[] = [
			{
				name: "Default Model",
				description: `Current: ${config?.Router.default || "Not set"}`,
				value: "default",
			},
			{
				name: "Background Model",
				description: `Current: ${config?.Router.background || "Not set"}`,
				value: "background",
			},
			{
				name: "Think Model",
				description: `Current: ${config?.Router.think || "Not set"}`,
				value: "think",
			},
			{
				name: "Long Context Model",
				description: `Current: ${config?.Router.longContext || "Not set"}`,
				value: "longContext",
			},
		];

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
						Select Router Type
					</text>
				</box>

				<box style={{ border: true, height: height - 10 }}>
					<select
						style={{ height: height - 12 }}
						options={typeOptions}
						focused={true}
						onChange={(_, option) => {
							if (option) {
								handleTypeSelect(option.value as RouterKey);
							}
						}}
						showScrollIndicator
					/>
				</box>

				<box style={{ marginTop: 1 }}>
					<text fg="#666">↑↓ Navigate • Enter Select • ESC Back</text>
				</box>
			</box>
		);
	}

	// Step: select-filter
	if (step === "select-filter") {
		const filterOptions: SelectOption[] = [
			{
				name: "Popular Models",
				description: "Claude, GPT, Gemini, and other top models",
				value: "popular",
			},
			{
				name: "Anthropic Models",
				description: "Claude models only",
				value: "anthropic",
			},
			{
				name: "OpenAI Models",
				description: "GPT models only",
				value: "openai",
			},
			{
				name: "All Models",
				description: `All ${models.length} available models`,
				value: "all",
			},
		];

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
						Filter Models for {selectedType}
					</text>
				</box>

				<box style={{ border: true, height: height - 10 }}>
					<select
						style={{ height: height - 12 }}
						options={filterOptions}
						focused={true}
						onChange={(_, option) => {
							if (option) {
								handleFilterSelect(option.value as "popular" | "anthropic" | "openai" | "all");
							}
						}}
						showScrollIndicator
					/>
				</box>

				<box style={{ marginTop: 1 }}>
					<text fg="#666">↑↓ Navigate • Enter Select • ESC Back</text>
				</box>
			</box>
		);
	}

	// Step: select-model
	const popularProviders = [
		"anthropic",
		"openai",
		"google",
		"meta-llama",
		"deepseek",
		"x-ai",
		"qwen",
	];

	let filteredModels = models;
	if (filter === "popular") {
		filteredModels = models.filter((model) =>
			popularProviders.some((provider) => model.id.startsWith(provider + "/"))
		);
	} else if (filter === "anthropic") {
		filteredModels = models.filter((model) => model.id.startsWith("anthropic/"));
	} else if (filter === "openai") {
		filteredModels = models.filter((model) => model.id.startsWith("openai/"));
	}

	// Sort by context length (descending) to show most capable models first
	filteredModels = [...filteredModels].sort((a, b) => b.context_length - a.context_length);

	// Limit to 100 models max to avoid rendering issues
	const displayModels = filteredModels.slice(0, 100);

	const modelOptions: SelectOption[] = displayModels.map((model) => ({
		name: model.id,
		description: formatModelForDisplay(model),
		value: model.id,
	}));

	const filterLabel =
		filter === "popular"
			? "Popular"
			: filter === "anthropic"
				? "Anthropic"
				: filter === "openai"
					? "OpenAI"
					: "All";

	return (
		<box
			style={{
				flexDirection: "column",
				width: Math.min(100, width - 4),
				height: height - 4,
				padding: 2,
			}}
		>
			<box style={{ marginBottom: 1, flexDirection: "column" }}>
				<text
					style={{
						attributes: TextAttributes.BOLD,
						fg: "#00D9FF",
					}}
				>
					Select Model
				</text>
				<text fg="#888">
					{filterLabel}:{" "}
					{displayModels.length < filteredModels.length
						? `Top ${displayModels.length} of ${filteredModels.length}`
						: `${displayModels.length} models`}
				</text>
			</box>

			<box style={{ border: true, height: height - 10 }}>
				<select
					style={{ height: height - 12 }}
					options={modelOptions}
					focused={true}
					onChange={(_, option) => {
						if (option) {
							handleModelSelect(option.value);
						}
					}}
					showScrollIndicator
				/>
			</box>

			<box style={{ marginTop: 1 }}>
				<text fg="#666">↑↓ Navigate • Enter Select • ESC Back</text>
			</box>
		</box>
	);
}
