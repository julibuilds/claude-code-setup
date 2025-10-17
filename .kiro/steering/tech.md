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

### CLI Stack (apps/cli)

- **UI Framework**: OpenTUI v0.1.27 (`@opentui/core` and `@opentui/react`)
- **React**: 19.2.0 for component architecture
- **State Management**: Zustand 5.0.8 + React Context
- **Process Execution**: execa 9.6.0, zx 8.8.4 for running wrangler commands
- **HTTP Client**: undici 7.16.0 for OpenRouter API calls
- **Schema Validation**: Zod 4.1.12
- **Query Management**: TanStack React Query 5.90.5 with persistence
- **Compilation**: `bun build --compile` for standalone binary
- **Path Resolution**: `import.meta.dir` for reliable file location in compiled binaries

### Frontend Stack (apps/web)

- **Framework**: Next.js 15.5.5 (App Router)
- **UI Library**: React 19.2.0
- **Styling**: Tailwind CSS v4.1.14, @tailwindcss/postcss 4.1.14
- **Component Library**: Radix UI primitives, shadcn/ui patterns
- **Utilities**: class-variance-authority 0.7.1, clsx 2.1.1, tailwind-merge 3.3.1
- **Icons**: lucide-react 0.545.0
- **Animations**: tw-animate-css 1.4.0

### Code Quality

- **Formatter/Linter**: Biome 2.2.6 (replaces ESLint + Prettier)
- **Security**: secretlint 11.2.5 for detecting secrets in code
- **Type Checking**: TypeScript 5.9.3 strict mode

### Deployment Targets

- **Edge**: Cloudflare Workers (via Wrangler 4.43.0)
- **Local**: Docker Compose, Bun dev server
- **Web**: Next.js (Vercel-ready)
- **CLI**: Standalone binary (works from any directory)

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

### CLI Tool

```bash
# Build CLI
cd apps/cli && bun run build

# Link CLI globally (makes 'ccr' command available)
cd apps/cli && bun run link

# Or do everything at once
cd apps/cli && bun run setup

# Run CLI from anywhere after linking
ccr

# Or run directly without building
cd apps/cli && bun run dev

# Clean and rebuild
cd apps/cli && bun run fresh
```

### Deployment

```bash
# Deploy using CLI (recommended - includes verification)
ccr
# Select "Deploy to Workers" → "Deploy Now"

# Or deploy manually
cd apps/router && bun run deploy:workers

# Set secrets using CLI (recommended - auto-syncs .dev.vars)
ccr
# Select "Manage Secrets" → "Set Secret"

# Or set secrets manually (won't sync .dev.vars)
cd apps/router && bunx wrangler secret put OPENROUTER_API_KEY

# View deployment logs
cd apps/router && bunx wrangler tail

# Check deployment status
cd apps/router && bunx wrangler deployments list
```

### Testing

```bash
# Test router locally
curl http://localhost:8787/

# Test deployed worker
curl https://your-worker.workers.dev/v1/messages/count_tokens
```

## CLI Technical Details

### Path Resolution in Compiled Binaries

The CLI uses `import.meta.dir` for reliable path resolution in compiled binaries:

```typescript
// Problem: process.execPath points to binary, not source
const binaryPath = process.execPath; // ❌ Unreliable in compiled binaries

// Solution: import.meta.dir is embedded at compile time
const sourceDir = import.meta.dir; // ✅ Points to source directory
```

**Why This Works**:

- `import.meta.dir` is embedded at compile time by Bun
- Points to original source directory, not binary location
- Works regardless of where binary is executed from
- Allows CLI to be truly portable (run from any directory)

**Implementation**:

```typescript
// In apps/cli/src/utils/env.ts
const sourceDir = import.meta.dir; // apps/cli/src/utils
const srcDir = resolve(sourceDir, ".."); // apps/cli/src
const cliDir = resolve(srcDir, ".."); // apps/cli
const appsDir = resolve(cliDir, ".."); // apps
const projectRoot = resolve(appsDir, ".."); // project root
const routerDir = resolve(projectRoot, "apps", "router"); // apps/router
```

**Note**: This approach was critical for fixing deployment and environment loading issues in v2.0.2.

