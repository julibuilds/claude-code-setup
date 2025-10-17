import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { Button, TextInput, useThemeColors } from "@repo/tui";
import { useCallback, useEffect, useState } from "react";
import {
  configureZaiProvider,
  getCurrentProvider,
  isZaiConfigured,
  type ProviderConfig,
} from "../utils/claude-settings";

interface ZaiProviderProps {
  onBack: () => void;
}

type FocusArea = "apiKey" | "configure" | "status";

export function ZaiProvider({ onBack }: ZaiProviderProps) {
  const colors = useThemeColors();
  const [focusArea, setFocusArea] = useState<FocusArea>("apiKey");
  const [apiKey, setApiKey] = useState("");
  const [currentProvider, setCurrentProvider] = useState<ProviderConfig | null>(
    null
  );
  const [isConfigured, setIsConfigured] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [maskApiKey, setMaskApiKey] = useState(true);

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const providerType = await getCurrentProvider();
        setCurrentProvider({ type: providerType });
        setIsConfigured(await isZaiConfigured());
      } catch {
        // Ignore errors on initial load
      }
    };
    loadStatus();
  }, []);

  const handleConfigure = useCallback(async () => {
    if (!apiKey.trim()) {
      setStatusMessage("✗ API key is required");
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }

    setLoading(true);
    setStatusMessage("Configuring ZAI provider...");

    try {
      await configureZaiProvider(apiKey);
      setStatusMessage("✓ ZAI provider configured successfully");
      setIsConfigured(true);
      setCurrentProvider({ type: "zai", apiKey });
      setApiKey("");

      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      setStatusMessage(
        `✗ Configuration failed: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  useKeyboard((evt) => {
    if (evt.name === "escape") {
      onBack();
    } else if (evt.name === "tab") {
      setFocusArea((prev) => {
        if (prev === "apiKey") return "configure";
        if (prev === "configure") return "status";
        return "apiKey";
      });
    } else if (evt.ctrl && evt.name === "h") {
      setMaskApiKey((prev) => !prev);
    } else if (evt.name === "return" && focusArea === "configure") {
      handleConfigure();
    }
  });

  const displayApiKey =
    maskApiKey && apiKey ? "*".repeat(apiKey.length) : apiKey;

  return (
    <box flexGrow={1} flexDirection="column" style={{ padding: 1 }}>
      <box style={{ paddingBottom: 1 }}>
        <text fg={colors.accent.primary} attributes={TextAttributes.BOLD}>
          🤖 ZAI Provider Configuration
        </text>
      </box>

      <box flexDirection="column" style={{ paddingBottom: 2 }}>
        <text fg={colors.text.primary}>
          Configure ZAI as your AI provider for Claude Code Router.
        </text>
        <text fg={colors.text.muted}>
          This will update your Claude settings to use ZAI's API endpoint.
        </text>
      </box>

      <box
        border
        title="Current Status"
        flexDirection="column"
        style={{ padding: 1, marginBottom: 1 }}
      >
        <box style={{ gap: 1 }}>
          <text fg={colors.text.muted}>Provider:</text>
          <text
            fg={isConfigured ? colors.accent.secondary : colors.text.primary}
            attributes={isConfigured ? TextAttributes.BOLD : 0}
          >
            {currentProvider?.type === "zai"
              ? "ZAI"
              : currentProvider?.type === "openrouter"
              ? "OpenRouter"
              : "Not configured"}
          </text>
        </box>
        <box style={{ gap: 1 }}>
          <text fg={colors.text.muted}>Status:</text>
          <text fg={isConfigured ? colors.accent.secondary : colors.text.muted}>
            {isConfigured ? "✓ Configured" : "Not configured"}
          </text>
        </box>
      </box>

      <box border title="ZAI API Key" style={{ height: 3, marginBottom: 1 }}>
        <TextInput
          value={displayApiKey}
          placeholder="Enter your ZAI API key..."
          focused={focusArea === "apiKey"}
          onChange={setApiKey}
        />
      </box>

      <box style={{ paddingBottom: 1 }}>
        <Button
          variant="primary"
          focused={focusArea === "configure"}
          onClick={handleConfigure}
          disabled={loading || !apiKey.trim()}
        >
          {loading ? "Configuring..." : "Configure ZAI Provider"}
        </Button>
      </box>

      {statusMessage && (
        <box border title="Status" style={{ padding: 1, marginBottom: 1 }}>
          <text
            fg={
              statusMessage.startsWith("✓")
                ? colors.accent.secondary
                : statusMessage.startsWith("✗")
                ? colors.accent.primary
                : colors.text.primary
            }
          >
            {statusMessage}
          </text>
        </box>
      )}

      <box
        border
        title="Information"
        flexDirection="column"
        style={{ padding: 1, marginBottom: 1 }}
      >
        <text fg={colors.text.muted}>
          • ZAI provides access to Claude models
        </text>
        <text fg={colors.text.muted}>
          • Configuration updates ~/.claude/settings.local.json
        </text>
        <text fg={colors.text.muted}>
          • Your API key is stored securely in local settings
        </text>
      </box>

      <box style={{ paddingTop: 1, flexDirection: "column" }}>
        <box style={{ gap: 2 }}>
          <text fg={colors.text.muted}>Tab: Switch field</text>
          <text fg={colors.text.muted}>Enter: Configure</text>
          <text fg={colors.text.muted}>
            Ctrl+H: {maskApiKey ? "Show" : "Hide"} key
          </text>
          <text fg={colors.text.muted}>ESC: Back</text>
        </box>
        {maskApiKey && (
          <box style={{ paddingTop: 1 }}>
            <text fg={colors.text.muted}>
              🔒 API key is masked (Ctrl+H to toggle)
            </text>
          </box>
        )}
      </box>
    </box>
  );
}
