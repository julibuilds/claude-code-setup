# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a Turborepo monorepo containing a Claude Code Router system that intelligently routes Claude API requests to multiple LLM providers (OpenRouter, DeepSeek, Gemini) with automatic provider selection, request/response transformation, and usage tracking.

**Current Status**: CLI tool (v2.0.2+) is fully functional with comprehensive configuration management, file synchronization, and deployment features. Router service is operational for local and edge deployment. Web UI is in development.

## Monorepo Structure

- `apps/router` - Main router service (Hono-based HTTP server)
- `apps/cli` - Terminal UI for router configuration and Cloudflare Workers deployment (v2.0.2+)
- `apps/web` - Next.js 15+ web application (frontend/dashboard, in development)
- `packages/core` - Shared core library with types, transformers, and utilities
- `packages/ui` - Shared UI components
- `dev/` - Development tooling (TypeScript configs)
- `_examples/` - Reference implementations and example projects
  - `_examples/claude-code-router` - Reference implementation with Next.js UI
  - `_examples/opentui` - OpenTUI terminal UI reference

## Build Commands

This project uses Bun as the package manager and runtime. Commands are run from the repository root using Turborepo:

```bash
# Install dependencies
bun install

# Development mode (all apps)
bun run dev

# Development mode (specific app)
cd apps/router && bun run dev
cd apps/cli && bun run dev
cd apps/web && bun run dev

# Build all packages/apps
bun run build

# Build specific package/app
cd packages/core && bun run build
cd apps/router && bun run build
cd apps/cli && bun run build

# Type checking across all workspaces
bun run check-types

# Linting (uses Biome)
bun run lint

# CI pipeline (lint + type check)
bun run ci
```

## Router Application (`apps/router`)

### Local Development

```bash
cd apps/router

# Development with auto-reload
bun run dev

# Build for Bun runtime
bun run build
bun run start

# Type checking
bun run typecheck
```

### Cloudflare Workers Deployment

```bash
cd apps/router

# Build for Workers (browser target)
bun run build:workers

# Local Workers development
bun run dev:workers

# Deploy to Cloudflare
bun run deploy:workers
```

See `apps/router/README.workers.md` and `apps/router/DOCKER.md` for deployment guides.

## CLI Application (`apps/cli`)

### Overview

Interactive Terminal User Interface (TUI) for managing router configurations and Cloudflare Workers deployments. Built with OpenTUI, React 19, and Zustand. **Version 2.0.2+ with complete feature parity and production-ready reliability**.

### Key Features

**Configuration Management** (v2.0.2+):
- **Quick Config**: All-in-one interface to configure all router types simultaneously
- **Model Selection**: Browse and select from available OpenRouter models with pricing and context length info
- **Smart Filtering**: Browse models by Popular, Anthropic, OpenAI, or All categories
- **Pending Changes System**: Review and batch-save multiple configuration changes
- **Live Preview**: See current and pending configurations side-by-side
- **Configuration Update**: Update router types (default, background, think, longContext)

**Deployment & Operations**:
- **Deploy Management**: Deploy to Cloudflare Workers with pre/post verification
- **Secrets Management**: Set and list Cloudflare Workers secrets with automatic file sync
- **File Synchronization**: Automatically updates `.dev.vars` and other config files
- **Deployment Verification**: Checks required files exist before and after deployment

**Performance & UX**:
- **Smart Caching**: 24-hour model list cache to reduce API calls
- **Portable Binary**: Works from any directory using import metadata
- **Keyboard Shortcuts**: Ctrl+S (save), Ctrl+R (reset), Ctrl+F (force refresh), Tab (navigate)
- **Visual Feedback**: Status indicators, error messages, and success confirmations
- **Multi-Panel Interface**: Three-panel layout for efficient navigation

### Local Development

```bash
cd apps/cli

# Development mode
bun run dev

# Build for production
bun run build

# Link globally (makes 'ccr' command available)
bun run link

# One-step setup
bun run setup

# Type checking
bun run check-types

# Linting
bun run lint
```

### Usage

```bash
# From project root (after setup)
ccr

# Or from apps/cli directory
cd apps/cli && bun run dev
```

### Environment Variables

Required:
- `OPENROUTER_API_KEY`: Your OpenRouter API key (for fetching models)

The CLI loads from:
- `apps/cli/.env`
- `apps/router/.dev.vars`

### Project Structure

