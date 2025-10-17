import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useThemeColors } from "@repo/tui";
import { useState } from "react";
import { ROUTER_TYPES } from "../constants";
import type { Config } from "../types/config";

interface ConfigSummaryProps {
  config: Config | null;
  pendingChanges: Partial<Config>;
  focused: boolean;
}

export function ConfigSummary({
  config,
  pendingChanges,
  focused,
}: ConfigSummaryProps) {
  const colors = useThemeColors();
  const [selectedSection, setSelectedSection] = useState(0);

  const mergedConfig = config ? { ...config, ...pendingChanges } : null;

  useKeyboard((evt) => {
    if (!focused) return;

    if (evt.name === "up") {
      setSelectedSection((prev) => Math.max(0, prev - 1));
    } else if (evt.name === "down") {
      setSelectedSection((prev) => Math.min(4, prev + 1)); // 5 sections total
    }
  });

  if (!mergedConfig) {
    return (
      <box alignItems="center" justifyContent="center" flexGrow={1}>
        <text fg={colors.text.muted}>No configuration loaded</text>
      </box>
    );
  }

  const sections = [
    {
      title: "🌐 API Configuration",
      content: (
        <box flexDirection="column" style={{ gap: 0 }}>
          <text fg={colors.text.muted}>
            {`Host: ${mergedConfig.HOST}`}
          </text>
          <text fg={colors.text.muted}>
            {`Port: ${mergedConfig.PORT}`}
          </text>
          <text fg={colors.text.muted}>
            {`Timeout: ${mergedConfig.API_TIMEOUT_MS}ms`}
          </text>
          <text fg={colors.text.muted}>
            {`Logging: ${mergedConfig.LOG ? `Enabled (${mergedConfig.LOG_LEVEL})` : "Disabled"}`}
          </text>
        </box>
      ),
    },
    {
      title: "🤖 Router Configuration",
      content: (
        <box flexDirection="column" style={{ gap: 0 }}>
          {Object.entries(ROUTER_TYPES).map(([key, routerType]) => {
            const router = mergedConfig?.Router || {};
            const modelId = router[routerType];
            const isPending = pendingChanges.Router?.[routerType] !== undefined;
            return (
              <text key={routerType} fg={colors.text.muted}>
                {`${routerType}: ${isPending ? "* " : ""}${modelId || "Not set"}`}
              </text>
            );
          })}
          <text fg={colors.text.muted}>
            {`Long Context Threshold: ${mergedConfig.Router.longContextThreshold}`}
          </text>
        </box>
      ),
    },
    {
      title: "🔧 Providers",
      content: (
        <box flexDirection="column" style={{ gap: 0 }}>
          {(mergedConfig?.Providers || []).map((provider, index) => {
            const isPending = pendingChanges.Providers !== undefined;
            return (
              <box
                key={index}
                flexDirection="column"
                style={{ paddingBottom: 1 }}
              >
                <text fg={colors.text.muted}>
                  {`Provider ${index + 1}: ${isPending ? "* " : ""}${provider?.name || "Unknown"}`}
                </text>
                <text fg={colors.text.muted} style={{ paddingLeft: 2 }}>
                  {`URL: ${provider?.api_base_url || "Not set"}`}
                </text>
                <text fg={colors.text.muted} style={{ paddingLeft: 2 }}>
                  {`Models: ${provider?.models?.length || 0} configured`}
                </text>
                <text fg={colors.text.muted} style={{ paddingLeft: 2 }}>
                  {`Transformers: ${provider?.transformer?.use?.join(", ") || "None"}`}
                </text>
              </box>
            );
          })}
        </box>
      ),
    },
    {
      title: "📊 Statistics",
      content: (
        <box flexDirection="column" style={{ gap: 0 }}>
          <text fg={colors.text.muted}>
            {`Total Providers: ${mergedConfig?.Providers?.length || 0}`}
          </text>
          <text fg={colors.text.muted}>
            {`Total Models: ${(mergedConfig?.Providers || []).reduce(
              (sum, p) => sum + (p?.models?.length || 0),
              0
            )}`}
          </text>
          <text fg={colors.text.muted}>
            {`Configured Routers: ${Object.values(mergedConfig.Router).filter(Boolean).length}/4`}
          </text>
          <text fg={colors.text.muted}>
            {`Pending Changes: ${Object.keys(pendingChanges).length}`}
          </text>
        </box>
      ),
    },
    {
      title: "⚠️ Validation",
      content: (
        <box flexDirection="column" style={{ gap: 0 }}>
          {(() => {
            const issues: string[] = [];

            // Check for missing router configurations
            Object.entries(mergedConfig.Router).forEach(([key, value]) => {
              if (key !== "longContextThreshold" && !value) {
                issues.push(`${key} router not configured`);
              }
            });

            // Check for providers without API keys
            (mergedConfig?.Providers || []).forEach((provider, index) => {
              if (!provider) return;
              
              const providerName = provider.name || "Unknown";
              const apiKey = provider.api_key || "";
              const models = provider.models || [];
              
              if (!apiKey || apiKey === "your-api-key") {
                issues.push(
                  `Provider ${index + 1} (${providerName}) missing API key`
                );
              }
              if (models.length === 0) {
                issues.push(
                  `Provider ${index + 1} (${providerName}) has no models`
                );
              }
            });

            if (issues.length === 0) {
              return (
                <text fg={colors.accent.secondary}>
                  ✓ Configuration is valid
                </text>
              );
            }

            return issues.map((issue, index) => (
              <text key={index} fg={colors.accent.primary}>
                {`⚠ ${issue}`}
              </text>
            ));
          })()}
        </box>
      ),
    },
  ];

  return (
    <box flexGrow={1} flexDirection="column" style={{ gap: 1 }}>
      {/* Header */}
      <box>
        <text fg={colors.text.primary} attributes={TextAttributes.BOLD}>
          Configuration Summary
        </text>
      </box>

      {/* Sections */}
      <box flexGrow={1} flexDirection="column" style={{ gap: 1 }}>
        {sections.map((section, index) => (
          <box
            key={index}
            border
            title={section.title}
            style={{
              padding: 1,
            }}
          >
            {section.content}
          </box>
        ))}
      </box>

      {/* Help */}
      <box style={{ paddingTop: 1 }}>
        <text fg={colors.text.muted}>↑↓: Navigate Sections</text>
      </box>
    </box>
  );
}