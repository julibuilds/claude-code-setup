# Claude Code Router CLI

Interactive TUI (Terminal User Interface) for managing Claude Code Router configurations and Cloudflare Workers deployments.

## Features

- **⚡ Quick Config**: All-in-one interface to configure all router models simultaneously
- **Pending Changes**: Review and batch-save multiple configuration changes
- **Smart Filtering**: Browse by Popular, Anthropic, OpenAI, or All models
- **Live Preview**: See current and pending configurations side-by-side
- **Deploy Management**: Deploy with pre/post verification of local files
- **Secrets Management**: Set secrets with automatic `.dev.vars` sync
- **File Synchronization**: Automatically keeps local files in sync with Cloudflare Workers
- **Smart Caching**: Models list is cached for 24 hours to reduce API calls
- **Portable Binary**: Works from any directory using `import.meta.dir`
- **Keyboard Shortcuts**: Ctrl+S to save, Ctrl+R to reset, Ctrl+F to force refresh, Tab to navigate

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

Deploy your configuration to Cloudflare Workers with automatic verification:

- **Deploy Now**: Deploy configuration with pre/post file verification
- **Check Deployment Status**: View current deployment information

**File Verification**:

- Pre-deployment: Checks that `config.json`, `wrangler.toml`, and `.dev.vars` exist
- Post-deployment: Verifies files are still intact
- Shows warnings for missing or invalid files

**Example Output**:

```
Verifying local configuration files...
✓ Local configuration files verified

Running: bunx wrangler deploy
[deployment output...]

✓ Deployment successful!
✓ Local configuration files verified
```

### 3. Manage Secrets 🔐

Manage Cloudflare Workers secrets with automatic local file synchronization:

- **Set Secret**: Sets secret in Workers AND updates local `.dev.vars`
- **List Secrets**: View all configured secrets

**File Synchronization**:
When you set a secret, the CLI:

1. Sets the secret in Cloudflare Workers (production)
2. Automatically updates `apps/router/.dev.vars` (local development)
3. Shows confirmation for both operations

**Example Output**:

```
Setting secret: OPENROUTER_API_KEY...

✓ Secret set successfully in Cloudflare Workers!
✓ Local .dev.vars file updated
```

**Benefits**:

- No manual file editing required
- Local and remote stay in sync
- Secrets work immediately in local development

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
│   │   ├── deploy.ts        # Deployment with verification
│   │   ├── env.ts           # Environment loading (import.meta.dir)
│   │   ├── openrouter.ts    # OpenRouter API client
│   │   ├── secrets.ts       # Secrets with .dev.vars sync
│   │   └── sync.ts          # File synchronization utilities
│   └── index.tsx            # Entry point
├── .cache/                  # Cached model data (gitignored)
├── .env                     # CLI secrets (gitignored)
├── dist/                    # Compiled binary
├── package.json
├── tsconfig.json
├── README.md                # This file
├── FILE-SYNC.md             # File synchronization guide
├── FIXES.md                 # Bug fixes and resolutions
├── SOLUTION.md              # Technical implementation details
└── TODO.md                  # Planned features
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

### Configuration

- **Quick Config** lets you configure multiple router types before saving
- Use **Tab** to quickly move between panels without lifting your hands from the keyboard
- **Ctrl+S** saves all pending changes at once - no need to save after each selection
- **Ctrl+R** discards all pending changes if you change your mind
- **Ctrl+F** forces a fresh fetch of models from OpenRouter API (bypasses cache)
- Changes are only saved when you press Ctrl+S (pending changes are shown at the bottom)
- Current configuration is shown on the main menu for quick reference

### Secrets & Deployment

- Always use the CLI to set secrets - it keeps local and remote in sync
- The CLI automatically updates `.dev.vars` when you set secrets
- Deployment verifies local files before and after deploying
- Review pending changes before deploying to ensure configuration is correct

### Performance

- Models list is cached for 24 hours - first load fetches from API, subsequent loads use cache
- Use filter options (Popular, Anthropic, OpenAI) for faster navigation
- The CLI automatically adds new models to the provider's models list

### File Management

- Never manually edit `.dev.vars` - use the CLI to keep it in sync with Workers
- The CLI uses `import.meta.dir` to find files, so it works from any directory
- Local files are automatically verified during deployment

## File Synchronization

The CLI automatically keeps local configuration files in sync with Cloudflare Workers.

### Files Managed

| File            | Location       | Synced When     | Purpose                         |
| --------------- | -------------- | --------------- | ------------------------------- |
| `.dev.vars`     | `apps/router/` | Setting secrets | Local development secrets       |
| `config.json`   | `apps/router/` | Saving config   | Router configuration            |
| `wrangler.toml` | `apps/router/` | Deployment      | Worker settings (verified only) |

### How It Works

**Setting a Secret**:

```
User sets OPENROUTER_API_KEY
  ↓
1. wrangler secret put OPENROUTER_API_KEY (Cloudflare Workers)
  ↓
2. Update apps/router/.dev.vars (local file)
  ↓
3. Show success with file update status
```

**Deploying**:

```
User deploys to Workers
  ↓
1. Verify config.json, wrangler.toml exist
  ↓
2. Run wrangler deploy
  ↓
3. Post-deployment verification
  ↓
4. Show results and warnings
```

### Benefits

- **Consistency**: Local and remote configurations stay in sync
- **No Manual Editing**: CLI handles all file updates
- **Safety**: Verification before and after deployment
- **Transparency**: Clear feedback about what was updated

See [FILE-SYNC.md](./FILE-SYNC.md) for complete documentation.

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

## What's New in v2.0.2

### File Synchronization ✨

- ✅ Secrets automatically sync to `.dev.vars` when set
- ✅ Deployment verifies local files before and after deploying
- ✅ Clear feedback about file operations in the UI
- ✅ No manual file editing required

### Path Resolution Fixes 🔧

- ✅ Fixed environment loading in compiled binaries using `import.meta.dir`
- ✅ Fixed deployment path resolution from any directory
- ✅ CLI now works correctly when run from anywhere on the system
- ✅ Added multiple fallback strategies for robust path resolution

### Enhanced UI Feedback 📊

- ✅ Shows which files were updated after setting secrets
- ✅ Displays verification status during deployment
- ✅ Warns about missing or invalid configuration files
- ✅ Clear success/error messages for all operations

## Documentation

- **[FILE-SYNC.md](./FILE-SYNC.md)** - Complete guide to file synchronization
- **[FIXES.md](./FIXES.md)** - Bug fixes and resolutions
- **[SOLUTION.md](./SOLUTION.md)** - Technical implementation details
- **[TODO.md](./TODO.md)** - Planned features and roadmap

## Version History

### v2.0.2 (Current)

- File synchronization for secrets and deployment
- Path resolution using `import.meta.dir`
- Enhanced UI feedback
- Pre/post deployment verification

### v2.0.1

- Environment loading from any directory
- Cache behavior improvements
- Deployment fixes

### v2.0.0

- Initial UX overhaul
- Quick Config interface
- Pending changes system
