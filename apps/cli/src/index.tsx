import { render, useKeyboard } from "@opentui/react";
import { useCallback, useState } from "react";
import { ConfigViewer } from "./components/ConfigViewer";
import { DeployManager } from "./components/DeployManager";
import { MainMenu } from "./components/MainMenu";
import { ModelSelector } from "./components/ModelSelector";
import { SecretsManager } from "./components/SecretsManager";
import { ConfigProvider } from "./context/ConfigContext";
import { loadEnv } from "./utils/env";

type Screen = "menu" | "config" | "models" | "deploy" | "secrets";

function App() {
	const [screen, setScreen] = useState<Screen>("menu");

	useKeyboard((key) => {
		if (key.name === "escape") {
			if (screen === "menu") {
				process.exit(0);
			} else {
				setScreen("menu");
			}
		}
	});

	const handleNavigate = useCallback((newScreen: Screen) => {
		setScreen(newScreen);
	}, []);

	return (
		<box
			style={{
				flexDirection: "column",
				width: "100%",
				height: "100%",
				padding: 1,
			}}
		>
			{screen === "menu" && <MainMenu onNavigate={handleNavigate} />}
			{screen === "config" && <ConfigViewer onBack={() => setScreen("menu")} />}
			{screen === "models" && <ModelSelector onBack={() => setScreen("menu")} />}
			{screen === "deploy" && <DeployManager onBack={() => setScreen("menu")} />}
			{screen === "secrets" && <SecretsManager onBack={() => setScreen("menu")} />}
		</box>
	);
}

// Load environment variables
await loadEnv();

// Render the app
render(
	<ConfigProvider>
		<App />
	</ConfigProvider>
);
