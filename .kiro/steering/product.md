## Product Overview

Claude Code Toolkit is a multi-provider LLM proxy/router system designed for Claude Code integration. The project enables intelligent routing of API requests across multiple LLM providers (primarily OpenRouter) with automatic model selection based on context length, task type, and other criteria.

**Current Status**: CLI tool (v2.0.2+) is fully functional with file synchronization, deployment management, and configuration features. Router service is operational for local and edge deployment. Web UI is in early development.

### Core Components

- **Router/Proxy Service**: Edge-deployed service (Cloudflare Workers) that routes Claude API requests to multiple LLM providers with request/response transformation
- **CLI Tool**: Interactive TUI for managing router configurations, deployments, and secrets with automatic file synchronization
- **Core Library**: Shared utilities for token counting, API transformations, and common functionality
- **Web UI**: Next.js-based management interface for configuration and monitoring (early development, not yet functional)

### Key Features

#### Router Service

**Core Features**:
- Multi-provider support with intelligent routing rules
- Request/response transformation between Claude API and provider formats
- Token usage tracking per session
- Streaming support (SSE)
- Global edge deployment with zero infrastructure management
- Local development via Docker and Cloudflare Workers

**Router Types**:
- **default**: Standard requests (general coding, chat)
- **background**: Background tasks (analysis, refactoring)
- **think**: Complex reasoning tasks (architecture, debugging)
- **longContext**: Large context requests (threshold: 60,000 tokens)

**Configuration Structure** (`apps/router/config.json`):
- Provider settings (API base URL, API key, models list)
- Router mappings (router type → provider,model)
- Transformer settings (request/response transformation)
- Server settings (host, port, logging, timeouts)

#### CLI Tool (v2.0.2+)

**Configuration Management**:
- **Quick Config**: All-in-one interface to configure all router types simultaneously
- **Smart Filtering**: Browse models by Popular, Anthropic, OpenAI, or All
- **Pending Changes System**: Review and batch-save multiple configuration changes
- **Live Preview**: See current and pending configurations side-by-side
- **Model Information**: Shows context length, pricing, and provider for each model

**Deployment & Operations**:
- **Deploy Management**: Deploy to Cloudflare Workers with pre/post verification
- **Secrets Management**: Set and list Cloudflare Workers secrets with automatic local file sync
- **File Synchronization**: Automatically updates `.dev.vars` when setting secrets
- **Deployment Verification**: Checks required files exist before and after deployment

**Performance & UX**:
- **Smart Caching**: Models list cached for 24 hours to reduce API calls
- **Portable Binary**: Works from any directory using `import.meta.dir` for path resolution
- **Keyboard Shortcuts**: Ctrl+S (save), Ctrl+R (reset), Ctrl+F (force refresh), Tab (navigate)
- **Visual Feedback**: Status indicators, error messages, and success confirmations
- **Multi-Panel Interface**: Three-panel layout in Quick Config for efficient navigation

### Development Workflow

1. **Configure Router**: Use CLI Quick Config to set up routing rules and model selections
   - Select router type (default, background, think, longContext)
   - Filter models by category (Popular, Anthropic, OpenAI, All)
   - Review pending changes before saving
   - Save all changes with Ctrl+S

2. **Set Secrets**: Use CLI Secrets Manager to configure API keys
   - Automatically syncs to both Cloudflare Workers and `.dev.vars`
   - No manual file editing required

3. **Test Locally**: Run router with `bun run dev` using `.dev.vars` for secrets
   - Local Bun server on port 3456
   - Or use Docker Compose for containerized testing

4. **Deploy**: Use CLI to deploy to Cloudflare Workers with automatic verification
   - Pre-deployment file verification
   - Deployment execution
   - Post-deployment verification
   - Clear success/error feedback

5. **Monitor**: Check deployment status and logs
   - CLI deployment status check
   - Cloudflare dashboard
   - `wrangler tail` for live logs

### File Management

The CLI automatically keeps local files in sync with Cloudflare Workers:

**Managed Files**:
- **`.dev.vars`**: Updated when setting secrets (local development environment)
- **`config.json`**: Updated when saving router configuration (Quick Config)
- **`wrangler.toml`**: Verified before deployment (read-only, not modified)

**Synchronization Behavior**:
- **Setting Secrets**: Updates both Cloudflare Workers (remote) and `.dev.vars` (local)
- **Saving Config**: Updates `config.json` and syncs provider models list
- **Deployment**: Verifies all required files exist before and after deploying

**Benefits**:
- No manual file editing required
- Local and remote stay in sync
- Prevents deployment errors from missing files
- Clear feedback about file operations

### Planned Improvements

**CLI UI/UX Enhancements** (see `apps/cli/PLAN.md`):
- Design system with centralized theme and colors
- Reusable layout components (ScreenContainer, Header, Footer, Panel)
- Enhanced visual feedback with animations using `useTimeline`
- Better error messages with contextual help
- Improved model display with inline pricing and context length
- Progress indicators for deployment and save operations
- ASCII art branding with `<ascii-font>` component

**Web UI Development** (see `TODO.md`):
- Next.js 15+ web interface for router management
- Visual configuration editor
- Deployment monitoring dashboard
- Usage analytics and metrics
- Based on reference implementation in `_examples/claude-code-router`
