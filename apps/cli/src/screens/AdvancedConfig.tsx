import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { Tabs, useThemeColors } from "@repo/tui";
import { useCallback, useEffect, useState } from "react";

import { useConfig } from "../context/ConfigContext";
import type { Config, OpenRouterModel } from "../types/config";
import { fetchOpenRouterModels } from "../utils/openrouter";
import { ModelBrowser } from "../components/ModelBrowser";
import { ProviderManager } from "../components/ProviderManager";
import { ConfigSummary } from "../components/ConfigSummary";

interface AdvancedConfigProps {
  onBack: () => void;
}

type TabId = "models" | "providers" | "summary";

export function AdvancedConfig({ onBack }: AdvancedConfigProps) {
  const colors = useThemeColors();
  const { config, updateConfig } = useConfig();

  const [activeTab, setActiveTab] = useState<TabId>("models");
  const [tabsFocused, setTabsFocused] = useState(true);
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingChanges, setPendingChanges] = useState<Partial<Config>>({});
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        setLoading(true);
        setModels([]); // Start with empty array

        // Try to load models - let the processing utility handle validation
        const fetchedModels = await fetchOpenRouterModels();
        setModels(fetchedModels || []);
      } catch (error) {
        console.error("Failed to load models:", error);
        setModels([]);
        setSaveMessage("⚠ Failed to load models - using offline mode");
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to ensure UI is ready
    setTimeout(loadModels, 100);
  }, []);

  const handleSave = useCallback(async () => {
    if (!config || Object.keys(pendingChanges).length === 0) return;

    try {
      setSaveMessage(null);
      const updatedConfig: Config = {
        ...config,
        ...pendingChanges,
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

  useKeyboard((evt) => {
    if (evt.name === "escape") {
      onBack();
    } else if (evt.name === "tab") {
      setTabsFocused((prev) => !prev);
    } else if (evt.ctrl && evt.name === "s") {
      handleSave();
    } else if (evt.ctrl && evt.name === "r") {
      handleReset();
    }
  });

  const tabs = [
    {
      id: "models" as const,
      label: "Model Configuration",
      icon: "🤖",
      content: (() => {
        try {
          return (
            <ModelBrowser
              models={models || []}
              loading={loading}
              config={config}
              pendingChanges={pendingChanges}
              onConfigChange={setPendingChanges}
              focused={!tabsFocused}
            />
          );
        } catch (error) {
          console.error("ModelBrowser error:", error);
          return (
            <box alignItems="center" justifyContent="center" flexGrow={1}>
              <text fg={colors.accent.primary}>
                {`Error loading model browser: ${error instanceof Error ? error.message : "Unknown error"}`}
              </text>
            </box>
          );
        }
      })(),
    },
    {
      id: "providers" as const,
      label: "Provider Settings",
      icon: "�",
      content: (() => {
        try {
          return (
            <ProviderManager
              config={config}
              pendingChanges={pendingChanges}
              onConfigChange={setPendingChanges}
              focused={!tabsFocused}
            />
          );
        } catch (error) {
          console.error("ProviderManager error:", error);
          return (
            <box alignItems="center" justifyContent="center" flexGrow={1}>
              <text fg={colors.accent.primary}>
                {`Error loading provider manager: ${error instanceof Error ? error.message : "Unknown error"}`}
              </text>
            </box>
          );
        }
      })(),
    },
    {
      id: "summary" as const,
      label: "Configuration Summary",
      icon: "📋",
      content: (() => {
        try {
          return (
            <ConfigSummary
              config={config}
              pendingChanges={pendingChanges}
              focused={!tabsFocused}
            />
          );
        } catch (error) {
          console.error("ConfigSummary error:", error);
          return (
            <box alignItems="center" justifyContent="center" flexGrow={1}>
              <text fg={colors.accent.primary}>
                {`Error loading config summary: ${error instanceof Error ? error.message : "Unknown error"}`}
              </text>
            </box>
          );
        }
      })(),
    },
  ];

  return (
    <box flexGrow={1} flexDirection="column" style={{ padding: 1 }}>
      {/* Header */}
      <box style={{ paddingBottom: 1 }}>
        <text fg={colors.accent.primary} attributes={TextAttributes.BOLD}>
          ⚙️ Advanced Configuration
        </text>
      </box>

      {/* Main Content */}
      <box flexGrow={1}>
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(tabId) => setActiveTab(tabId as TabId)}
          focused={tabsFocused}
          orientation="horizontal"
        />
      </box>

      {/* Footer */}
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
            Tab: Switch Focus • ←→: Navigate Tabs • Ctrl+S: Save • Ctrl+R: Reset
            • ESC: Back
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
