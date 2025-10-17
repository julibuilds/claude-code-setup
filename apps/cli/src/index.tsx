import { render, useKeyboard } from "@opentui/react";
import { neonTheme, ThemeProvider } from "@repo/tui";
import { useCallback, useState } from "react";
import { DeployManager } from "./components/features/DeployManager";
import { MainMenu } from "./components/features/MainMenu";
import { QuickConfig } from "./components/features/QuickConfig";
import { SecretsManager } from "./components/features/SecretsManager";
import { KEYS, SCREENS, type Screen } from "./constants";
import { ConfigProvider } from "./context/ConfigContext";
import { loadEnv } from "./utils/env";

function App() {
	const [screen, setScreen] = useState<Screen>(SCREENS.MENU);

	useKeyboard((key) => {
		if (key.name === KEYS.ESCAPE) {
			if (screen === SCREENS.MENU) {
				process.exit(0);
			} else {
				setScreen(SCREENS.MENU);
			}
		}
	});

	const handleNavigate = useCallback((newScreen: Screen) => {
		setScreen(newScreen);
	}, []);

	const handleBack = useCallback(() => {
		setScreen(SCREENS.MENU);
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
			{screen === SCREENS.MENU && <MainMenu onNavigate={handleNavigate} />}
			{screen === SCREENS.QUICK_CONFIG && <QuickConfig onBack={handleBack} />}
			{screen === SCREENS.DEPLOY && <DeployManager onBack={handleBack} />}
			{screen === SCREENS.SECRETS && <SecretsManager onBack={handleBack} />}
		</box>
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
