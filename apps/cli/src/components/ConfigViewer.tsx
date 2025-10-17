import { TextAttributes } from "@opentui/core";
import { useTerminalDimensions } from "@opentui/react";
import { useConfig } from "../context/ConfigContext";

interface ConfigViewerProps {
  onBack: () => void;
}

export function ConfigViewer(_props: ConfigViewerProps) {
  const { width, height } = useTerminalDimensions();
  const { config, loading, error } = useConfig();

  if (loading) {
    return (
      <box
        style={{
          flexDirection: "column",
          width: Math.min(100, width - 4),
          height: height - 4,
          padding: 2,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <box
          style={{
            border: true,
            padding: 3,
            backgroundColor: "#1a1b26",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <text
            style={{
              attributes: TextAttributes.BOLD,
              fg: "#00D9FF",
              marginBottom: 1,
            }}
          >
            ⏳ Loading Configuration
          </text>
          <text fg="#7aa2f7">Please wait...</text>
        </box>
      </box>
    );
  }

  if (error || !config) {
    return (
      <box
        style={{
          flexDirection: "column",
          width: Math.min(100, width - 4),
          height: height - 4,
          padding: 2,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <box
          style={{
            border: true,
            padding: 3,
            backgroundColor: "#1a1b26",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <text
            style={{
              attributes: TextAttributes.BOLD,
              fg: "#f7768e",
              marginBottom: 2,
            }}
          >
            ❌ Error Loading Configuration
          </text>
          <text fg="#7aa2f7">{error || "Config not found"}</text>
          <text fg="#565f89" style={{ marginTop: 2 }}>
            Press ESC to go back
          </text>
        </box>
      </box>
    );
  }

  const openrouterProvider = config.Providers.find(
    (p) => p.name === "openrouter"
  );

  return (
    <box
      style={{
        flexDirection: "column",
        width: Math.min(100, width - 4),
        height: height - 4,
        padding: 2,
      }}
    >
      <box
        style={{
          marginBottom: 2,
          padding: 2,
          border: true,
          flexDirection: "column",
          backgroundColor: "#1a1b26",
        }}
      >
        <text
          style={{
            attributes: TextAttributes.BOLD,
            fg: "#00D9FF",
            marginBottom: 1,
          }}
        >
          📋 Current Configuration
        </text>
        <text fg="#7aa2f7">View your router settings and models</text>
      </box>

      <scrollbox
        style={{
          rootOptions: { height: height - 12, border: true },
          wrapperOptions: { backgroundColor: "#1f2335" },
          viewportOptions: { backgroundColor: "#1a1b26" },
          scrollbarOptions: { showArrows: true },
        }}
        focused
      >
        <box style={{ flexDirection: "column", padding: 2 }}>
          <box style={{ marginBottom: 2 }}>
            <text
              style={{
                attributes: TextAttributes.BOLD,
                fg: "#bb9af7",
              }}
            >
              Router Settings
            </text>
          </box>

          <box style={{ flexDirection: "column", marginBottom: 2 }}>
            <text fg="#7aa2f7" style={{ marginBottom: 1 }}>
              Default:
            </text>
            <text fg="#9ece6a"> {config.Router.default}</text>

            <text fg="#7aa2f7" style={{ marginTop: 1, marginBottom: 1 }}>
              Background:
            </text>
            <text fg="#9ece6a"> {config.Router.background}</text>

            <text fg="#7aa2f7" style={{ marginTop: 1, marginBottom: 1 }}>
              Think:
            </text>
            <text fg="#9ece6a"> {config.Router.think}</text>

            <text fg="#7aa2f7" style={{ marginTop: 1, marginBottom: 1 }}>
              Long Context:
            </text>
            <text fg="#9ece6a"> {config.Router.longContext}</text>

            <text fg="#7aa2f7" style={{ marginTop: 1, marginBottom: 1 }}>
              Long Context Threshold:
            </text>
            <text fg="#9ece6a">
              {" "}
              {config.Router.longContextThreshold} tokens
            </text>
          </box>

          {openrouterProvider && (
            <box style={{ flexDirection: "column" }}>
              <box style={{ marginBottom: 2 }}>
                <text
                  style={{
                    attributes: TextAttributes.BOLD,
                    fg: "#bb9af7",
                  }}
                >
                  OpenRouter Models
                </text>
              </box>

              {openrouterProvider.models.map((model) => (
                <text key={model} fg="#7aa2f7">
                  • {model}
                </text>
              ))}
            </box>
          )}
        </box>
      </scrollbox>

      <box
        style={{
          marginTop: 2,
          padding: 2,
          border: true,
          flexDirection: "column",
          backgroundColor: "#1a1b26",
        }}
      >
        <text
          style={{
            attributes: TextAttributes.BOLD,
            fg: "#bb9af7",
            marginBottom: 1,
          }}
        >
          ⌨️ Keyboard Shortcuts
        </text>
        <text fg="#7aa2f7">↑↓ Scroll • ESC Back</text>
      </box>
    </box>
  );
}
