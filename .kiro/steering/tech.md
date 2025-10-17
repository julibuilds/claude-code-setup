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

- **UI Framework**: OpenTUI (`@opentui/core` and `@opentui/react`)
- **React**: 19.x for component architecture
- **State Management**: Zustand + React Context
- **Process Execution**: execa, zx for running wrangler commands
- **HTTP Client**: undici for OpenRouter API calls
- **Compilation**: `bun build --compile` for standalone binary
- **Path Resolution**: `import.meta.dir` for reliable file location in compiled binaries

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

### CLI Tool

```bash
# Build CLI
cd apps/cli && bun run build

# Link CLI globally (makes 'ccr' command available)
cd apps/cli && bun run link

# Run CLI from anywhere
ccr

# Or run directly without building
cd apps/cli && bun run dev
```

### Deployment

```bash
# Deploy using CLI (recommended)
ccr
# Select "Deploy to Workers" → "Deploy Now"

# Or deploy manually
cd apps/router && bun run deploy:workers

# Set secrets using CLI (recommended - syncs .dev.vars)
ccr
# Select "Manage Secrets" → "Set Secret"

# Or set secrets manually
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

## CLI Technical Details

### Path Resolution in Compiled Binaries

The CLI uses `import.meta.dir` for reliable path resolution:

```typescript
// Problem: process.execPath points to binary, not source
const binaryPath = process.execPath; // ❌ Unreliable

// Solution: import.meta.dir is embedded at compile time
const sourceDir = import.meta.dir; // ✅ Points to source directory
```

**Why This Works**:

- `import.meta.dir` is embedded at compile time by Bun
- Points to original source directory, not binary location
- Works regardless of where binary is executed from
- Allows CLI to be truly portable

**Implementation**:

```typescript
// In apps/cli/src/utils/env.ts
const sourceDir = import.meta.dir; // apps/cli/src/utils
const srcDir = resolve(sourceDir, ".."); // apps/cli/src
const cliDir = resolve(srcDir, ".."); // apps/cli
const appsDir = resolve(cliDir, ".."); // apps
const projectRoot = resolve(appsDir, ".."); // project root
```

### File Synchronization

The CLI automatically syncs local files with Cloudflare Workers:

**Setting Secrets**:

1. Calls `wrangler secret put KEY` (remote)
2. Updates `apps/router/.dev.vars` (local)
3. Returns status with `localFileUpdated: boolean`

**Deployment**:

1. Pre-deployment: Verifies `config.json`, `wrangler.toml`, `.dev.vars` exist
2. Runs `wrangler deploy`
3. Post-deployment: Re-verifies files
4. Returns status with `filesVerified: boolean` and warnings

**Key Functions**:

- `updateDevVars()`: Updates or appends key-value pairs in `.dev.vars`
- `verifyLocalFiles()`: Checks required files exist
- `backupFile()`: Creates timestamped backups (planned)

### Caching Strategy

**Model List Caching**:

- Cache location: `apps/cli/.cache/openrouter-models.json`
- TTL: 24 hours
- Cache key: Based on timestamp
- Force refresh: Ctrl+F in Quick Config

**Benefits**:

- Reduces API calls to OpenRouter
- Faster startup time
- Works offline (if cache exists)
- Automatic cache invalidation after 24 hours

### OpenTUI Framework

The CLI uses OpenTUI for terminal UI:

**Key Components**:

- `<box>`: Container with flexbox layout
- `<text>`: Text display with styling
- `<input>`: Text input with focus management
- `<select>`: Dropdown selection with keyboard navigation
- `<scrollbox>`: Scrollable content area

**Critical Patterns**:

- Only ONE component can have `focused={true}` at a time
- Use `useKeyboard()` hook for keyboard shortcuts
- Tab key for focus cycling
- ESC key for navigation back

**Example**:

```typescript
const [focused, setFocused] = useState<"input1" | "input2">("input1");

useKeyboard((key) => {
  if (key.name === "tab") {
    setFocused(prev => prev === "input1" ? "input2" : "input1");
  }
});

<input focused={focused === "input1"} />
<input focused={focused === "input2"} />
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
