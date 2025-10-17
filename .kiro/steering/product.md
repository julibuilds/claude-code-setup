## Product Overview

Claude Code Toolkit is a multi-provider LLM proxy/router system designed for Claude Code integration. The project enables intelligent routing of API requests across multiple LLM providers (primarily OpenRouter) with automatic model selection based on context length, task type, and other criteria.

### Core Components

- **Router/Proxy Service**: Edge-deployed service (Cloudflare Workers) that routes Claude API requests to multiple LLM providers with request/response transformation
- **CLI Tool**: Interactive TUI for managing router configurations, deployments, and secrets with automatic file synchronization
- **Core Library**: Shared utilities for token counting, API transformations, and common functionality
- **Web UI**: Next.js-based management interface for configuration and monitoring (in development)

### Key Features

#### Router Service

- Multi-provider support with intelligent routing rules
- Request/response transformation between Claude API and provider formats
- Token usage tracking per session
- Streaming support (SSE)
- Global edge deployment with zero infrastructure management
- Local development via Docker and Cloudflare Workers

#### CLI Tool (v2.0.2)

- **Quick Config**: All-in-one interface to configure all router types simultaneously
- **Smart Filtering**: Browse models by Popular, Anthropic, OpenAI, or All
- **Pending Changes System**: Review and batch-save multiple configuration changes
- **Deploy Management**: Deploy to Cloudflare Workers with pre/post verification
- **Secrets Management**: Set and list Cloudflare Workers secrets with automatic local file sync
- **File Synchronization**: Automatically updates `.dev.vars` when setting secrets
- **Smart Caching**: Models list cached for 24 hours to reduce API calls
- **Portable Binary**: Works from any directory using `import.meta.dir` for path resolution
- **Keyboard Shortcuts**: Ctrl+S to save, Ctrl+R to reset, Ctrl+F to force refresh, Tab to navigate

### Development Workflow

1. **Configure Router**: Use CLI Quick Config to set up routing rules and model selections
2. **Test Locally**: Run router with `bun run dev` using `.dev.vars` for secrets
3. **Deploy**: Use CLI to deploy to Cloudflare Workers with automatic verification
4. **Monitor**: Check deployment status and logs through CLI or Cloudflare dashboard

### File Management

The CLI automatically keeps local files in sync with Cloudflare Workers:

- **`.dev.vars`**: Updated when setting secrets (local development)
- **`config.json`**: Updated when saving router configuration
- **`wrangler.toml`**: Verified before deployment (read-only)

See `apps/cli/FILE-SYNC.md` for detailed file synchronization documentation.
