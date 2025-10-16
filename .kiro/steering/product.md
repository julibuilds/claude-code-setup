## Product Overview

Claude Code Toolkit is a multi-provider LLM proxy/router system designed for Claude Code integration. The project enables intelligent routing of API requests across multiple LLM providers (primarily OpenRouter) with automatic model selection based on context length, task type, and other criteria.

### Core Components

- **Router/Proxy Service**: Edge-deployed service (Cloudflare Workers) that routes Claude API requests to multiple LLM providers with request/response transformation
- **Core Library**: Shared utilities for token counting, API transformations, and common functionality
- **Web UI**: Next.js-based management interface for configuration and monitoring (in development)

### Key Features

- Multi-provider support with intelligent routing rules
- Request/response transformation between Claude API and provider formats
- Token usage tracking per session
- Streaming support (SSE)
- Global edge deployment with zero infrastructure management
- Local development via Docker and Cloudflare Workers
