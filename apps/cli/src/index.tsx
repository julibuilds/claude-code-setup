import { render, useKeyboard } from "@opentui/react";
import { useCallback, useState } from "react";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
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
			{screen === SCREENS.MENU && (
				<ErrorBoundary screenName="MainMenu">
					<MainMenu onNavigate={handleNavigate} />
				</ErrorBoundary>
			)}
			{screen === SCREENS.QUICK_CONFIG && (
				<ErrorBoundary screenName="QuickConfig">
					<QuickConfig onBack={handleBack} />
				</ErrorBoundary>
			)}
			{screen === SCREENS.DEPLOY && (
				<ErrorBoundary screenName="DeployManager">
					<DeployManager onBack={handleBack} />
				</ErrorBoundary>
			)}
			{screen === SCREENS.SECRETS && (
				<ErrorBoundary screenName="SecretsManager">
					<SecretsManager onBack={handleBack} />
				</ErrorBoundary>
			)}
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
