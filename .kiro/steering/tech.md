## Tech Stack

### Build System & Package Management

- **Monorepo**: Turborepo for task orchestration and caching
- **Package Manager**: Bun (>=1.3.0) - required for all operations
- **Workspaces**: `apps/*`, `packages/*`, `dev/*`

### Core Technologies

- **Runtime**: Bun for local development, Cloudflare Workers for edge deployment
- **Language**: TypeScript 5.9+
- **Web Framework**: Hono (lightweight, edge-compatible)
- **Validation**: Zod for schema validation
- **Token Counting**: js-tiktoken, tiktoken

### Frontend Stack (apps/web)

- **Framework**: Next.js 15+ (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4+, @tailwindcss/postcss
- **Component Library**: Radix UI primitives, shadcn/ui patterns
- **Utilities**: class-variance-authority, clsx, tailwind-merge

### Code Quality

- **Formatter/Linter**: Biome (replaces ESLint + Prettier)
- **Security**: secretlint for detecting secrets in code
- **Type Checking**: TypeScript strict mode

### Deployment Targets

- **Edge**: Cloudflare Workers (via Wrangler)
- **Local**: Docker Compose, Bun dev server
- **Web**: Next.js (Vercel-ready)

## Common Commands

### Development

```bash
# Install dependencies
bun install

# Start all apps in dev mode
bun run dev

# Start specific app
bun run dev --filter=router
bun run dev --filter=web

# Local Cloudflare Workers dev server
cd apps/router && bun run dev:workers
```

### Building

```bash
# Build all packages and apps
bun run build

# Build specific workspace
bun run build --filter=@repo/core
bun run build --filter=router

# Build for Cloudflare Workers
cd apps/router && bun run build:workers
```

### Code Quality

```bash
# Lint and format all code
bun run lint

# Type check all workspaces
bun run check-types

# Run full CI checks (lint + type check)
bun run ci
```

### Deployment

```bash
# Deploy router to Cloudflare Workers
cd apps/router && bun run deploy:workers

# Set Cloudflare secrets
cd apps/router && bunx wrangler secret put OPENROUTER_API_KEY

# View deployment logs
cd apps/router && bunx wrangler tail
```

### Testing

```bash
# Test router locally
curl http://localhost:8787/

# Test deployed worker
curl https://your-worker.workers.dev/v1/messages/count_tokens
```

## Code Style Conventions

### Biome Configuration

- **Indentation**: Tabs (not spaces)
- **Line Width**: 100 characters
- **Quotes**: Double quotes for JavaScript/TypeScript
- **Semicolons**: Always required
- **Trailing Commas**: ES5 style
- **Import Organization**: Automatic via Biome assist

### File Naming

- TypeScript/JavaScript: camelCase or kebab-case
- React Components: PascalCase
- Configuration: lowercase with extensions (e.g., `config.json`, `wrangler.toml`)

### Package References

Use workspace protocol for internal packages:

```json
"dependencies": {
  "@repo/core": "*",
  "@repo/ui": "*"
}
```
