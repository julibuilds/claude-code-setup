import type { SelectOption } from "@opentui/core";
import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useComponentStyles, useThemeColors } from "@repo/tui";
import { useState } from "react";
import { KEYS, SCREENS, type Screen } from "../../../constants";
import { useConfig } from "../../../context/ConfigContext";
import { useResponsiveLayout } from "../../../hooks/useResponsiveLayout";
import { Footer } from "../../layout/Footer";
import { Header } from "../../layout/Header";

interface MainMenuProps {
  onNavigate: (screen: Screen) => void;
}

/**
 * Main menu screen - entry point for all CLI operations
 * Shows current config status and navigation options
 */
export function MainMenu({ onNavigate }: MainMenuProps) {
  const { width, height, isNarrow, padding, gap } = useResponsiveLayout();
  const { config } = useConfig();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const colors = useThemeColors();
  const componentStyles = useComponentStyles();

  const options: SelectOption[] = [
    {
      name: "⚡ Quick Config",
      description: "Configure all router models in one place",
      value: SCREENS.QUICK_CONFIG,
    },
    {
      name: "🚀 Deploy to Workers",
      description: "Deploy configuration to Cloudflare Workers",
      value: SCREENS.DEPLOY,
    },
    {
      name: "🔐 Manage Secrets",
      description: "Update Cloudflare Workers secrets",
      value: SCREENS.SECRETS,
    },
    {
      name: "🔄 Provider Setup",
      description: "Switch between OpenRouter/Workers and Z.AI provider",
      value: SCREENS.ZAI_PROVIDER,
    },
    {
      name: "❌ Exit",
      description: "Exit the application",
      value: "exit",
    },
  ];

  useKeyboard((key) => {
    if (key.name === KEYS.RETURN) {
      const selected = options[selectedIndex];
      if (selected?.value === "exit") {
        process.exit(0);
      } else if (selected) {
        onNavigate(selected.value as Screen);
      }
    }
  });

  const contentHeight = Math.max(8, height - 16);
  const containerPadding = Math.max(2, padding);
  const containerWidth = Math.min(isNarrow ? width - 2 : 90, width - 4);

  return (
    <box
      style={{
        border: true,
        borderStyle: componentStyles.panel.borderStyle,
        borderColor: colors.border.default,
        backgroundColor: componentStyles.panel.backgroundColor,
        padding: containerPadding,
        flexDirection: "column",
        alignItems: "center",
        width: containerWidth,
        height: height - 4,
      }}
    >
      {/* Header */}
      <Header
        icon="⚡"
        title={isNarrow ? "CCR CLI" : "Claude Code Router CLI"}
        subtitle={
          isNarrow
            ? "Manage router config"
            : "Manage your router configuration and deployments"
        }
        status={config ? "success" : "warning"}
        statusText={config ? "Configuration loaded" : "No configuration found"}
        compact={isNarrow}
      />

      {/* Current Config Preview */}
      {config && (
        <box
          style={{
            padding: isNarrow ? 1 : 2,
            border: true,
            borderStyle: componentStyles.panel.borderStyle,
            borderColor: colors.panelState?.success || colors.status.success,
            backgroundColor: componentStyles.messageBox.success.backgroundColor,
            flexDirection: "column",
            marginBottom: gap,
            width: "100%",
          }}
        >
          <text
            style={{
              attributes: TextAttributes.BOLD,
              fg: colors.status.success,
              marginBottom: 1,
            }}
          >
            📋 Current Configuration
          </text>
          <box style={{ flexDirection: "column" }}>
            {[
              { label: "Default", value: config.Router.default },
              { label: "Background", value: config.Router.background },
              { label: "Think", value: config.Router.think },
              { label: "Long Context", value: config.Router.longContext },
            ].map(({ label, value }) => {
              const modelId = value.split(",")[1];
              const isSet = !!modelId;
              return (
                <text
                  key={label}
                  style={{
                    fg: isSet ? colors.status.success : colors.status.error,
                    marginBottom: 0.5,
                  }}
                >
                  {isSet ? "✓" : "✗"} {label}:{" "}
                  <span style={{ fg: colors.text.primary }}>
                    {modelId || "Not configured"}
                  </span>
                </text>
              );
            })}
          </box>
        </box>
      )}

      {/* Menu Options */}
      <box
        style={{
          border: true,
          borderStyle: componentStyles.panel.borderStyle,
          borderColor: colors.border.focus,
          backgroundColor: componentStyles.elevated.backgroundColor,
          flexDirection: "column",
          height: contentHeight,
          marginBottom: 2,
          width: "100%",
        }}
      >
        <select
          style={{
            height: "100%",
            backgroundColor: componentStyles.elevated.backgroundColor,
            focusedBackgroundColor:
              componentStyles.list.item.hoverBackgroundColor,
            textColor: colors.text.primary,
            focusedTextColor: colors.accent.primary,
            selectedBackgroundColor: colors.accent.primary,
            selectedTextColor: colors.background.main,
            descriptionColor: colors.text.muted,
            selectedDescriptionColor: colors.text.primary,
          }}
          options={options}
          focused={true}
          onChange={(index) => {
            setSelectedIndex(index);
          }}
          showScrollIndicator
        />
      </box>

      {/* Footer */}
      <Footer
        shortcuts={
          isNarrow
            ? [
                { keys: "↑↓", description: "Nav", category: "Nav" },
                { keys: "Enter", description: "Select", category: "Nav" },
                { keys: "ESC", description: "Exit", category: "General" },
              ]
            : [
                { keys: "↑↓", description: "Navigate", category: "Navigation" },
                { keys: "Enter", description: "Select", category: "Navigation" },
                { keys: "ESC", description: "Exit", category: "General" },
              ]
        }
        groupByCategory={!isNarrow}
        compact={isNarrow}
      />
    </box>
  );
}