```
apps/cli/
├── src/
│   ├── components/          # UI components
│   │   ├── MainMenu.tsx
│   │   ├── ConfigViewer.tsx
│   │   ├── ModelSelector.tsx
│   │   ├── DeployManager.tsx
│   │   └── SecretsManager.tsx
│   ├── context/             # React context
│   │   └── ConfigContext.tsx
│   ├── types/               # TypeScript types
│   │   └── config.ts
│   ├── utils/               # Utilities
│   │   ├── cache.ts         # Model list caching (24h)
│   │   ├── config.ts        # Config loading/saving
│   │   ├── deploy.ts        # Deployment functions
│   │   ├── env.ts           # Environment loading
│   │   ├── openrouter.ts    # OpenRouter API client
│   │   └── secrets.ts       # Secrets management
│   └── index.tsx            # Entry point
├── .cache/                  # Cached model data (gitignored)
├── dist/                    # Compiled binary
└── package.json
```

## Core Package (`packages/core`)

The core package has dual builds:

1. **Node/Bun target** (`dist/index.js`) - Uses `tiktoken` with WASM
2. **Browser target** (`dist/browser.js`) - Uses `js-tiktoken` (pure JS)

```bash
cd packages/core

# Build both targets + type definitions
bun run build

# Development mode
bun run dev

# Type checking
bun run typecheck
```

When importing in the router:
- Use `@repo/core/browser` for Cloudflare Workers (browser-compatible)
- Use `@repo/core` for Node/Bun environments

## Web Application (`apps/web`)

Next.js 15+ web interface for router management and configuration (in development).

```bash
cd apps/web

# Development with Turbopack
bun run dev

# Production build
bun run build
bun run start

# Linting with Biome
bun run lint

# Type checking
bun run check-types
```

### Planned Features

- Visual configuration editor
- Deployment monitoring dashboard
- Usage analytics and metrics
- Reference implementation in `_examples/claude-code-router/ui`

## Reference Implementations (`_examples/`)

The `_examples/` directory contains reference implementations that can be used as guides for development:

- **`_examples/claude-code-router`** - Complete reference implementation with:
  - Next.js UI (based on latest implementation)
  - Router service configuration
  - Deployment guides
  - This serves as the source for web UI features

- **`_examples/opentui`** - OpenTUI reference for terminal UI development

These examples should be consulted when building new features or understanding best practices for the project.

## Router Types and Configuration

The router supports four main routing types, each optimized for different use cases:

- **default**: Standard requests (general coding, chat, most tasks)
- **background**: Background tasks (code analysis, refactoring, bulk operations)
- **think**: Complex reasoning tasks (architecture design, debugging, problem solving)
- **longContext**: Large context requests (threshold: 60,000 tokens by default)

Each router type can be configured independently to use different providers and models based on requirements (cost, capabilities, speed, etc.).

## Architecture

### Request Flow

1. **Router Middleware** (`apps/router/src/middleware/router.ts`)
   - Analyzes request characteristics (token count, model type, features)
   - Applies routing rules based on:
     - Token count threshold for long context routing
     - Model name (e.g., "haiku" triggers background routing)
     - Request features (thinking mode, web search tools)
     - Explicit provider override via comma syntax: `"provider,model"`

2. **Transformer Middleware** (`apps/router/src/middleware/transformer.ts`)
   - Applies provider-specific request/response transformations
   - Supports chaining multiple transformers
   - Transforms Claude API format to provider formats (OpenAI, DeepSeek, Gemini)

3. **Proxy Handler** (`apps/router/src/routes/proxy.ts`)
   - Forwards transformed requests to provider APIs
   - Handles both streaming (SSE) and non-streaming responses
   - Tracks usage per session

### Transformer System

**Built-in Transformers** (in `packages/core/src/transformers/`):
- `openrouter` - OpenAI-compatible format (works with OpenRouter, Groq, etc.)
- `deepseek` - DeepSeek API format with reasoning mode support
- `gemini` - Google Gemini API format with thinking blocks

**Transformer Registry** (`packages/core/src/utils/transformer-registry.ts`):
- Manages transformer instances
- Supports custom transformers loaded from file paths
- Allows per-model transformer configuration
- Enables transformer chaining

### Configuration System

Configuration is loaded from `config.json` (path set via `CONFIG_PATH` env var):

