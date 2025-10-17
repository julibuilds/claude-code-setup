import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { Table, useThemeColors, type Column } from "@repo/tui";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ROUTER_TYPES, type RouterType } from "../constants";
import type { Config, OpenRouterModel } from "../types/config";
import { processModels, filterModels, sortModels, type ProcessedModel } from "../utils/model-processing";

import { SearchInput } from "./SearchInput";

interface ModelBrowserProps {
  models: OpenRouterModel[];
  loading: boolean;
  config: Config | null;
  pendingChanges: Partial<Config>;
  onConfigChange: (changes: Partial<Config>) => void;
  focused: boolean;
}

type FilterType =
  | "all"
  | "anthropic"
  | "openai"
  | "popular"
  | "reasoning"
  | "multimodal";
type SortType = "name" | "context" | "cost" | "provider";

export function ModelBrowser({
  models,
  loading,
  config,
  pendingChanges,
  onConfigChange,
  focused,
}: ModelBrowserProps) {
  const colors = useThemeColors();

  const [selectedRouter, setSelectedRouter] = useState<RouterType>(
    ROUTER_TYPES.DEFAULT
  );
  const [selectedModelIndex, setSelectedModelIndex] = useState(0);
  const [filter, setFilter] = useState<FilterType>("popular");
  const [sort, setSort] = useState<SortType>("context");
  const [searchText, setSearchText] = useState("");
  const [focusArea, setFocusArea] = useState<
    "router" | "filter" | "sort" | "search" | "models"
  >("models");

  // Process and filter models using clean utility functions
  const processedModels = useMemo(() => processModels(models), [models]);
  
  const filteredAndSortedModels = useMemo(() => {
    const filtered = filterModels(processedModels, filter, searchText);
    return sortModels(filtered, sort);
  }, [processedModels, filter, searchText, sort]);

  // Reset selection when filtered models change
  useEffect(() => {
    setSelectedModelIndex(0);
  }, [filteredAndSortedModels.length]);

  const handleModelSelect = useCallback(() => {
    const selectedModel = filteredAndSortedModels[selectedModelIndex];
    if (!selectedModel || !config) return;

    const newRouter = {
      ...config.Router,
      [selectedRouter]: selectedModel.id,
    };

    onConfigChange({
      ...pendingChanges,
      Router: newRouter,
    });
  }, [
    selectedModelIndex,
    filteredAndSortedModels,
    selectedRouter,
    config,
    pendingChanges,
    onConfigChange,
  ]);

  useKeyboard((evt) => {
    if (!focused) return;

    if (evt.name === "return") {
      if (focusArea === "models") {
        handleModelSelect();
      }
    } else if (evt.name === "tab") {
      setFocusArea((prev) => {
        const areas: (typeof focusArea)[] = [
          "router",
          "filter",
          "sort",
          "search",
          "models",
        ];
        const currentIndex = areas.indexOf(prev);
        return areas[(currentIndex + 1) % areas.length] as typeof focusArea;
      });
    } else if (focusArea === "models") {
      if (evt.name === "up") {
        setSelectedModelIndex((prev) => Math.max(0, prev - 1));
      } else if (evt.name === "down") {
        setSelectedModelIndex((prev) =>
          Math.min(filteredAndSortedModels.length - 1, prev + 1)
        );
      }
    } else if (focusArea === "router") {
      const routers = Object.values(ROUTER_TYPES);
      const currentIndex = routers.indexOf(selectedRouter);
      if (evt.name === "left") {
        const newRouter = routers[Math.max(0, currentIndex - 1)];
        if (newRouter) setSelectedRouter(newRouter);
      } else if (evt.name === "right") {
        const newRouter = routers[Math.min(routers.length - 1, currentIndex + 1)];
        if (newRouter) setSelectedRouter(newRouter);
      }
    } else if (focusArea === "filter") {
      const filters: FilterType[] = [
        "all",
        "popular",
        "anthropic",
        "openai",
        "reasoning",
        "multimodal",
      ];
      const currentIndex = filters.indexOf(filter);
      if (evt.name === "left") {
        const newFilter = filters[Math.max(0, currentIndex - 1)];
        if (newFilter) setFilter(newFilter);
      } else if (evt.name === "right") {
        const newFilter = filters[Math.min(filters.length - 1, currentIndex + 1)];
        if (newFilter) setFilter(newFilter);
      }
    } else if (focusArea === "sort") {
      const sorts: SortType[] = ["context", "name", "cost", "provider"];
      const currentIndex = sorts.indexOf(sort);
      if (evt.name === "left") {
        const newSort = sorts[Math.max(0, currentIndex - 1)];
        if (newSort) setSort(newSort);
      } else if (evt.name === "right") {
        const newSort = sorts[Math.min(sorts.length - 1, currentIndex + 1)];
        if (newSort) setSort(newSort);
      }
    }
  });

  const columns: Column<ProcessedModel>[] = [
    {
      id: "name",
      label: "Model Name",
      style: { width: 30 },
      cell: (model, isSelected) => {
        const name = String(model?.name || "Unknown");
        return (
          <text
            fg={isSelected ? colors.accent.primary : colors.text.primary}
            attributes={isSelected ? TextAttributes.BOLD : undefined}
          >
            {name.length > 27 ? `${name.slice(0, 24)}...` : name}
          </text>
        );
      },
    },
    {
      id: "provider",
      label: "Provider",
      style: { width: 10 },
      cell: (model, isSelected) => (
        <text fg={isSelected ? colors.accent.primary : colors.text.secondary}>
          {String(model?.provider || "unknown")}
        </text>
      ),
    },
    {
      id: "context",
      label: "Context",
      style: { width: 8, align: "flex-end" },
      cell: (model, isSelected) => (
        <text fg={isSelected ? colors.accent.primary : colors.text.secondary}>
          {String(((model?.context_length || 0) / 1000).toFixed(0))}K
        </text>
      ),
    },
    {
      id: "cost",
      label: "$/1M tok",
      style: { width: 8, align: "flex-end" },
      cell: (model, isSelected) => (
        <text fg={isSelected ? colors.accent.primary : colors.text.secondary}>
          ${String((model?.costPerMToken || 0).toFixed(2))}
        </text>
      ),
    },
    {
      id: "features",
      label: "Features",
      style: { width: 8 },
      cell: (model, isSelected) => (
        <text fg={isSelected ? colors.accent.primary : colors.text.secondary}>
          {model?.isReasoning ? "🧠" : ""}
          {model?.isMultimodal ? "👁️" : ""}
        </text>
      ),
    },
  ];

  const getCurrentValue = (routerType: RouterType): string => {
    const pendingRouter = pendingChanges.Router?.[routerType];
    if (pendingRouter) return pendingRouter;
    return config?.Router[routerType] || "Not set";
  };

  if (loading) {
    return (
      <box style={{ alignItems: "center", justifyContent: "center" }} flexGrow={1}>
        <text fg={colors.text.muted}>Loading models...</text>
      </box>
    );
  }

  return (
    <box flexGrow={1} flexDirection="column" style={{ gap: 1 }}>
      {/* Controls */}
      <box style={{ gap: 1, flexShrink: 0 }}>
        {/* Router Selection */}
        <box border title="Router Type" style={{ width: 18, padding: 1, height: 6 }}>
          <scrollbox>
            <box flexDirection="column">
              {Object.values(ROUTER_TYPES).map((router) => (
                <text
                  key={router}
                  fg={
                    router === selectedRouter
                      ? focusArea === "router"
                        ? colors.accent.primary
                        : colors.accent.secondary
                      : colors.text.muted
                  }
                  attributes={
                    router === selectedRouter ? TextAttributes.BOLD : undefined
                  }
                >
                  {router === selectedRouter ? "▶ " : "  "}
                  {router}
                </text>
              ))}
            </box>
          </scrollbox>
        </box>

        {/* Filter */}
        <box border title="Filter" style={{ width: 12, padding: 1, height: 3 }}>
          <text
            fg={
              focusArea === "filter"
                ? colors.accent.primary
                : colors.text.secondary
            }
            attributes={
              focusArea === "filter" ? TextAttributes.BOLD : undefined
            }
          >
            {filter}
          </text>
        </box>

        {/* Sort */}
        <box border title="Sort By" style={{ width: 10, padding: 1, height: 3 }}>
          <text
            fg={
              focusArea === "sort"
                ? colors.accent.primary
                : colors.text.secondary
            }
            attributes={focusArea === "sort" ? TextAttributes.BOLD : undefined}
          >
            {sort}
          </text>
        </box>

        {/* Search */}
        <box border title="Search" style={{ width: 18, padding: 1, height: 3 }}>
          <SearchInput
            value={searchText}
            onChange={setSearchText}
            placeholder="Search models..."
            focused={focusArea === "search"}
          />
        </box>

        {/* Current Assignment */}
        <box border title="Current" flexGrow={1} style={{ padding: 1, height: 3 }}>
          <text fg={colors.text.muted}>
            {selectedRouter}: {getCurrentValue(selectedRouter)}
          </text>
        </box>
      </box>

      {/* Models Table */}
      <box border title={`Models (${filteredAndSortedModels.length})`} flexGrow={1} style={{ minHeight: 10 }}>
        {filteredAndSortedModels.length === 0 ? (
          <box style={{ alignItems: "center", justifyContent: "center" }} flexGrow={1}>
            <text fg={colors.text.muted}>No models found</text>
          </box>
        ) : (
          <Table
            columns={columns}
            data={filteredAndSortedModels}
            selectedIndex={
              focusArea === "models" ? selectedModelIndex : undefined
            }
            getItemKey={(model, index) => `${model.id}-${index}`}
            renderSelectionIndicator={(isSelected) => (
              <text fg={isSelected ? colors.accent.primary : colors.text.muted}>
                {isSelected ? "▶" : " "}
              </text>
            )}
          />
        )}
      </box>

      {/* Help */}
      <box style={{ paddingTop: 1, flexShrink: 0 }}>
        <text fg={colors.text.muted}>
          Tab: Switch • ←→: Navigate • ↑↓: Select Model • Enter: Assign • Focus:{" "}
          {focusArea}
        </text>
      </box>
    </box>
  );
}
