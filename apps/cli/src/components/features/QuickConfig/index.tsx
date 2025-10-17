import { type SelectOption, TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
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
import { StatusBox, useComponentStyles, useThemeColors } from "@repo/tui";
import { useResponsiveLayout } from "../../../hooks/useResponsiveLayout";
import { Header } from "../../layout/Header";
import { Footer } from "../../layout/Footer";
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
  const { width, height, isNarrow } = useResponsiveLayout();
  const { config, updateConfig } = useConfig();
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const colors = useThemeColors();
  const componentStyles = useComponentStyles();

  // UI State
  const [focusedPanel, setFocusedPanel] = useState<FocusedPanel>("router-type");
  const [selectedRouterType, setSelectedRouterType] =
    useState<RouterKey>("default");
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
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load models";
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
          const openrouterProvider = newConfig.Providers.find(
            (p) => p.name === "openrouter"
          );
          if (
            openrouterProvider &&
            !openrouterProvider.models.includes(modelId)
          ) {
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
  
  // Calculate panel heights based on layout mode
  const getPanelHeights = () => {
    const headerFooterSpace = isNarrow ? 12 : 16;
    const availableHeight = Math.max(20, height - headerFooterSpace);
    
    if (isNarrow) {
      // Narrow: compact layout with minimal heights
      return {
        routerType: Math.max(6, Math.floor(availableHeight * 0.2)),
        filter: Math.max(6, Math.floor(availableHeight * 0.2)),
        modelList: Math.max(10, Math.floor(availableHeight * 0.6)),
      };
    }
    
    // Wide/Medium: more breathing room
    return {
      routerType: Math.max(8, Math.floor(availableHeight * 0.25)),
      filter: Math.max(8, Math.floor(availableHeight * 0.25)),
      modelList: Math.max(12, Math.floor(availableHeight * 0.5)),
    };
  };

  const panelHeights = getPanelHeights();
  const containerPadding = isNarrow ? 1 : 2;
  const containerWidth = Math.min(isNarrow ? width - 2 : 120, width - 4);

  return (
    <box
      style={{
        border: true,
        borderStyle: componentStyles.panel.borderStyle,
        borderColor: colors.border.default,
        backgroundColor: componentStyles.panel.backgroundColor,
        padding: containerPadding,
        flexDirection: "column",
        width: containerWidth,
        height: height - 4,
      }}
    >
      <Header
        icon="⚡"
        title="Quick Config"
        subtitle={isNarrow ? "Configure router models" : "Configure all router models • Tab to switch panels"}
        status={hasChanges ? "warning" : "success"}
        statusText={
          hasChanges
            ? `✓ ${Object.keys(pendingChanges).length} pending change${Object.keys(pendingChanges).length > 1 ? 's' : ''}`
            : "✓ All changes saved"
        }
        compact={isNarrow}
      />

      {/* Vertical stacked layout for all screen sizes */}
      <box
        style={{
          flexDirection: "column",
          gap: isNarrow ? 1 : 2,
          flexGrow: 1,
        }}
      >
        {/* Step 1: Router Type Selection */}
        <box style={{ flexDirection: "column" }}>
          <text
            style={{
              fg: colors.text.muted,
              marginBottom: 0.5,
              attributes: TextAttributes.BOLD,
            }}
          >
            STEP 1: SELECT ROUTER TYPE
          </text>
          <RouterTypePanel
            focused={focusedPanel === "router-type"}
            selectedRouterType={selectedRouterType}
            routerTypeOptions={routerTypeOptions}
            onSelect={(type) => setSelectedRouterType(type as RouterKey)}
            height={panelHeights.routerType}
          />
        </box>

        {/* Step 2: Filter Models */}
        <box style={{ flexDirection: "column" }}>
          <text
            style={{
              fg: colors.text.muted,
              marginBottom: 0.5,
              attributes: TextAttributes.BOLD,
            }}
          >
            STEP 2: FILTER MODELS
          </text>
          <FilterPanel
            focused={focusedPanel === "filter"}
            filter={filter}
            filterOptions={filterOptions}
            onSelect={(f) => setFilter(f as FilterType)}
            height={panelHeights.filter}
          />
        </box>

        {/* Step 3: Select Model */}
        <box style={{ flexDirection: "column" }}>
          <text
            style={{
              fg: colors.text.muted,
              marginBottom: 0.5,
              attributes: TextAttributes.BOLD,
            }}
          >
            STEP 3: SELECT MODEL
          </text>
          <ModelListPanel
            focused={focusedPanel === "model-list"}
            modelOptions={modelOptions}
            onSelect={handleModelSelect}
            height={panelHeights.modelList}
            modelCount={displayModels.length}
            totalCount={filteredModels.length}
          />
        </box>
      </box>

      {/* Error Display - Show prominently at top of footer area */}
      {error && (
        <box style={{ marginTop: 1 }}>
          <StatusBox
            status="error"
            message={error}
            details="Failed to load or save configuration"
          />
        </box>
      )}

      {/* Footer with shortcuts and pending changes warning */}
      <box style={{ flexDirection: "column", width: "100%" }}>
        <PendingChangesBox changes={pendingChanges} />
        <Footer
          shortcuts={
            isNarrow
              ? [
                  { keys: "Tab", description: "Switch", category: "Nav" },
                  { keys: "↑/↓", description: "Navigate", category: "Nav" },
                  { keys: "Enter", description: "Select", category: "Nav" },
                  { keys: "Ctrl+S", description: "Save", category: "Actions" },
                  { keys: "ESC", description: "Back", category: "Actions" },
                ]
              : [
                  {
                    keys: "Tab",
                    description: "Switch panels",
                    category: "Navigation",
                  },
                  { keys: "↑/↓", description: "Navigate list", category: "Navigation" },
                  { keys: "Enter", description: "Select", category: "Navigation" },
                  { keys: "Ctrl+S", description: "Save", category: "Actions" },
                  { keys: "Ctrl+R", description: "Reset", category: "Actions" },
                  { keys: "Ctrl+F", description: "Refresh", category: "Actions" },
                  { keys: "ESC", description: "Back", category: "General" },
                ]
          }
          groupByCategory={!isNarrow}
          compact={isNarrow}
        />
      </box>
    </box>
  );
}
