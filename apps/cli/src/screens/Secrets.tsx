import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { Button, ScrollBox, TextInput, useThemeColors } from "@repo/tui";
import { useCallback, useEffect, useState } from "react";
import {
  listWorkerSecrets,
  setWorkerSecret,
  type SecretResult,
} from "../utils/secrets";

interface SecretsProps {
  onBack: () => void;
}

type FocusArea = "action" | "key" | "value" | "output";
type Action = "set" | "list";

export function Secrets({ onBack }: SecretsProps) {
  const colors = useThemeColors();
  const [focusArea, setFocusArea] = useState<FocusArea>("action");
  const [selectedAction, setSelectedAction] = useState<Action>("set");
  const [secretKey, setSecretKey] = useState("");
  const [secretValue, setSecretValue] = useState("");
  const [output, setOutput] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [maskSecrets, setMaskSecrets] = useState(true);

  const handleSetSecret = useCallback(async () => {
    if (!secretKey.trim() || !secretValue.trim()) {
      setOutput(["Error: Both key and value are required"]);
      return;
    }

    setLoading(true);
    setOutput([`Setting secret: ${secretKey}...`]);

    try {
      const result: SecretResult = await setWorkerSecret(
        secretKey,
        secretValue
      );

      if (result.success) {
        setOutput([
          `✓ Secret '${secretKey}' set successfully`,
          result.localFileUpdated
            ? "✓ Local .dev.vars updated"
            : "⚠ Local .dev.vars not updated",
        ]);
        setSecretKey("");
        setSecretValue("");
      } else {
        setOutput([`✗ Failed to set secret: ${result.error}`]);
      }
    } catch (err) {
      setOutput([
        `✗ Error: ${err instanceof Error ? err.message : "Unknown error"}`,
      ]);
    } finally {
      setLoading(false);
    }
  }, [secretKey, secretValue]);

  const handleListSecrets = useCallback(async () => {
    setLoading(true);
    setOutput(["Fetching secrets..."]);

    try {
      const secrets = await listWorkerSecrets();
      setOutput(secrets.length > 0 ? secrets : ["No secrets found"]);
    } catch (err) {
      setOutput([
        `✗ Error: ${err instanceof Error ? err.message : "Unknown error"}`,
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    handleListSecrets();
  }, [handleListSecrets]);

  useKeyboard((evt) => {
    if (evt.name === "escape") {
      onBack();
    } else if (evt.name === "tab") {
      setFocusArea((prev) => {
        if (prev === "action") return "key";
        if (prev === "key") return "value";
        if (prev === "value") return "output";
        return "action";
      });
    } else if (evt.ctrl && evt.name === "h") {
      setMaskSecrets((prev) => !prev);
    } else if (evt.name === "return") {
      if (focusArea === "action") {
        if (selectedAction === "set") {
          handleSetSecret();
        } else {
          handleListSecrets();
        }
      }
    }
  });

  const displayValue =
    maskSecrets && secretValue ? "*".repeat(secretValue.length) : secretValue;

  return (
    <box flexGrow={1} flexDirection="column" style={{ padding: 1 }}>
      <box style={{ paddingBottom: 1 }}>
        <text fg={colors.accent.primary} attributes={TextAttributes.BOLD}>
          🔐 Secrets Manager
        </text>
      </box>

      <box style={{ gap: 1, paddingBottom: 1 }}>
        <Button
          variant={selectedAction === "set" ? "primary" : "secondary"}
          focused={focusArea === "action" && selectedAction === "set"}
          onClick={() => {
            setSelectedAction("set");
            handleSetSecret();
          }}
          disabled={loading}
        >
          Set Secret
        </Button>
        <Button
          variant={selectedAction === "list" ? "primary" : "secondary"}
          focused={focusArea === "action" && selectedAction === "list"}
          onClick={() => {
            setSelectedAction("list");
            handleListSecrets();
          }}
          disabled={loading}
        >
          List Secrets
        </Button>
      </box>

      <box style={{ gap: 1, paddingBottom: 1 }}>
        <box border title="Secret Key" style={{ width: 30, height: 3 }}>
          <TextInput
            value={secretKey}
            placeholder="e.g., API_KEY"
            focused={focusArea === "key"}
            onChange={setSecretKey}
          />
        </box>
        <box border title="Secret Value" style={{ flexGrow: 1, height: 3 }}>
          <TextInput
            value={displayValue}
            placeholder="Enter secret value..."
            focused={focusArea === "value"}
            onChange={setSecretValue}
          />
        </box>
      </box>

      <box border title="Output" flexGrow={1}>
        <ScrollBox focused={focusArea === "output"}>
          <box flexDirection="column">
            {output.map((line, idx) => (
              <text
                key={`output-${idx}`}
                fg={
                  line.startsWith("✓")
                    ? colors.accent.secondary
                    : line.startsWith("✗") || line.startsWith("Error")
                    ? colors.accent.primary
                    : line.startsWith("⚠")
                    ? colors.text.muted
                    : colors.text.primary
                }
              >
                {line}
              </text>
            ))}
          </box>
        </ScrollBox>
      </box>

      <box style={{ paddingTop: 1, flexDirection: "column" }}>
        <box style={{ gap: 2 }}>
          <text fg={colors.text.muted}>Tab: Switch field</text>
          <text fg={colors.text.muted}>Enter: Execute</text>
          <text fg={colors.text.muted}>
            Ctrl+H: {maskSecrets ? "Show" : "Hide"} secrets
          </text>
          <text fg={colors.text.muted}>ESC: Back</text>
        </box>
        {maskSecrets && (
          <box style={{ paddingTop: 1 }}>
            <text fg={colors.text.muted}>
              🔒 Secrets are masked (Ctrl+H to toggle)
            </text>
          </box>
        )}
      </box>
    </box>
  );
}
