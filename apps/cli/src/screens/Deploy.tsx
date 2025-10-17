import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { Button, ScrollBox, useThemeColors } from "@repo/tui";
import { useCallback, useState } from "react";
import { deployToWorkers, type DeployResult } from "../utils/deploy";

interface DeployProps {
  onBack: () => void;
}

type DeployState = "idle" | "deploying" | "success" | "error";

export function Deploy({ onBack }: DeployProps) {
  const colors = useThemeColors();
  const [deployState, setDeployState] = useState<DeployState>("idle");
  const [output, setOutput] = useState<string[]>([]);
  const [result, setResult] = useState<DeployResult | null>(null);
  const [focused, setFocused] = useState<"deploy" | "output">("deploy");

  const handleDeploy = useCallback(async () => {
    setDeployState("deploying");
    setOutput([]);
    setResult(null);

    const deployResult = await deployToWorkers((line) => {
      setOutput((prev) => [...prev, line]);
    });

    setResult(deployResult);
    setDeployState(deployResult.success ? "success" : "error");
    setFocused("output");
  }, []);

  useKeyboard((evt) => {
    if (evt.name === "escape") {
      if (deployState === "deploying") return; // Don't allow exit during deployment
      onBack();
    } else if (evt.name === "tab") {
      if (deployState !== "idle") {
        setFocused((prev) => (prev === "deploy" ? "output" : "deploy"));
      }
    } else if (
      evt.name === "return" &&
      focused === "deploy" &&
      deployState === "idle"
    ) {
      handleDeploy();
    }
  });

  return (
    <box flexGrow={1} flexDirection="column" style={{ padding: 1 }}>
      {/* Header */}
      <box style={{ paddingBottom: 1 }}>
        <text fg={colors.accent.primary} attributes={TextAttributes.BOLD}>
          🚀 Deploy to Cloudflare Workers
        </text>
      </box>

      {/* Deploy button */}
      <box style={{ paddingBottom: 1 }}>
        <Button
          variant={
            deployState === "success"
              ? "primary"
              : deployState === "error"
              ? "secondary"
              : "primary"
          }
          disabled={deployState === "deploying"}
          focused={focused === "deploy"}
          onClick={handleDeploy}
        >
          {deployState === "idle"
            ? "Deploy"
            : deployState === "deploying"
            ? "Deploying..."
            : deployState === "success"
            ? "Deploy Again"
            : "Retry Deploy"}
        </Button>
      </box>

      {/* Output panel */}
      <box border title="Deployment Output" flexGrow={1}>
        {output.length === 0 ? (
          <box alignItems="center" justifyContent="center" flexGrow={1}>
            <text fg={colors.text.muted}>
              {deployState === "idle"
                ? "Press Enter to start deployment"
                : "Initializing deployment..."}
            </text>
          </box>
        ) : (
          <ScrollBox focused={focused === "output"}>
            <box flexDirection="column">
              {output.map((line, idx) => (
                <text key={`output-${idx}`} fg={colors.text.primary}>
                  {line}
                </text>
              ))}
            </box>
          </ScrollBox>
        )}
      </box>

      {/* Status summary */}
      {result && (
        <box style={{ paddingTop: 1, flexDirection: "column" }}>
          <text
            fg={
              result.success ? colors.accent.secondary : colors.accent.primary
            }
            attributes={TextAttributes.BOLD}
          >
            {result.success ? "✓ Deployment successful" : "✗ Deployment failed"}
          </text>
          {result.error && (
            <text fg={colors.accent.primary}>Error: {result.error}</text>
          )}
          {result.verificationWarnings &&
            result.verificationWarnings.length > 0 && (
              <box flexDirection="column" style={{ paddingTop: 1 }}>
                <text fg={colors.text.muted}>Warnings:</text>
                {result.verificationWarnings.map((warning, idx) => (
                  <text key={`warning-${idx}`} fg={colors.text.muted}>
                    - {warning}
                  </text>
                ))}
              </box>
            )}
        </box>
      )}

      {/* Footer */}
      <box style={{ paddingTop: 1 }}>
        <text fg={colors.text.muted}>
          {deployState === "idle" ? "Enter: Deploy" : "Tab: Switch focus"} •
          ESC: Back
        </text>
      </box>
    </box>
  );
}
