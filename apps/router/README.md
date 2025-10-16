# Claude Code Router Service

The Router Service is the core proxy application that intercepts Claude Code API requests and intelligently routes them to various LLM providers.

## Features

- Intelligent routing based on request characteristics
- Support for multiple LLM providers (OpenRouter, DeepSeek, Gemini, etc.)
- Request/response transformation for provider compatibility
- Streaming response support
- API key authentication
- Structured logging and monitoring

## Development

```bash
# Install dependencies
bun install

# Run in development mode with hot reload
bun run dev

# Build for production
bun run build

# Run production build
bun run start

# Type check
bun run typecheck
```

## Configuration

Configuration is loaded from a JSON file and environment variables. See the main project README for configuration details.

## Deployment

The Router Service can be deployed using:
- Docker containers
- Cloudflare Workers

See deployment documentation in the main project README.
