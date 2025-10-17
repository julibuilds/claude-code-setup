import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { Table, useThemeColors, type Column } from "@repo/tui";
import { useCallback, useState } from "react";
import type { Config, Provider } from "../types/config";

interface ProviderManagerProps {
  config: Config | null;
  pendingChanges: Partial<Config>;
  onConfigChange: (changes: Partial<Config>) => void;
  focused: boolean;
}

export function ProviderManager({
  config,
  pendingChanges,
  onConfigChange,
  focused,
}: ProviderManagerProps) {
  const colors = useThemeColors();

  const [selectedProviderIndex, setSelectedProviderIndex] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editField, setEditField] = useState<keyof Provider | null>(null);
  const [editValue, setEditValue] = useState("");

  const providers = pendingChanges.Providers || config?.Providers || [];

  const handleEdit = useCallback(
    (field: keyof Provider) => {
      const provider = providers[selectedProviderIndex];
      if (!provider) return;

      setEditField(field);
      setEditValue(String(provider[field] || ""));
      setEditMode(true);
    },
    [providers, selectedProviderIndex]
  );

  const handleSaveEdit = useCallback(() => {
    if (!editField || editValue === "") return;

    const updatedProviders = [...providers];
    const provider = updatedProviders[selectedProviderIndex];

    if (provider) {
      if (editField === "models") {
        // Handle models array
        provider.models = editValue
          .split(",")
          .map((m) => m.trim())
          .filter(Boolean);
      } else if (editField === "transformer") {
        // Handle transformer object
        try {
          provider.transformer = JSON.parse(editValue);
        } catch {
          provider.transformer = {
            use: editValue
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
          };
        }
      } else {
        // Handle string fields
        (provider as Record<string, unknown>)[editField] = editValue;
      }
    }

    onConfigChange({
      ...pendingChanges,
      Providers: updatedProviders,
    });

    setEditMode(false);
    setEditField(null);
    setEditValue("");
  }, [
    editField,
    editValue,
    providers,
    selectedProviderIndex,
    pendingChanges,
    onConfigChange,
  ]);

  const handleCancelEdit = useCallback(() => {
    setEditMode(false);
    setEditField(null);
    setEditValue("");
  }, []);

  const handleAddProvider = useCallback(() => {
    const newProvider: Provider = {
      name: "new-provider",
      api_base_url: "https://api.example.com/v1",
      api_key: "your-api-key",
      models: [],
      transformer: { use: [] },
    };

    const updatedProviders = [...providers, newProvider];
    onConfigChange({
      ...pendingChanges,
      Providers: updatedProviders,
    });

    setSelectedProviderIndex(updatedProviders.length - 1);
  }, [providers, pendingChanges, onConfigChange]);

  const handleDeleteProvider = useCallback(() => {
    if (providers.length <= 1) return; // Keep at least one provider

    const updatedProviders = providers.filter(
      (_, index) => index !== selectedProviderIndex
    );
    onConfigChange({
      ...pendingChanges,
      Providers: updatedProviders,
    });

    setSelectedProviderIndex(Math.max(0, selectedProviderIndex - 1));
  }, [providers, selectedProviderIndex, pendingChanges, onConfigChange]);

  useKeyboard((evt) => {
    if (!focused) return;

    if (editMode) {
      if (evt.name === "return") {
        handleSaveEdit();
      } else if (evt.name === "escape") {
        handleCancelEdit();
      } else if (evt.name === "backspace") {
        setEditValue((prev) => prev.slice(0, -1));
      } else if (evt.name && evt.name.length === 1) {
        setEditValue((prev) => prev + evt.name);
      }
    } else {
      if (evt.name === "up") {
        setSelectedProviderIndex((prev) => Math.max(0, prev - 1));
      } else if (evt.name === "down") {
        setSelectedProviderIndex((prev) =>
          Math.min(providers.length - 1, prev + 1)
        );
      } else if (evt.name === "return") {
        handleEdit("name");
      } else if (evt.name === "n") {
        handleAddProvider();
      } else if (evt.name === "d" && providers.length > 1) {
        handleDeleteProvider();
      } else if (evt.name === "1") {
        handleEdit("name");
      } else if (evt.name === "2") {
        handleEdit("api_base_url");
      } else if (evt.name === "3") {
        handleEdit("api_key");
      } else if (evt.name === "4") {
        handleEdit("models");
      } else if (evt.name === "5") {
        handleEdit("transformer");
      }
    }
  });

  const columns: Column<Provider>[] = [
    {
      id: "name",
      label: "Provider Name",
      style: { width: 20 },
      cell: (provider, isSelected) => (
        <text
          fg={isSelected ? colors.accent.primary : colors.text.primary}
          attributes={isSelected ? TextAttributes.BOLD : undefined}
        >
          {provider.name}
        </text>
      ),
    },
    {
      id: "api_base_url",
      label: "API Base URL",
      style: { width: 35 },
      cell: (provider, isSelected) => (
        <text fg={isSelected ? colors.accent.primary : colors.text.secondary}>
          {provider.api_base_url.length > 32
            ? `${provider.api_base_url.slice(0, 29)}...`
            : provider.api_base_url}
        </text>
      ),
    },
    {
      id: "models",
      label: "Models",
      style: { width: 15 },
      cell: (provider, isSelected) => (
        <text fg={isSelected ? colors.accent.primary : colors.text.secondary}>
          {provider.models.length} model(s)
        </text>
      ),
    },
    {
      id: "status",
      label: "Status",
      style: { width: 10 },
      cell: (provider, isSelected) => {
        const hasApiKey =
          provider.api_key && provider.api_key !== "your-api-key";
        return (
          <text
            fg={hasApiKey ? colors.accent.secondary : colors.accent.primary}
          >
            {hasApiKey ? "✓ Ready" : "⚠ Setup"}
          </text>
        );
      },
    },
  ];

  return (
    <box flexGrow={1} flexDirection="column" style={{ gap: 1 }}>
      {/* Header */}
      <box style={{ gap: 2 }}>
        <text fg={colors.text.primary} attributes={TextAttributes.BOLD}>
          Provider Configuration
        </text>
        <text fg={colors.text.muted}>
          ({providers.length} provider{providers.length !== 1 ? "s" : ""})
        </text>
      </box>

      {/* Providers Table */}
      <box border title="Providers" flexGrow={1}>
        {providers.length === 0 ? (
          <box alignItems="center" justifyContent="center" flexGrow={1}>
            <text fg={colors.text.muted}>No providers configured</text>
          </box>
        ) : (
          <Table
            columns={columns}
            data={providers}
            selectedIndex={selectedProviderIndex}
            getItemKey={(provider, index) => `${provider.name}-${index}`}
            renderSelectionIndicator={(isSelected) => (
              <text fg={isSelected ? colors.accent.primary : colors.text.muted}>
                {isSelected ? "▶" : " "}
              </text>
            )}
          />
        )}
      </box>

      {/* Provider Details */}
      {providers[selectedProviderIndex] && (
        <box border title="Provider Details" style={{ height: 12, padding: 1 }}>
          <box flexDirection="column" style={{ gap: 0 }}>
            {editMode && editField ? (
              <box flexDirection="column">
                <text fg={colors.accent.primary}>Editing {editField}:</text>
                <text fg={colors.text.primary}>{editValue}|</text>
                <text fg={colors.text.muted}>Enter: Save • Escape: Cancel</text>
              </box>
            ) : (
              <>
                <text fg={colors.text.muted}>
                  {`[1] Name: ${providers[selectedProviderIndex].name}`}
                </text>
                <text fg={colors.text.muted}>
                  {`[2] URL: ${providers[selectedProviderIndex].api_base_url}`}
                </text>
                <text fg={colors.text.muted}>
                  {`[3] Key: ${providers[selectedProviderIndex].api_key.replace(/./g, "*")}`}
                </text>
                <text fg={colors.text.muted}>
                  {`[4] Models: ${providers[selectedProviderIndex].models.join(", ") || "None"}`}
                </text>
                <text fg={colors.text.muted}>
                  {`[5] Transformers: ${providers[selectedProviderIndex].transformer.use.join(", ") || "None"}`}
                </text>
              </>
            )}
          </box>
        </box>
      )}

      {/* Help */}
      <box style={{ paddingTop: 1 }}>
        <text fg={colors.text.muted}>
          ↑↓: Select • 1-5: Edit Field • N: New Provider • D: Delete • Enter:
          Edit Name
        </text>
      </box>
    </box>
  );
}