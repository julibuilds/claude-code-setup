import { render, useKeyboard } from "@opentui/react";
import { ThemeProvider, useThemeColors } from "@repo/tui";
import { useState } from "react";
import { SCREENS, type Screen } from "./constants";
import { ConfigProvider } from "./context/ConfigContext";
import { Deploy, Menu, QuickConfig, Secrets, ZaiProvider } from "./screens";
import { loadEnv } from "./utils/env";

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>(SCREENS.MENU);
  const colors = useThemeColors();

  useKeyboard((evt) => {
    // Global shortcuts
    if (evt.ctrl && evt.name === "c") {
      process.exit(0);
    }
  });

  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handleBack = () => {
    setCurrentScreen(SCREENS.MENU);
  };

  return (
    <box flexGrow={1} flexDirection="column">
      {currentScreen === SCREENS.MENU && <Menu onNavigate={handleNavigate} />}
      {currentScreen === SCREENS.QUICK_CONFIG && (
        <QuickConfig onBack={handleBack} />
      )}
      {currentScreen === SCREENS.DEPLOY && <Deploy onBack={handleBack} />}
      {currentScreen === SCREENS.SECRETS && <Secrets onBack={handleBack} />}
      {currentScreen === SCREENS.ZAI_PROVIDER && (
        <ZaiProvider onBack={handleBack} />
      )}

      {/* Global footer */}
      {currentScreen !== SCREENS.MENU && (
        <box
          style={{
            flexDirection: "row",
            justifyContent: "center",
            paddingBottom: 1,
          }}
        >
          <text fg={colors.text.muted}>Press </text>
          <text fg={colors.accent.secondary}>ESC</text>
          <text fg={colors.text.muted}> to return to menu • </text>
          <text fg={colors.accent.secondary}>Ctrl+C</text>
          <text fg={colors.text.muted}> to exit</text>
        </box>
      )}
    </box>
  );
}

// Load environment variables
await loadEnv();

// Render the app
render(
  <ThemeProvider>
    <ConfigProvider>
      <App />
    </ConfigProvider>
  </ThemeProvider>
);
