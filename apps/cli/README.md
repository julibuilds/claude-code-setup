# Claude Code Router CLI

Interactive Terminal UI for managing Cloudflare Workers router configuration.

## Features

- **Quick Config**: Configure all router models (default, background, think, longContext) in one interface
- **Deploy Manager**: Deploy to Cloudflare Workers with pre/post verification
- **Secrets Manager**: Manage Cloudflare Workers secrets with automatic local file sync
- **Smart Caching**: 24-hour TTL cache for OpenRouter models
- **Secret Masking**: Hide/show secrets with Ctrl+H toggle
- **Portable Binary**: Works from any directory using embedded path resolution

## Installation

### Local Development

```bash
# From apps/cli directory
bun install
bun run dev
```

### Global Installation

```bash
# Build and link globally
bun run setup

# Or step by step:
bun run build
bun run link

# Now available globally as 'ccr'
ccr
```

## Usage

### Quick Start

```bash
# Run the CLI
ccr

# Or from source
cd apps/cli
bun run dev
```

### Navigation

- **Arrow Keys**: Navigate menus and lists
- **Tab**: Switch between panels/fields
- **Enter**: Select/Submit
- **ESC**: Go back or exit
- **Ctrl+S**: Save changes (Quick Config)
- **Ctrl+R**: Reset pending changes (Quick Config)
- **Ctrl+F**: Force refresh models (Quick Config)
- **Ctrl+H**: Toggle secret visibility (Secrets Manager)

### Quick Config

Configure all router types in a single interface:

1. Select router type (default, background, think, longContext)
2. Filter models (Popular, Anthropic, OpenAI, All)
3. Browse and select models
4. Review pending changes
5. Save with Ctrl+S

### Deploy Manager

Deploy your configuration to Cloudflare Workers:

1. Pre-deployment file verification
2. Deployment execution with live output
3. Post-deployment verification
4. Clear success/error feedback

### Secrets Manager

Manage Cloudflare Workers secrets:

- **Set Secret**: Add or update secrets (syncs to both Workers and .dev.vars)
- **List Secrets**: View all configured secrets
- **Secret Masking**: Hide sensitive values with Ctrl+H

## Architecture

### Key Technologies

- **OpenTUI v0.1.27**: React-based TUI framework
- **React 19.2.0**: UI library
- **Bun**: Runtime and build tool
- **TypeScript 5.9+**: Type safety
- **Zod**: Schema validation

## Development

### Commands

```bash
# Development
bun run dev              # Run from source
bun run build            # Build binary
bun run start            # Run built binary

# Code Quality
bun run lint             # Lint and format
bun run check-types      # Type check
bun run ci               # Full CI checks

# Maintenance
bun run clean            # Clean build artifacts
bun run fresh            # Clean, install, build, link
```

## Configuration

### Environment Variables

Create `.env` in `apps/cli/`:

```env
OPENROUTER_API_KEY=your_key_here
```

### Project Root

The CLI automatically detects the project root using:

1. Stored project root (from `bun run link`)
2. Search up from current directory
3. `import.meta.dir` (for local development)
