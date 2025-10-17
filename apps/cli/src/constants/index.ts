/**
 * Application-wide constants
 * Centralizes magic numbers, strings, and configuration values
 */

// Cache settings
export const CACHE = {
  /** Cache TTL in milliseconds (24 hours) */
  TTL: 24 * 60 * 60 * 1000,
  /** Cache directory name */
  DIR: ".cache",
  /** Models cache filename */
  MODELS_FILE: "openrouter-models.json",
} as const;

// API settings
export const API = {
  /** Default API timeout in milliseconds */
  TIMEOUT: 30000,
  /** Retry attempts for failed requests */
  RETRY_ATTEMPTS: 3,
  /** Delay between retries in milliseconds */
  RETRY_DELAY: 1000,
} as const;

// Router types
export const ROUTER_TYPES = {
  DEFAULT: "default",
  BACKGROUND: "background",
  THINK: "think",
  LONG_CONTEXT: "longContext",
} as const;

export type RouterType = (typeof ROUTER_TYPES)[keyof typeof ROUTER_TYPES];

// Filter types for model selection
export const FILTER_TYPES = {
  POPULAR: "popular",
  ANTHROPIC: "anthropic",
  OPENAI: "openai",
  ALL: "all",
} as const;

export type FilterType = (typeof FILTER_TYPES)[keyof typeof FILTER_TYPES];

// Screen names
export const SCREENS = {
  MENU: "menu",
  QUICK_CONFIG: "quick-config",
  ADVANCED_CONFIG: "advanced-config",
  DEPLOY: "deploy",
  SECRETS: "secrets",
  ZAI_PROVIDER: "zai-provider",
} as const;

export type Screen = (typeof SCREENS)[keyof typeof SCREENS];

// Status types
export const STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
} as const;

export type Status = (typeof STATUS)[keyof typeof STATUS];

// Animation durations (milliseconds)
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
} as const;

// File paths
export const PATHS = {
  CONFIG: "config.json",
  WRANGLER: "wrangler.toml",
  DEV_VARS: ".dev.vars",
  ENV: ".env",
} as const;

// Popular model providers for filtering
export const POPULAR_PROVIDERS = [
  "anthropic",
  "openai",
  "google",
  "meta-llama",
  "deepseek",
  "x-ai",
  "qwen",
] as const;

// Error messages
export const ERRORS = {
  CONFIG_NOT_FOUND: "Configuration file not found",
  INVALID_CONFIG: "Invalid configuration format",
  API_KEY_MISSING: "API key not found",
  DEPLOYMENT_FAILED: "Deployment failed",
  NETWORK_ERROR: "Network request failed",
  CACHE_ERROR: "Cache operation failed",
} as const;
