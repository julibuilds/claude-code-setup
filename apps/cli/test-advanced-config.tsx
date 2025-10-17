#!/usr/bin/env bun
import { render } from "@opentui/react";
import { ThemeProvider } from "@repo/tui";
import { AdvancedConfig } from "./src/screens/AdvancedConfig";
import { ConfigProvider } from "./src/context/ConfigContext";

function TestApp() {
  return (
    <ThemeProvider>
      <ConfigProvider>
        <AdvancedConfig onBack={() => process.exit(0)} />
      </ConfigProvider>
    </ThemeProvider>
  );
}

render(<TestApp />);