```json
{
  "APIKEY": "router-api-key-or-$ENV_VAR",
  "Providers": [
    {
      "name": "openrouter",
      "api_base_url": "https://openrouter.ai/api/v1/chat/completions",
      "api_key": "$OPENROUTER_API_KEY",
      "models": ["anthropic/claude-3.5-sonnet"],
      "transformer": {
        "use": ["openrouter"]
      }
    }
  ],
  "Router": {
    "default": "openrouter,anthropic/claude-3.5-sonnet",
    "background": "openrouter,google/gemini-2.0-flash",
    "think": "deepseek,deepseek-reasoner",
    "longContext": "openrouter,google/gemini-2.0-flash",
    "longContextThreshold": 60000,
    "webSearch": "openrouter,google/gemini-2.0-flash"
  }
}
```

**Environment Variable Interpolation**: The config supports `$VAR_NAME` syntax for environment variables (implemented in `packages/core/src/utils/env-interpolation.ts`).

### Token Counting

Token counting uses tiktoken with `cl100k_base` encoding:
- **Node/Bun**: Uses `tiktoken` package (WASM-based, accurate)
- **Browser/Workers**: Uses `js-tiktoken` (pure JS, slightly slower)

Token counts inform routing decisions (long context threshold).

## Testing Configuration Changes

After modifying `config.json` or provider settings:

1. Restart the server (config is loaded at startup)
2. Test with the `/v1/messages/count_tokens` endpoint to verify routing
3. Check logs for routing decisions and transformer application
4. Use `GET /api/config` to view current configuration (with masked API keys)
5. Use `GET /api/transformers` to verify available transformers

## Adding New Providers

1. Add provider configuration to `config.json`
2. Specify the appropriate transformer (or create custom one)
3. Add routing rules if needed (background, think, longContext, webSearch)
4. Test token counting and request transformation

## Adding Custom Transformers

1. Create a new transformer class implementing the `Transformer` interface:
   ```typescript
   interface Transformer {
     name: string;
     transformRequest?(request: any, context: TransformContext): any;
     transformResponse?(response: any, context: TransformContext): any;
     transformStreamChunk?(chunk: string, context: TransformContext): string;
   }
   ```

2. Reference the transformer in `config.json`:
   ```json
   {
     "transformers": [
       {
         "name": "my-custom-transformer",
         "path": "./path/to/transformer.ts"
       }
     ]
   }
   ```

3. Use it in provider configuration:
   ```json
   {
     "transformer": {
       "use": ["my-custom-transformer", "openrouter"]
     }
   }
   ```

## Development Workflow

### Configuration via CLI

1. **Start CLI**: Run `ccr` (after `bun run link` in `apps/cli`) or `cd apps/cli && bun run dev`
2. **Configure Router**: Use Quick Config to set up routing rules and model selections
   - Select router type (default, background, think, longContext)
   - Filter models by category (Popular, Anthropic, OpenAI, All)
   - Review pending changes before saving
   - Save with Ctrl+S
3. **Set Secrets**: Use Secrets Manager to configure API keys
   - Automatically syncs to both Cloudflare Workers and `.dev.vars`
4. **Test Locally**: Run router with `bun run dev` using `.dev.vars`
5. **Deploy**: Use CLI to deploy to Cloudflare Workers with automatic verification

### File Management

The CLI automatically synchronizes local files with Cloudflare Workers:

**Managed Files**:
- `.dev.vars` - Updated when setting secrets (local development environment)
- `config.json` - Updated when saving router configuration (Quick Config)
- `wrangler.toml` - Verified before deployment (read-only)

**Synchronization**:
- Setting secrets updates both Cloudflare Workers and `.dev.vars`
- Saving config updates `config.json` and provider model lists
- Deployment verifies all required files exist before and after

## Important Development Notes

- **Dual Builds**: The core package builds for both Node/Bun and browser environments. Use the correct import path.
- **Middleware Order**: Router middleware must run before transformer middleware.
- **Streaming Responses**: Response transformers are skipped for streaming responses (handled by `transformStreamChunk`).
- **Config Backups**: Configuration updates via API automatically create timestamped backups in `.backups/` directory.
- **Authentication**: If `APIKEY` is set, all `/v1/*` and `/api/*` endpoints require bearer token or `x-api-key` header.
- **CLI Portability**: CLI binary uses `import.meta.dir` for path resolution, works from any directory
- **Model Caching**: Model list cached for 24 hours in CLI to reduce OpenRouter API calls
