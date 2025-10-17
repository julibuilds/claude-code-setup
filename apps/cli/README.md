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

### Project Structure

```
apps/cli/
├── src/
│   ├── components/
│   │   ├── common/          # Reusable components
│   │   ├── layout/          # Layout components
│   │   └── features/        # Feature screens
│   ├── constants/           # App constants
│   ├── context/             # React context
│   ├── design/              # Theme and design system
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript types
│   └── utils/               # Utilities
├── dist/                    # Compiled binary
├── .cache/                  # Cached model data
└── package.json
```

### Key Technologies

- **OpenTUI v0.1.27**: React-based TUI framework
- **React 19.2.0**: UI library
- **Bun**: Runtime and build tool
- **TypeScript 5.9+**: Type safety
- **Zod**: Schema validation

### Design System

Centralized theme in `src/design/theme.ts`:

- Color palette (bg, accent, status, text)
- Spacing scale
- Border styles
- Component styles
- Animation configuration

### Focus Management

Unified focus management via `useFocusManager` hook:

```typescript
const { focused, isFocused } = useFocusManager({
  initialFocus: "field1",
  items: ["field1", "field2", "field3"]
});
```

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

### Adding New Features

1. Create feature directory in `src/components/features/`
2. Use layout components from `src/components/layout/`
3. Use common components from `src/components/common/`
4. Follow theme system from `src/design/theme.ts`
5. Use constants from `src/constants/`
6. Add error boundaries for robustness

### Code Style

- **Indentation**: Tabs (not spaces)
- **Line Width**: 100 characters
- **File Size**: Max 450 lines per file
- **Quotes**: Double quotes
- **Semicolons**: Always required
- **Imports**: Organized via Biome

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

## Troubleshooting

### CLI Not Found

```bash
# Re-link the binary
cd apps/cli
bun run link
```

### Config Not Found

```bash
# Ensure you're in the project directory
cd /path/to/claude-code-setup

# Or run from apps/cli
cd apps/cli
bun run dev
```

### Cache Issues

```bash
# Clear model cache
rm -rf apps/cli/.cache
```

### Build Issues

```bash
# Clean rebuild
cd apps/cli
bun run fresh
```

## Contributing

1. Follow the code style guidelines
2. Keep files under 450 lines
3. Use the design system consistently
4. Add TypeScript types for all functions
5. Test locally before committing

## License

See root LICENSE file.
