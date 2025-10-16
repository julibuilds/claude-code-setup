import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import type { Config } from "../types/config";
import { loadConfig, saveConfig } from "../utils/config";

interface ConfigContextType {
	config: Config | null;
	loading: boolean;
	error: string | null;
	reloadConfig: () => Promise<void>;
	updateConfig: (newConfig: Config) => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType | null>(null);

export function ConfigProvider({ children }: { children: ReactNode }) {
	const [config, setConfig] = useState<Config | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const reloadConfig = async () => {
		setLoading(true);
		setError(null);
		try {
			const loadedConfig = await loadConfig();
			setConfig(loadedConfig);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load config");
		} finally {
			setLoading(false);
		}
	};

	const updateConfig = async (newConfig: Config) => {
		try {
			await saveConfig(newConfig);
			setConfig(newConfig);
		} catch (err) {
			throw new Error(err instanceof Error ? err.message : "Failed to save config");
		}
	};

	useEffect(() => {
		reloadConfig();
	}, []);

	return (
		<ConfigContext.Provider value={{ config, loading, error, reloadConfig, updateConfig }}>
			{children}
		</ConfigContext.Provider>
	);
}

export function useConfig() {
	const context = useContext(ConfigContext);
	if (!context) {
		throw new Error("useConfig must be used within ConfigProvider");
	}
	return context;
}
