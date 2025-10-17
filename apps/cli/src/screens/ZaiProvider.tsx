import type { PasteEvent } from "@opentui/core";
import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { Button, useOpentuiPaste, useThemeColors } from "@repo/tui";
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

type FocusArea = "apiKey" | "configure" | "none";

export function ZaiProvider({ onBack }: ZaiProviderProps) {
  const colors = useThemeColors();
  const [focusArea, setFocusArea] = useState<FocusArea>("apiKey");
  const [apiKey, setApiKey] = useState("");
  const [displayValue, setDisplayValue] = useState("");
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
      setStatusMessage("✓ ZAI provider configured successfully!");
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

  // Update display value when masking changes or focus changes
  useEffect(() => {
    if (focusArea === "apiKey") {
      // When focused, show actual value
      setDisplayValue(apiKey);
    } else {
      // When not focused, show masked value
      setDisplayValue(
        maskApiKey && apiKey ? "*".repeat(apiKey.length) : apiKey
      );
    }
  }, [focusArea, apiKey, maskApiKey]);

  useKeyboard((evt) => {
    if (evt.name === "escape") {
      onBack();
    } else if (evt.name === "tab") {
      setFocusArea((prev) => (prev === "apiKey" ? "configure" : "apiKey"));
    } else if (evt.ctrl && evt.name === "h") {
      setMaskApiKey((prev) => !prev);
    }
  });

  // Handle paste events
  useOpentuiPaste(
    useCallback(
      (event: PasteEvent) => {
        if (focusArea === "apiKey" && event.text) {
          // Append pasted text to current API key value
          setApiKey((prev) => prev + event.text);
        }
      },
      [focusArea]
    )
  );

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
        <text fg={colors.accent.primary} attributes={TextAttributes.BOLD}>
          ⚠ If you have a /login managed key, run: claude /logout first
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
        <input
          value={displayValue}
          placeholder="Enter your ZAI API key..."
          focused={focusArea === "apiKey"}
          onInput={(value: string) => {
            // Only update if focused and not all asterisks (masked input)
            if (
              focusArea === "apiKey" &&
              !(value.match(/^\*+$/) && !apiKey.startsWith("*"))
            ) {
              setApiKey(value);
            }
          }}
          onSubmit={() => {
            if (apiKey.trim()) {
              setFocusArea("configure");
            }
          }}
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
          • ZAI provides access to GLM models via Claude-compatible API
        </text>
        <text fg={colors.text.muted}>
          • Configuration updates ~/.claude/settings.json
        </text>
        <text fg={colors.text.muted}>
          • Your API key is stored in ANTHROPIC_AUTH_TOKEN env var
        </text>
        <text fg={colors.text.muted}>
          • If you see auth conflicts, run: claude /logout
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
