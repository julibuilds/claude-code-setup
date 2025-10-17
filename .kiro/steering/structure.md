## Project Structure

### Monorepo Layout

```
claude-code-setup/
├── apps/                    # Application workspaces
│   ├── router/             # Cloudflare Workers proxy/router service
│   ├── cli/                # Interactive TUI for router management
│   └── web/                # Next.js web UI (in development)
├── packages/               # Shared packages
│   ├── core/              # Core utilities, transformers, token counting
│   └── ui/                # Shared React components (shadcn/ui)
├── dev/                    # Development tooling
│   ├── eslint-config/     # Shared ESLint configuration
│   ├── typescript-config/ # Shared TypeScript configurations
│   └── scripts/           # Build and deployment scripts
├── _examples/             # Reference implementations (read-only)
├── _backup/               # Archived documentation and code
└── node_modules/          # Dependencies (managed by Bun)
```

### Apps Structure

#### apps/router (Cloudflare Workers)

```
apps/router/
├── src/
│   ├── workers.ts         # Cloudflare Workers entry point
│   ├── server.ts          # Hono server setup
│   ├── index.ts           # Local Bun server entry
│   ├── middleware/        # Auth, routing, transformation logic
│   ├── routes/            # API route handlers
│   └── utils/             # Caching, helpers
├── config.json            # Router configuration (providers, routing rules)
├── wrangler.toml          # Cloudflare Workers configuration
├── .dev.vars              # Local development secrets (gitignored)
└── package.json
```

**Key Files**:

- `config.json`: Provider settings, API keys, routing rules
- `wrangler.toml`: Cloudflare deployment config, environment variables
- `.dev.vars`: Local secrets for development (never commit)

