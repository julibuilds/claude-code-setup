# Claude Code Router CLI

Interactive TUI (Terminal User Interface) for managing Claude Code Router configurations and Cloudflare Workers deployments.

## Features

- **⚡ Quick Config**: All-in-one interface to configure all router models simultaneously
- **Pending Changes**: Review and batch-save multiple configuration changes
- **Smart Filtering**: Browse by Popular, Anthropic, OpenAI, or All models
- **Live Preview**: See current and pending configurations side-by-side
- **Deploy Management**: Deploy to production or staging environments
- **Secrets Management**: Set and list Cloudflare Workers secrets
- **Smart Caching**: Models list is cached for 24 hours to reduce API calls
- **Keyboard Shortcuts**: Ctrl+S to save, Ctrl+R to reset, Tab to navigate

## Tech Stack

- **Runtime**: Bun
- **UI Framework**: OpenTUI (`@opentui/core` and `@opentui/react`)
- **React**: 19.x
- **State Management**: Zustand + React Context
- **Schema Validation**: Zod
- **Process Execution**: zx, execa
- **HTTP Client**: undici

## Installation

```bash
# Install dependencies
bun install

# Build the CLI
bun run build

# Link globally (makes 'ccr' command available)
bun run link

# Or do everything at once
bun run setup
```

## Usage

The CLI can be run from **any directory** on your system after linking:

```bash
# Run from anywhere after linking
ccr

# Or run directly without building
cd apps/cli
bun run dev

# Or run the binary directly
/path/to/claude-code-setup/apps/cli/dist/router-workers-cli
```

**Note**: The compiled binary uses `import.meta.dir` to locate project files, so it works correctly regardless of your current directory.

## Navigation

- **↑↓ Arrow Keys**: Navigate menus and lists
- **Enter**: Select option
- **Tab**: Switch between panels (Quick Config)
- **Ctrl+S**: Save all pending changes
- **Ctrl+R**: Reset/discard pending changes
- **ESC**: Go back or exit

## Features Overview

### 1. Quick Config ⚡

**All-in-one configuration interface** with three panels:

- **Left Panel**: Select router type (default, background, think, longContext)
- **Middle Panel**: Filter models (Popular, Anthropic, OpenAI, All)
- **Right Panel**: Browse and select models

**Workflow**:

1. Use arrow keys to select router type
2. Press Tab to move to filter panel
3. Press Tab to move to model list
4. Select model with Enter
5. Repeat for other router types
6. Press Ctrl+S to save all changes

**Features**:

- See current values for all router types
- Preview pending changes before saving
- Configure multiple router types in one session
- Batch save with Ctrl+S
- Reset changes with Ctrl+R
- Visual indicators for unsaved changes

The CLI automatically:

- Fetches latest models from OpenRouter API
- Shows context length and pricing for each model
- Updates both the router configuration and provider models list
- Saves changes to `apps/router/config.json`

### 2. Deploy to Workers 🚀

Deploy your configuration to Cloudflare Workers:

- Deploy Now: Deploy configuration to your worker
- Check Deployment Status: View current deployment information

### 3. Manage Secrets 🔐

Manage Cloudflare Workers secrets:

- Set new secrets (e.g., `OPENROUTER_API_KEY`)
- List all configured secrets
- Update existing secrets

## Environment Variables

The CLI automatically loads environment variables from:

- `apps/cli/.env`
- `apps/router/.dev.vars`

Required variables:

- `OPENROUTER_API_KEY`: Your OpenRouter API key (for fetching models)

## Project Structure

```
apps/cli/
├── src/
│   ├── components/          # UI components
│   │   ├── MainMenu.tsx
│   │   ├── QuickConfig.tsx
│   │   ├── DeployManager.tsx
│   │   └── SecretsManager.tsx
│   ├── context/             # React context
│   │   └── ConfigContext.tsx
│   ├── types/               # TypeScript types
│   │   └── config.ts
│   ├── utils/               # Utilities
│   │   ├── cache.ts         # Model list caching
│   │   ├── config.ts        # Config loading/saving
│   │   ├── deploy.ts        # Deployment functions
│   │   ├── env.ts           # Environment loading
│   │   ├── openrouter.ts    # OpenRouter API client
│   │   └── secrets.ts       # Secrets management
│   └── index.tsx            # Entry point
├── .cache/                  # Cached model data (gitignored)
├── dist/                    # Compiled binary
├── package.json
└── tsconfig.json
```

## Development

```bash
# Run in development mode
bun run dev

# Type check
bun run check-types

# Lint and format
bun run lint

# Build
bun run build

# Clean and rebuild
bun run fresh
```

## Commands

- `bun run build`: Compile to standalone binary
- `bun run dev`: Run from source
- `bun run start`: Run compiled binary
- `bun run link`: Link binary globally as `ccr`
- `bun run setup`: Install + link
- `bun run fresh`: Clean + install + build + link

## Tips

- **Quick Config** lets you configure multiple router types before saving
- Use **Tab** to quickly move between panels without lifting your hands from the keyboard
- **Ctrl+S** saves all pending changes at once - no need to save after each selection
- **Ctrl+R** discards all pending changes if you change your mind
- Deploy to staging first to test changes before production
- The CLI automatically adds new models to the provider's models list
- Changes are only saved when you press Ctrl+S (pending changes are shown at the bottom)
- Models list is cached for 24 hours - first load fetches from API, subsequent loads use cache
- Use filter options (Popular, Anthropic, OpenAI) for faster navigation
- Current configuration is shown on the main menu for quick reference

## Troubleshooting

**"OPENROUTER_API_KEY not found"**

- Add your OpenRouter API key to `apps/cli/.env` or `apps/router/.dev.vars`
- The CLI automatically finds these files using `import.meta.dir`, even when running from other directories

**"Config file not found"**

- This should not happen with the compiled binary - it uses `import.meta.dir` to locate files
- If you see this error, try rebuilding: `cd apps/cli && bun run build`

**Deployment fails with "invalid cwd" error**

- This was fixed in v2.0.2 - rebuild the binary if you see this error
- The CLI now correctly finds the router directory from any location

**Models not loading**

- Verify your OpenRouter API key is valid
- Check your internet connection
- Try force refresh with Ctrl+F in Quick Config

## Recent Fixes (v2.0.2)

- ✅ Fixed environment loading in compiled binaries using `import.meta.dir`
- ✅ Fixed deployment path resolution from any directory
- ✅ CLI now works correctly when run from anywhere on the system
- ✅ Added multiple fallback strategies for robust path resolution

See [FIXES.md](./FIXES.md) for technical details.
