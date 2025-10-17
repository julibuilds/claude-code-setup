import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export interface ClaudeSettings {
	env?: {
		ANTHROPIC_AUTH_TOKEN?: string;
		ANTHROPIC_BASE_URL?: string;
		API_TIMEOUT_MS?: string;
		ANTHROPIC_DEFAULT_HAIKU_MODEL?: string;
		ANTHROPIC_DEFAULT_SONNET_MODEL?: string;
		ANTHROPIC_DEFAULT_OPUS_MODEL?: string;
	};
	[key: string]: unknown;
}

export interface ProviderConfig {
	type: "openrouter" | "zai";
	apiKey?: string;
}

const CLAUDE_SETTINGS_PATH = join(homedir(), ".claude", "settings.json");
const PROVIDER_CONFIG_PATH = join(homedir(), ".claude", "ccr-provider.json");

// Z.AI provider configuration
const ZAI_CONFIG = {
	baseUrl: "https://api.z.ai/api/anthropic",
	timeout: "3000000",
	models: {
		haiku: "glm-4.5-air",
		sonnet: "glm-4.6",
		opus: "glm-4.6",
	},
} as const;

/**
 * Get the path to Claude settings file
 */
export function getClaudeSettingsPath(): string {
	return CLAUDE_SETTINGS_PATH;
}

/**
 * Check if Claude settings file exists
 */
export function claudeSettingsExists(): boolean {
	return existsSync(CLAUDE_SETTINGS_PATH);
}

/**
 * Read Claude settings file
 */
export async function readClaudeSettings(): Promise<ClaudeSettings> {
	if (!claudeSettingsExists()) {
		return {};
	}

	try {
		const content = await Bun.file(CLAUDE_SETTINGS_PATH).text();
		return JSON.parse(content);
	} catch (err) {
		throw new Error(
			`Failed to read Claude settings: ${err instanceof Error ? err.message : "Unknown error"}`
		);
	}
}

/**
 * Write Claude settings file
 */
export async function writeClaudeSettings(settings: ClaudeSettings): Promise<void> {
	try {
		const settingsJson = JSON.stringify(settings, null, 2);
		await Bun.write(CLAUDE_SETTINGS_PATH, settingsJson);
	} catch (err) {
		throw new Error(
			`Failed to write Claude settings: ${err instanceof Error ? err.message : "Unknown error"}`
		);
	}
}

/**
 * Get stored provider configuration
 */
export async function getProviderConfig(): Promise<ProviderConfig> {
	if (!existsSync(PROVIDER_CONFIG_PATH)) {
		return { type: "openrouter" };
	}

	try {
		const content = await Bun.file(PROVIDER_CONFIG_PATH).text();
		return JSON.parse(content);
	} catch {
		return { type: "openrouter" };
	}
}

/**
 * Save provider configuration
 */
export async function saveProviderConfig(config: ProviderConfig): Promise<void> {
	const configJson = JSON.stringify(config, null, 2);
	await Bun.write(PROVIDER_CONFIG_PATH, configJson);
}

/**
 * Configure Claude settings for Z.AI provider
 */
export async function configureZaiProvider(apiKey: string): Promise<void> {
	const settings = await readClaudeSettings();

	settings.env = {
		...settings.env,
		ANTHROPIC_AUTH_TOKEN: apiKey,
		ANTHROPIC_BASE_URL: ZAI_CONFIG.baseUrl,
		API_TIMEOUT_MS: ZAI_CONFIG.timeout,
		ANTHROPIC_DEFAULT_HAIKU_MODEL: ZAI_CONFIG.models.haiku,
		ANTHROPIC_DEFAULT_SONNET_MODEL: ZAI_CONFIG.models.sonnet,
		ANTHROPIC_DEFAULT_OPUS_MODEL: ZAI_CONFIG.models.opus,
	};

	await writeClaudeSettings(settings);
	await saveProviderConfig({ type: "zai", apiKey });
}

/**
 * Configure Claude settings for OpenRouter/Workers provider
 * Removes Z.AI specific settings
 */
export async function configureOpenRouterProvider(): Promise<void> {
	const settings = await readClaudeSettings();

	// Remove Z.AI specific settings
	if (settings.env) {
		delete settings.env.ANTHROPIC_AUTH_TOKEN;
		delete settings.env.ANTHROPIC_BASE_URL;
		delete settings.env.API_TIMEOUT_MS;
		delete settings.env.ANTHROPIC_DEFAULT_HAIKU_MODEL;
		delete settings.env.ANTHROPIC_DEFAULT_SONNET_MODEL;
		delete settings.env.ANTHROPIC_DEFAULT_OPUS_MODEL;

		// Clean up empty env object
		if (Object.keys(settings.env).length === 0) {
			delete settings.env;
		}
	}

	await writeClaudeSettings(settings);
	await saveProviderConfig({ type: "openrouter" });
}

/**
 * Get current provider type from Claude settings
 */
export async function getCurrentProvider(): Promise<"openrouter" | "zai"> {
	const config = await getProviderConfig();
	return config.type;
}

/**
 * Check if Z.AI provider is configured
 */
export async function isZaiConfigured(): Promise<boolean> {
	const settings = await readClaudeSettings();
	return (
		!!settings.env?.ANTHROPIC_AUTH_TOKEN &&
		settings.env?.ANTHROPIC_BASE_URL === ZAI_CONFIG.baseUrl
	);
}