#### apps/cli (Interactive TUI)

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
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript types
│   │   └── config.ts
│   ├── utils/               # Utilities
│   │   ├── cache.ts         # Model list caching (24h TTL)
│   │   ├── config.ts        # Config loading/saving
│   │   ├── deploy.ts        # Deployment with verification
│   │   ├── env.ts           # Environment loading (import.meta.dir)
│   │   ├── openrouter.ts    # OpenRouter API client
│   │   ├── secrets.ts       # Secrets with .dev.vars sync
│   │   └── sync.ts          # File synchronization utilities
│   └── index.tsx            # Entry point
├── scripts/                 # Build scripts
│   └── post-link.ts         # Post-link setup script
├── .cache/                  # Cached model data (gitignored)
│   └── openrouter-models.json
├── dist/                    # Compiled binary (gitignored)
│   └── router-workers-cli   # Standalone executable
├── .env                     # CLI secrets (gitignored)
├── package.json
├── tsconfig.json
├── README.md                # Usage guide
├── PLAN.md                  # UI/UX renovation plan
└── TODO.md                  # Planned features
```

**Key Features**:

- Compiled to standalone binary using `bun build --compile`
- Uses `import.meta.dir` for reliable path resolution in compiled binaries
- Automatically syncs `.dev.vars` when setting secrets
- Verifies local files before/after deployment
- Smart caching with 24-hour TTL for model lists
- Built with OpenTUI v0.1.27 (React-based TUI framework)
- Pending changes system for batch configuration updates
- Multi-panel Quick Config interface
- Keyboard shortcuts: Ctrl+S (save), Ctrl+R (reset), Ctrl+F (force refresh), Tab (navigate)

**Global Command**: `ccr` (after running `bun run link`)

**Current Version**: v2.0.2+ (file synchronization, path resolution fixes)

#### apps/web (Next.js)

```
apps/web/
├── app/                   # Next.js App Router pages
├── components/            # Page-specific components
├── public/                # Static assets
├── tailwind.config.ts     # Tailwind configuration
└── package.json
```

### Packages Structure

#### packages/core

Shared business logic and utilities used across apps.

```
packages/core/
├── src/
│   ├── index.ts           # Node/Bun exports
│   ├── browser.ts         # Browser/Workers exports
│   └── ...                # Transformers, token counting, types
├── dist/                  # Compiled output
└── package.json
```

**Exports**:

- `@repo/core`: Main entry (Node/Bun)
- `@repo/core/browser`: Browser/Workers-compatible entry

#### packages/ui

Shared React components based on shadcn/ui patterns.

```
packages/ui/
├── src/
│   ├── components/        # Reusable components
│   │   └── ui/           # Base UI primitives (Radix UI)
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities (cn, etc.)
│   └── styles/           # Global CSS
└── package.json
```

**Exports**: Path-based exports for granular imports

```typescript
import { Button } from "@repo/ui/components/ui/button";
import { useToast } from "@repo/ui/hooks/use-toast";
```

### Configuration Files

#### Root Level

- `package.json`: Workspace configuration, root scripts
- `turbo.json`: Turborepo task pipeline and caching
- `biome.json`: Code formatting and linting rules
- `docker-compose.yml`: Local Docker setup
- `.gitignore`: Git ignore patterns
- `.npmrc`: NPM/Bun registry configuration

#### Workspace Level

Each workspace has its own:

- `package.json`: Dependencies and scripts
- `tsconfig.json`: TypeScript configuration (extends from `dev/typescript-config`)

### Important Directories

- **\_examples/**: Reference implementations - DO NOT MODIFY, use as reference only
- **\_backup/**: Archived files - historical reference
- **.turbo/**: Turborepo cache - gitignored, auto-generated
- **node_modules/**: Dependencies - gitignored
- **dist/**: Build output - gitignored

### Naming Conventions

- **Apps**: Lowercase, kebab-case (e.g., `router`, `web`)
- **Packages**: Scoped with `@repo/` prefix (e.g., `@repo/core`, `@repo/ui`)
- **Source Files**: camelCase or kebab-case for utilities, PascalCase for components
- **Config Files**: Lowercase with standard extensions

### Adding New Workspaces

1. Create directory in appropriate workspace folder (`apps/`, `packages/`, `dev/`)
2. Add `package.json` with appropriate name and dependencies
3. Workspace is auto-discovered (defined in root `package.json` workspaces field)
4. Reference internal packages using workspace protocol: `"@repo/core": "*"`

### Build Outputs

- **packages/core/dist/**: Compiled JavaScript and type definitions
- **apps/router/dist/**: Bundled Workers script (for local Bun server)
- **apps/cli/dist/**: Compiled standalone binary (router-workers-cli)
- **apps/cli/.cache/**: Cached OpenRouter model data (24-hour TTL)
- **apps/web/.next/**: Next.js build output
- **.turbo/cache/**: Turborepo task cache
- **.turbo/cookies/**: Turborepo session cookies

All build outputs are gitignored and regenerated on build.

**Note**: The CLI binary (`apps/cli/dist/router-workers-cli`) is a self-contained executable that includes the Bun runtime and all dependencies.

### Important Files for CLI

- **apps/router/.dev.vars**: Local development secrets (synced by CLI when setting secrets)
- **apps/router/config.json**: Router configuration (edited by CLI Quick Config)
- **apps/router/wrangler.toml**: Cloudflare Workers config (verified by CLI during deployment)
- **apps/cli/.env**: CLI-specific secrets (OPENROUTER_API_KEY for fetching models)
- **apps/cli/.cache/openrouter-models.json**: Cached model list (24h TTL, auto-refreshed)

### Path Resolution in Compiled Binaries

The CLI uses `import.meta.dir` for path resolution, which is embedded at compile time by Bun:

```typescript
// In apps/cli/src/utils/env.ts
const sourceDir = import.meta.dir; // Points to apps/cli/src/utils
const srcDir = resolve(sourceDir, ".."); // apps/cli/src
const cliDir = resolve(srcDir, ".."); // apps/cli
const appsDir = resolve(cliDir, ".."); // apps
const projectRoot = resolve(appsDir, ".."); // project root
const routerDir = resolve(projectRoot, "apps", "router"); // apps/router
```

This allows the compiled binary to:
- Work from any directory on the system
- Find project files reliably
- Load environment variables correctly
- Execute wrangler commands in the right directory

**Critical for**: Environment loading, deployment, secrets management, config updates.
