import { render } from "@opentui/react";
import { neonTheme, ThemeProvider } from "@repo/tui";
import { ConfigProvider } from "./context/ConfigContext";
import { loadEnv } from "./utils/env";

function App() {
  return (
    <box
      style={{
        flexDirection: "column",
        width: "100%",
        height: "100%",
        padding: 1,
      }}
    ></box>
  );
}

// Load environment variables
await loadEnv();

// Render the app
render(
  <ThemeProvider initialTheme={neonTheme}>
    <ConfigProvider>
      <App />
    </ConfigProvider>
  </ThemeProvider>
);
