/**
 * @claude-router/core - Browser/Workers compatible exports
 *
 * This entry point excludes Node.js-specific utilities like config-loader
 * that use fs/path modules, making it safe for browser and Workers environments.
 */

// Export transformers
export * from "./transformers/deepseek.js";
export * from "./transformers/gemini.js";
export * from "./transformers/openrouter.js";

// Export type definitions
export * from "./types/api.js";
export * from "./types/config.js";
export * from "./types/transformer.js";

// Export browser-compatible utilities only
export * from "./utils/env-interpolation.js";
export * from "./utils/token-counter-browser.js";
export * from "./utils/transformer-registry.js";

// Note: config-loader is excluded as it uses Node.js fs/path modules
