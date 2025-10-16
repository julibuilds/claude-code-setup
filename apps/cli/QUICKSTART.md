# Quick Start Guide

## Setup

1. **Install dependencies**:

   ```bash
   cd apps/cli
   bun install
   ```

2. **Set up environment variables**:
   Create `.env` file in `apps/cli/` or `apps/router/.dev.vars`:

   ```bash
   OPENROUTER_API_KEY=your_api_key_here
   ```

3. **Build and link the CLI**:

   ```bash
   bun run setup
   ```

   This will:

   - Build the CLI binary
   - Link it globally as `ccr` command

## Usage

Run the CLI from anywhere:

```bash
ccr
```

Or run directly from source:

```bash
cd apps/cli
bun run dev
```

## Features

### 1. View Configuration

- See current router settings
- View assigned models for each router type
- Check long context threshold

### 2. Select Models

- Browse all available OpenRouter models
- Update default, background, think, or longContext models
- Automatically updates config.json

### 3. Deploy to Workers

- Deploy to production or staging
- Check deployment status
- View deployment logs

### 4. Manage Secrets

- Set Cloudflare Workers secrets
- List configured secrets
- Update API keys

## Keyboard Shortcuts

- **↑↓**: Navigate menus
- **Enter**: Select option
- **Tab**: Switch input fields
- **ESC**: Go back / Exit

## Common Tasks

### Change the default model

1. Run `ccr`
2. Select "Select Models"
3. Choose "Default Model"
4. Browse and select your preferred model
5. Press ESC to return to main menu

### Deploy changes

1. Run `ccr`
2. Select "Deploy to Workers"
3. Choose "Deploy to Production" or "Deploy to Staging"
4. Wait for deployment to complete

### Update API key

1. Run `ccr`
2. Select "Manage Secrets"
3. Choose "Set Secret"
4. Enter key name (e.g., `OPENROUTER_API_KEY`)
5. Enter the secret value
6. Press Enter to submit

## Troubleshooting

**CLI not found after linking**:

```bash
cd apps/cli
bun run link
```

**Can't fetch models**:

- Check your `OPENROUTER_API_KEY` is set correctly
- Verify internet connection

**Deployment fails**:

```bash
cd apps/router
bunx wrangler login
```

## Development

Run in development mode with hot reload:

```bash
bun run dev
```

Type check:

```bash
bun run check-types
```

Lint and format:

```bash
bun run lint
```
