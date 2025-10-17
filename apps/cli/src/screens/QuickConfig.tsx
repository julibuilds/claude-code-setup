import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { Select, type SelectOption, useThemeColors } from "@repo/tui";
import { useCallback, useEffect, useState } from "react";
import {
  FILTER_TYPES,
  type FilterType,
  ROUTER_TYPES,
  type RouterType,
} from "../constants";
import { useConfig } from "../context/ConfigContext";
import type { Config, OpenRouterModel } from "../types/config";
import {
  fetchOpenRouterModels,
  filterAnthropicModels,
  filterOpenAIModels,
} from "../utils/openrouter";

interface QuickConfigProps {
  onBack: () => void;
}

type FocusArea = "router" | "filter" | "models";

export function QuickConfig({ onBack }: QuickConfigProps) {
  const colors = useThemeColors();
  const { config, updateConfig } = useConfig();

  const [focusArea, setFocusArea] = useState<FocusArea>("router");
  const [selectedRouter, setSelectedRouter] = useState<RouterType>(
    ROUTER_TYPES.DEFAULT
  );
  const [selectedFilter, setSelectedFilter] = useState<FilterType>(
    FILTER_TYPES.POPULAR
  );
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [filteredModels, setFilteredModels] = useState<OpenRouterModel[]>([]);
  const [selectedModelIndex, setSelectedModelIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pendingChanges, setPendingChanges] = useState<
    Partial<Record<RouterType, string>>
  >({});
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        setLoading(true);
        const fetchedModels = await fetchOpenRouterModels();
        setModels(fetchedModels);
      } finally {
        setLoading(false);
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    let filtered = models;

    if (selectedFilter === FILTER_TYPES.ANTHROPIC) {
      filtered = filterAnthropicModels(models);
    } else if (selectedFilter === FILTER_TYPES.OPENAI) {
      filtered = filterOpenAIModels(models);
    } else if (selectedFilter === FILTER_TYPES.POPULAR) {
      const popularProviders = [
        "anthropic",
        "openai",
        "google",
        "meta-llama",
        "deepseek",
      ];
      filtered = models.filter((m) =>
        popularProviders.some((p) => m.id.toLowerCase().includes(p))
      );
    }

    setFilteredModels(filtered);
    setSelectedModelIndex(0);
  }, [models, selectedFilter]);

  const handleSave = useCallback(async () => {
    if (!config || Object.keys(pendingChanges).length === 0) return;

    try {
      setSaveMessage(null);

      const updatedConfig: Config = {
        ...config,
        Router: {
          ...config.Router,
          ...pendingChanges,
        },
      };

      await updateConfig(updatedConfig);
      setPendingChanges({});
      setSaveMessage("✓ Configuration saved successfully");

      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      setSaveMessage(
        `✗ Failed to save: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  }, [config, pendingChanges, updateConfig]);

  const handleReset = useCallback(() => {
    setPendingChanges({});
    setSaveMessage("Changes reset");
    setTimeout(() => setSaveMessage(null), 2000);
  }, []);

  const handleForceRefresh = useCallback(async () => {
    try {
      setLoading(true);
      setSaveMessage("Refreshing models...");
      const fetchedModels = await fetchOpenRouterModels(false);
      setModels(fetchedModels);
      setSaveMessage("✓ Models refreshed");
      setTimeout(() => setSaveMessage(null), 2000);
    } catch (err) {
      setSaveMessage(
        `✗ Refresh failed: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useKeyboard((evt) => {
    if (evt.name === "escape") {
      onBack();
    } else if (evt.name === "tab") {
      setFocusArea((prev) => {
        if (prev === "router") return "filter";
        if (prev === "filter") return "models";
        return "router";
      });
    } else if (evt.ctrl && evt.name === "s") {
      handleSave();
    } else if (evt.ctrl && evt.name === "r") {
      handleReset();
    } else if (evt.ctrl && evt.name === "f") {
      handleForceRefresh();
    } else if (evt.name === "return" && focusArea === "models") {
      const selectedModel = filteredModels[selectedModelIndex];
      if (selectedModel) {
        setPendingChanges((prev) => ({
          ...prev,
          [selectedRouter]: selectedModel.id,
        }));
      }
    }
  });

  const routerOptions: SelectOption[] = [
    { title: "Default Router", value: ROUTER_TYPES.DEFAULT, label: "Primary" },
    {
      title: "Background Router",
      value: ROUTER_TYPES.BACKGROUND,
      label: "Background",
    },
    { title: "Think Router", value: ROUTER_TYPES.THINK, label: "Reasoning" },
    {
      title: "Long Context Router",
      value: ROUTER_TYPES.LONG_CONTEXT,
      label: "Large ctx",
    },
  ];

  const filterOptions: SelectOption[] = [
    { title: "Popular", value: FILTER_TYPES.POPULAR, label: "Top" },
    { title: "Anthropic", value: FILTER_TYPES.ANTHROPIC, label: "Claude" },
    { title: "OpenAI", value: FILTER_TYPES.OPENAI, label: "GPT" },
    { title: "All Models", value: FILTER_TYPES.ALL, label: "All" },
  ];

  const modelOptions: SelectOption[] = filteredModels.map((m) => ({
    title: m.name,
    value: m.id,
    label: `${m.context_length.toLocaleString()}`,
  }));

  const getCurrentValue = (routerType: RouterType): string => {
    if (pendingChanges[routerType]) {
      return pendingChanges[routerType];
    }
    return config?.Router[routerType] || "Not set";
  };

  const hasPendingChange = (routerType: RouterType): boolean => {
    return routerType in pendingChanges;
  };

  return (
    <box flexGrow={1} flexDirection="column" style={{ padding: 1 }}>
      <box style={{ paddingBottom: 1 }}>
        <text fg={colors.accent.primary} attributes={TextAttributes.BOLD}>
          ⚙️ Quick Config
        </text>
      </box>

      <box flexGrow={1} style={{ gap: 1 }}>
        <box flexDirection="column" style={{ width: 40, gap: 1 }}>
          <box border title="Router Type" height={8}>
            {focusArea === "router" && (
              <Select
                options={routerOptions}
                selected={Object.values(ROUTER_TYPES).indexOf(selectedRouter)}
                onChange={(value) => {
                  setSelectedRouter(value as RouterType);
                }}
                onNavigate={(index) => {
                  setSelectedRouter(
                    Object.values(ROUTER_TYPES)[index] as RouterType
                  );
                }}
                showIndicator
                height={6}
              />
            )}
          </box>

          <box border title="Filter" height={8}>
            {focusArea === "filter" && (
              <Select
                options={filterOptions}
                selected={Object.values(FILTER_TYPES).indexOf(selectedFilter)}
                onChange={(value) => {
                  setSelectedFilter(value as FilterType);
                }}
                onNavigate={(index) => {
                  setSelectedFilter(
                    Object.values(FILTER_TYPES)[index] as FilterType
                  );
                }}
                showIndicator
                height={6}
              />
            )}
          </box>

          <box
            border
            title="Current Configuration"
            flexGrow={1}
            flexDirection="column"
            style={{ padding: 1 }}
          >
            {Object.values(ROUTER_TYPES).map((routerType) => {
              const value = getCurrentValue(routerType);
              const isPending = hasPendingChange(routerType);
              return (
                <box
                  key={routerType}
                  flexDirection="column"
                  style={{ paddingBottom: 1 }}
                >
                  <text fg={colors.text.muted}>{routerType}:</text>
                  <text
                    fg={
                      isPending ? colors.accent.secondary : colors.text.primary
                    }
                    attributes={isPending ? TextAttributes.BOLD : 0}
                  >
                    {isPending ? "* " : "  "}
                    {value}
                  </text>
                </box>
              );
            })}
          </box>
        </box>

        <box border title={`Models (${filteredModels.length})`} flexGrow={1}>
          {loading ? (
            <box alignItems="center" justifyContent="center" flexGrow={1}>
              <text fg={colors.text.muted}>Loading models...</text>
            </box>
          ) : focusArea === "models" ? (
            <Select
              options={modelOptions}
              selected={selectedModelIndex}
              onNavigate={(index) => setSelectedModelIndex(index)}
              showIndicator
            />
          ) : null}
        </box>
      </box>

      <box style={{ paddingTop: 1, flexDirection: "column", gap: 0 }}>
        {saveMessage && (
          <box style={{ paddingBottom: 1 }}>
            <text
              fg={
                saveMessage.startsWith("✓")
                  ? colors.accent.secondary
                  : colors.accent.primary
              }
            >
              {saveMessage}
            </text>
          </box>
        )}
        <box style={{ gap: 2 }}>
          <text fg={colors.text.muted}>
            Tab: Switch • Enter: Select • Ctrl+S: Save • Ctrl+R: Reset • ESC:
            Back
          </text>
        </box>
        {Object.keys(pendingChanges).length > 0 && (
          <box style={{ paddingTop: 1 }}>
            <text fg={colors.accent.secondary} attributes={TextAttributes.BOLD}>
              * {Object.keys(pendingChanges).length} pending change(s) - Press
              Ctrl+S to save
            </text>
          </box>
        )}
      </box>
    </box>
  );
}
