import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useThemeColors } from "@repo/tui";
import { useState } from "react";

interface TestConfigProps {
  onBack: () => void;
}

export function TestConfig({ onBack }: TestConfigProps) {
  const colors = useThemeColors();
  const [message, setMessage] = useState("Test Config Loaded");

  useKeyboard((evt) => {
    if (evt.name === "escape") {
      onBack();
    } else if (evt.name === "t") {
      setMessage("Test button pressed!");
    }
  });

  return (
    <box flexGrow={1} flexDirection="column" style={{ padding: 1 }}>
      {/* Header */}
      <box style={{ paddingBottom: 1 }}>
        <text fg={colors.accent.primary} attributes={TextAttributes.BOLD}>
          🧪 Test Configuration
        </text>
      </box>

      {/* Main Content */}
      <box flexGrow={1} alignItems="center" justifyContent="center">
        <box flexDirection="column" style={{ gap: 1 }}>
          <text fg={colors.text.primary}>{message}</text>
          <text fg={colors.text.muted}>
            This is a minimal test screen to isolate issues.
          </text>
          <text fg={colors.text.muted}>
            Press 'T' to test state updates.
          </text>
        </box>
      </box>

      {/* Footer */}
      <box style={{ paddingTop: 1 }}>
        <text fg={colors.text.muted}>
          T: Test • ESC: Back
        </text>
      </box>
    </box>
  );
}