### File Synchronization

The CLI automatically syncs local files with Cloudflare Workers to maintain consistency:

**Setting Secrets**:

1. Calls `wrangler secret put KEY` (remote - Cloudflare Workers)
2. Updates `apps/router/.dev.vars` (local - development environment)
3. Returns status with `localFileUpdated: boolean`
4. Shows confirmation for both operations in UI

**Deployment**:

1. Pre-deployment: Verifies `config.json`, `wrangler.toml`, `.dev.vars` exist
2. Runs `wrangler deploy` from correct directory
3. Post-deployment: Re-verifies files are intact
4. Returns status with `filesVerified: boolean` and warnings
5. Shows detailed feedback in UI

**Configuration Updates**:

1. User makes changes in Quick Config
2. Pending changes tracked in state
3. On Ctrl+S: Updates `config.json` and provider models list
4. Shows success/error feedback

**Key Functions**:

- `updateDevVars()`: Updates or appends key-value pairs in `.dev.vars`
- `verifyLocalFiles()`: Checks required files exist
- `saveConfig()`: Writes updated configuration to `config.json`
- `syncProviderModels()`: Ensures provider models list includes selected models

### Caching Strategy

**Model List Caching**:

- Cache location: `apps/cli/.cache/openrouter-models.json`
- TTL: 24 hours (86400000 ms)
- Cache key: Based on timestamp in cached file
- Force refresh: Ctrl+F in Quick Config (bypasses cache)
- Auto-refresh: Fetches new data if cache is stale

**Benefits**:

- Reduces API calls to OpenRouter (rate limiting, cost)
- Faster startup time (no network delay)
- Works offline (if cache exists and is valid)
- Automatic cache invalidation after 24 hours
- Manual refresh available for immediate updates

**Implementation**:

```typescript
// In apps/cli/src/utils/cache.ts
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_FILE = join(cliDir, ".cache", "openrouter-models.json");

// Check if cache is valid
const isCacheValid = (timestamp: number) => Date.now() - timestamp < CACHE_TTL;
```

### OpenTUI Framework

The CLI uses OpenTUI v0.1.27 for terminal UI (React-based TUI framework):

**Key Components**:

- `<box>`: Container with flexbox layout, borders, padding
- `<text>`: Text display with styling (colors, attributes)
- `<input>`: Text input with focus management and callbacks
- `<select>`: Dropdown selection with keyboard navigation and scroll indicators
- `<scrollbox>`: Scrollable content area with customizable scrollbars
- `<tab-select>`: Tab-based navigation component
- `<ascii-font>`: ASCII art text rendering

**Critical Patterns**:

- Only ONE component can have `focused={true}` at a time
- Use `useKeyboard()` hook for keyboard shortcuts
- Tab key for focus cycling between components
- ESC key for navigation back/exit
- `<select>` requires explicit height on both container and component
- `import.meta.dir` for path resolution in compiled binaries

**Example**:

```typescript
const [focused, setFocused] = useState<"input1" | "input2">("input1");

useKeyboard((key) => {
  if (key.name === "tab") {
    setFocused(prev => prev === "input1" ? "input2" : "input1");
  }
  if (key.name === "escape") {
    process.exit(0);
  }
});

<input focused={focused === "input1"} onInput={setValue1} />
<input focused={focused === "input2"} onInput={setValue2} />
```

**See `.kiro/steering/opentui.md` for comprehensive OpenTUI documentation and patterns.**

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

## Important Bun Features Used

### Compiled Binaries

```bash
# Compile to standalone binary
bun build src/index.tsx --compile --outfile dist/router-workers-cli
```

**Features**:

- Includes Bun runtime
- Self-contained executable
- `import.meta.dir` embedded at compile time
- Works without Bun installation

### Environment Variables

```typescript
// Bun auto-loads .env files when running with 'bun run'
// But NOT in compiled binaries - must load manually
await loadEnv(); // Custom implementation using import.meta.dir
```

### File I/O

```typescript
// Read file
const content = await Bun.file(path).text();

// Write file
await Bun.write(path, content);

// Check if exists
import { existsSync } from "node:fs";
if (existsSync(path)) { ... }
```
