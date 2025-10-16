# Claude Code Router CLI

Interactive TUI (Terminal User Interface) for managing Claude Code Router configurations and Cloudflare Workers deployments.

## Features

- **View Configuration**: Display current router settings and model assignments
- **Model Selection**: Browse and select from all available OpenRouter models
- **Easy Configuration**: Update router types (default, background, think, longContext) with a few keystrokes
- **Deploy Management**: Deploy to production or staging environments
- **Secrets Management**: Set and list Cloudflare Workers secrets
- **Real-time Updates**: Fetch latest models from OpenRouter API

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

```bash
# Run the CLI
ccr

# Or run directly without building
bun run dev
```

## Navigation

- **↑↓ Arrow Keys**: Navigate menus and lists
- **Enter**: Select option
- **Tab**: Switch between input fields
- **ESC**: Go back or exit

## Features Overview

### 1. View Configuration

Displays your current router configuration including:

- Router settings (default, background, think, longContext models)
- Long context threshold
- Configured OpenRouter models

### 2. Select Models

Two-step process:

1. Choose which router type to configure (default, background, think, longContext)
2. Browse and select from all available OpenRouter models

The CLI automatically:

- Fetches latest models from OpenRouter API
- Shows context length for each model
- Updates both the router configuration and provider models list
- Saves changes to `apps/router/config.json`

### 3. Deploy to Workers

Deploy your configuration to Cloudflare Workers:

- Deploy to production environment
- Deploy to staging environment
- Check current deployment status

### 4. Manage Secrets

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
│   │   ├── ConfigViewer.tsx
│   │   ├── ModelSelector.tsx
│   │   ├── DeployManager.tsx
│   │   └── SecretsManager.tsx
│   ├── context/             # React context
│   │   └── ConfigContext.tsx
│   ├── types/               # TypeScript types
│   │   └── config.ts
│   ├── utils/               # Utilities
│   │   ├── config.ts        # Config loading/saving
│   │   ├── deploy.ts        # Deployment functions
│   │   ├── env.ts           # Environment loading
│   │   ├── openrouter.ts    # OpenRouter API client
│   │   └── secrets.ts       # Secrets management
│   └── index.tsx            # Entry point
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

- Use the Model Selector to quickly switch between models without editing JSON
- Deploy to staging first to test changes before production
- The CLI automatically adds new models to the provider's models list
- All changes are saved to `apps/router/config.json` immediately

## Troubleshooting

**"OPENROUTER_API_KEY not found"**

- Add your OpenRouter API key to `apps/cli/.env` or `apps/router/.dev.vars`

**"Config file not found"**

- Ensure you're running the CLI from the project root or that `apps/router/config.json` exists

**Deployment fails**

- Check that you have Wrangler configured and authenticated
- Run `bunx wrangler login` in `apps/router/` directory

**Models not loading**

- Verify your OpenRouter API key is valid
- Check your internet connection
