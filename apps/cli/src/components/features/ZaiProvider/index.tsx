import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useComponentStyles, useThemeColors } from "@repo/tui";
import { useCallback, useEffect, useState } from "react";
import { KEYS } from "../../../constants";
import { useResponsiveLayout } from "../../../hooks/useResponsiveLayout";
import {
  configureOpenRouterProvider,
  configureZaiProvider,
  getCurrentProvider,
  getProviderConfig,
} from "../../../utils/claude-settings";
import { Footer } from "../../layout/Footer";
import { Header } from "../../layout/Header";

interface ZaiProviderProps {
  onBack: () => void;
}

type FocusState = "provider-select" | "api-key-input";
type ProviderType = "openrouter" | "zai";

export function ZaiProvider({ onBack }: ZaiProviderProps) {
  const { width, height, isNarrow, padding, gap } = useResponsiveLayout();
  const colors = useThemeColors();
  const componentStyles = useComponentStyles();

  const [currentProvider, setCurrentProvider] =
    useState<ProviderType>("openrouter");
  const [selectedProvider, setSelectedProvider] =
    useState<ProviderType>("openrouter");
  const [apiKey, setApiKey] = useState("");
  const [storedApiKey, setStoredApiKey] = useState("");
  const [focused, setFocused] = useState<FocusState>("provider-select");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadProvider = async () => {
      try {
        const provider = await getCurrentProvider();
        const config = await getProviderConfig();
        setCurrentProvider(provider);
        setSelectedProvider(provider);
        if (config.apiKey) {
          setStoredApiKey(config.apiKey);
          setApiKey(config.apiKey);
        }
      } catch (err) {
        setStatus("error");
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        setMessage(`Failed to load provider: ${errorMsg}`);
      }
    };
    loadProvider();
  }, []);

  const handleProviderSwitch = useCallback(async () => {
    if (selectedProvider === currentProvider) {
      setMessage("Already using this provider");
      return;
    }

    setStatus("loading");
    setMessage("Configuring provider...");

    try {
      if (selectedProvider === "zai") {
        if (!apiKey.trim()) {
          setStatus("error");
          setMessage("Please enter a Z.AI API key");
          setFocused("api-key-input");
          return;
        }
        await configureZaiProvider(apiKey.trim());
        setMessage("✓ Z.AI provider configured successfully");
      } else {
        await configureOpenRouterProvider();
        setMessage("✓ OpenRouter/Workers provider configured successfully");
      }

      setCurrentProvider(selectedProvider);
      setStatus("success");

      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 3000);
    } catch (err) {
      setStatus("error");
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setMessage(`Failed to configure provider: ${errorMsg}`);
    }
  }, [selectedProvider, currentProvider, apiKey]);

  useKeyboard((key) => {
    if (key.name === KEYS.TAB) {
      setFocused((prev) =>
        prev === "provider-select" ? "api-key-input" : "provider-select"
      );
      return;
    }

    if (focused === "provider-select") {
      if (key.name === KEYS.UP || key.name === KEYS.DOWN) {
        setSelectedProvider((prev) =>
          prev === "openrouter" ? "zai" : "openrouter"
        );
      }
      if (key.name === KEYS.RETURN) {
        handleProviderSwitch();
      }
    }

    if (focused === "api-key-input" && key.name === KEYS.RETURN) {
      if (selectedProvider === "zai") {
        handleProviderSwitch();
      }
    }
  });

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
      <Header
        icon="🔄"
        title={isNarrow ? "Provider Setup" : "Provider Configuration"}
        subtitle={
          isNarrow
            ? "Switch providers"
            : "Switch between OpenRouter/Workers and Z.AI provider"
        }
        status={
          status === "success"
            ? "success"
            : status === "error"
            ? "error"
            : "info"
        }
        statusText={
          currentProvider === "zai"
            ? "Using Z.AI provider"
            : "Using OpenRouter/Workers provider"
        }
        compact={isNarrow}
      />
      <box
        style={{
          padding: isNarrow ? 1 : 2,
          border: true,
          borderStyle: componentStyles.panel.borderStyle,
          borderColor:
            currentProvider === "zai"
              ? colors.status.info
              : colors.panelState?.success || colors.status.success,
          backgroundColor:
            currentProvider === "zai"
              ? componentStyles.messageBox.info.backgroundColor
              : componentStyles.messageBox.success.backgroundColor,
          flexDirection: "column",
          marginBottom: gap,
          width: "100%",
        }}
      >
        <text
          style={{
            attributes: TextAttributes.BOLD,
            fg:
              currentProvider === "zai"
                ? colors.status.info
                : colors.status.success,
            marginBottom: 1,
          }}
        >
          📋 Current Provider
        </text>
        <text style={{ fg: colors.text.primary, marginBottom: 0.5 }}>
          {currentProvider === "zai" ? "Z.AI" : "OpenRouter/Workers"}
        </text>
        {currentProvider === "zai" && storedApiKey && (
          <text style={{ fg: colors.text.muted, marginTop: 0.5 }}>
            API Key: {storedApiKey.substring(0, 8)}...
          </text>
        )}
      </box>
      <box
        style={{
          padding: isNarrow ? 1 : 2,
          border: true,
          borderStyle: componentStyles.panel.borderStyle,
          borderColor:
            focused === "provider-select"
              ? colors.border.focus
              : colors.border.default,
          backgroundColor: componentStyles.elevated.backgroundColor,
          flexDirection: "column",
          marginBottom: gap,
          width: "100%",
        }}
      >
        <text
          style={{
            attributes: TextAttributes.BOLD,
            fg: colors.text.primary,
            marginBottom: 1,
          }}
        >
          Select Provider
        </text>
        <box
          style={{
            padding: 1,
            backgroundColor:
              selectedProvider === "openrouter"
                ? componentStyles.list.item.hoverBackgroundColor
                : "transparent",
            marginBottom: 0.5,
          }}
        >
          <text
            style={{
              fg:
                selectedProvider === "openrouter"
                  ? colors.accent.primary
                  : colors.text.primary,
            }}
          >
            {selectedProvider === "openrouter" ? "▶ " : "  "}OpenRouter/Workers
          </text>
        </box>
        <box
          style={{
            padding: 1,
            backgroundColor:
              selectedProvider === "zai"
                ? componentStyles.list.item.hoverBackgroundColor
                : "transparent",
          }}
        >
          <text
            style={{
              fg:
                selectedProvider === "zai"
                  ? colors.accent.primary
                  : colors.text.primary,
            }}
          >
            {selectedProvider === "zai" ? "▶ " : "  "}Z.AI
          </text>
        </box>
      </box>
      {selectedProvider === "zai" && (
        <box
          title="Z.AI API Key"
          style={{
            border: true,
            borderStyle: componentStyles.panel.borderStyle,
            borderColor:
              focused === "api-key-input"
                ? colors.border.focus
                : colors.border.default,
            backgroundColor: componentStyles.elevated.backgroundColor,
            height: 3,
            marginBottom: gap,
            width: "100%",
          }}
        >
          <input
            placeholder="Enter your Z.AI API key..."
            value={apiKey}
            onInput={setApiKey}
            onSubmit={handleProviderSwitch}
            focused={focused === "api-key-input"}
          />
        </box>
      )}
      {message && (
        <box
          style={{
            padding: isNarrow ? 1 : 2,
            border: true,
            borderStyle: componentStyles.panel.borderStyle,
            borderColor:
              status === "success"
                ? colors.status.success
                : status === "error"
                ? colors.status.error
                : colors.status.info,
            backgroundColor:
              status === "success"
                ? componentStyles.messageBox.success.backgroundColor
                : status === "error"
                ? componentStyles.messageBox.error.backgroundColor
                : componentStyles.messageBox.info.backgroundColor,
            flexDirection: "column",
            marginBottom: gap,
            width: "100%",
          }}
        >
          <text
            style={{
              fg:
                status === "success"
                  ? colors.status.success
                  : status === "error"
                  ? colors.status.error
                  : colors.status.info,
            }}
          >
            {message}
          </text>
        </box>
      )}
      <box
        style={{
          padding: isNarrow ? 1 : 2,
          border: true,
          borderStyle: componentStyles.panel.borderStyle,
          borderColor: colors.border.default,
          backgroundColor: componentStyles.elevated.backgroundColor,
          flexDirection: "column",
          marginBottom: gap,
          width: "100%",
        }}
      >
        <text
          style={{
            attributes: TextAttributes.BOLD,
            fg: colors.text.primary,
            marginBottom: 1,
          }}
        >
          ℹ️ Instructions
        </text>
        <text style={{ fg: colors.text.muted, marginBottom: 0.5 }}>
          1. Use ↑↓ to select provider
        </text>
        <text style={{ fg: colors.text.muted, marginBottom: 0.5 }}>
          2. Press Tab to switch to API key input (Z.AI only)
        </text>
        <text style={{ fg: colors.text.muted, marginBottom: 0.5 }}>
          3. Press Enter to apply configuration
        </text>
        <text style={{ fg: colors.text.muted }}>
          4. Press ESC to return to menu
        </text>
      </box>
      <Footer
        shortcuts={
          isNarrow
            ? [
                { keys: "↑↓", description: "Select", category: "Nav" },
                { keys: "Tab", description: "Switch", category: "Nav" },
                { keys: "Enter", description: "Apply", category: "Action" },
                { keys: "ESC", description: "Back", category: "General" },
              ]
            : [
                {
                  keys: "↑↓",
                  description: "Select Provider",
                  category: "Navigation",
                },
                {
                  keys: "Tab",
                  description: "Switch Focus",
                  category: "Navigation",
                },
                {
                  keys: "Enter",
                  description: "Apply Config",
                  category: "Action",
                },
                {
                  keys: "ESC",
                  description: "Back to Menu",
                  category: "General",
                },
              ]
        }
        groupByCategory={!isNarrow}
        compact={isNarrow}
      />
    </box>
  );
}
