# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Project Management
- **Build all packages**: `bun run build`
- **Development mode**: `bun run dev`
- **Lint code**: `bun run lint`
- **Type checking**: `bun run check-types`
- **CI pipeline**: `bun run ci`
- **Clean rebuild**: `bun run cln` (removes all artifacts and reinstalls)
- **CLI setup**: `bun run cli:up` (builds and links CLI globally)

### CLI Tool (ccr)
The CLI is built in `apps/cli` and can be run globally as `ccr` after setup:
- **Build CLI**: `cd apps/cli && bun run build`
- **Run CLI locally**: `cd apps/cli && bun run dev`
- **Link globally**: `cd apps/cli && bun run link`

### Individual Package Commands
- **Build specific package**: `cd apps/cli && bun run build` or `cd packages/tui && bun run build`
- **Package-specific dev**: `cd apps/cli && bun run dev`
- **Package-specific lint**: `cd apps/cli && bun run lint`

## Architecture

This is a **Turborepo monorepo** for a Claude Code router CLI tool (`ccr`) that routes requests to different LLM providers.

### Core Structure
- **`apps/cli/`**: Main CLI application (`ccr`) - React-based TUI for configuration and management
- **`packages/tui/`**: Shared UI component library built on OpenTUI framework
- **`packages/core/`**: Core utilities and shared logic
- **`apps/router/`**: Router service (if exists)
- **`apps/demos/`**: Demo applications

### CLI Application (apps/cli)
- **Technology Stack**: React + TypeScript + OpenTUI for terminal UI
- **Entry Point**: `apps/cli/src/index.tsx` - React app with screen navigation
- **Screen Management**: Uses constants in `apps/cli/src/constants/index.ts` for screen definitions
- **Configuration**:
  - Config schema in `apps/cli/src/types/config.ts` using Zod
  - Config context in `apps/cli/src/context/ConfigContext.tsx`
  - Handles both local config and .dev.vars for deployment
- **Main Screens**: Menu, QuickConfig, Deploy, Secrets, ZaiProvider

### TUI Package (packages/tui)
- **Purpose**: Reusable React components for terminal interfaces
- **Technology**: React + OpenTUI framework
- **Exports**: Components, hooks, utilities, theme system
- **Key Features**: Layouts, forms, dialogs, tables, syntax highlighting, navigation

### Configuration System
- **Schema**: Uses Zod for type-safe configuration (Provider, Router, Config schemas)
- **Router Types**: default, background, think, longContext routing strategies
- **Provider Management**: Supports multiple LLM providers with API configuration
- **File Locations**: config.json, .dev.vars, wrangler.toml

### Development Workflow
1. Use `bun run cln` for full clean rebuild
2. Use `bun run cli:up` to build and link CLI globally
3. Individual packages can be developed in isolation with their own dev commands
4. Turbo handles build orchestration and caching

### Key Patterns
- React functional components with hooks
- Context API for state management (ConfigContext)
- Zod schemas for type safety
- OpenTUI for terminal-based UI components
- Modular screen-based navigation
- Shared constants and types for consistency