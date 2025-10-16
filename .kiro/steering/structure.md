## Project Structure

### Monorepo Layout

```
claude-code-setup/
├── apps/                    # Application workspaces
│   ├── router/             # Cloudflare Workers proxy/router service
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
- **apps/router/dist/**: Bundled Workers script
- **apps/web/.next/**: Next.js build output
- **.turbo/cache/**: Turborepo task cache

All build outputs are gitignored and regenerated on build.
