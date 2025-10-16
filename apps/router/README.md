# Claude Code Router Service

A flexible proxy service that routes Claude Code API requests to multiple LLM providers with intelligent routing rules and request/response transformation.

## Features

- **Multi-Provider Support**: Route requests to OpenRouter, DeepSeek, Gemini, and other providers
- **Intelligent Routing**: Automatic routing based on context length, task type, and model selection
- **Request Transformation**: Convert between Claude API format and provider-specific formats
- **Configuration Management**: REST API for reading and updating configuration with automatic backups
- **Usage Tracking**: Monitor token usage per session and provider
- **Streaming Support**: Full support for Server-Sent Events (SSE) streaming responses

## Quick Start

### 1. Create Configuration File

Copy the example configuration:

```bash
cp config.example.json config.json
```

Edit `config.json` and add your API keys:

```json
{
  "APIKEY": "your-router-api-key",
  "Providers": [
    {
      "name": "openrouter",
      "api_key": "sk-or-v1-your-key-here",
      ...
    }
  ],
  ...
}
```

You can use environment variables in the config:

```json
{
  "api_key": "$OPENROUTER_API_KEY"
}
```

### 2. Set Environment Variables

Create a `.env` file:

```bash
OPENROUTER_API_KEY=sk-or-v1-your-key
DEEPSEEK_API_KEY=sk-your-key
CONFIG_PATH=./config.json
PORT=3456
HOST=0.0.0.0
```

### 3. Start the Server

Development mode with auto-reload:

```bash
bun run dev
```

Production mode:

```bash
bun run build
bun run start
```

### 4. Test the Server

Health check:

```bash
curl http://localhost:3456/
```

Count tokens:

```bash
curl -X POST http://localhost:3456/v1/messages/count_tokens \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello, world!"}
    ]
  }'
```

## Configuration

### Provider Configuration

Each provider requires:

- `name`: Unique identifier
- `api_base_url`: Provider API endpoint
- `api_key`: Authentication key (supports env vars with `$VAR` syntax)
- `models`: Array of available model names
- `transformer`: Optional transformer configuration

Example:

```json
{
  "name": "openrouter",
  "api_base_url": "https://openrouter.ai/api/v1/chat/completions",
  "api_key": "$OPENROUTER_API_KEY",
  "models": ["anthropic/claude-3.5-sonnet"],
  "transformer": {
    "use": ["openrouter"]
  }
}
```

### Routing Rules

Configure routing based on task type:

```json
{
  "Router": {
    "default": "openrouter,anthropic/claude-3.5-sonnet",
    "background": "openrouter,google/gemini-2.0-flash",
    "think": "deepseek,deepseek-reasoner",
    "longContext": "openrouter,google/gemini-2.0-flash",
    "longContextThreshold": 60000,
    "webSearch": "openrouter,google/gemini-2.0-flash"
  }
}
```

Routing rules:

- `default`: Default provider and model
- `background`: For background/haiku tasks
- `think`: For reasoning tasks
- `longContext`: For requests exceeding token threshold
- `longContextThreshold`: Token count threshold (default: 60000)
- `webSearch`: For web search tool requests

### Transformers

Built-in transformers:

- `openrouter`: OpenAI-compatible format (works with OpenRouter, Groq, etc.)
- `deepseek`: DeepSeek API format
- `gemini`: Google Gemini API format

Custom transformers can be loaded from file paths.

## API Endpoints

### Proxy Endpoints

- `POST /v1/messages` - Main Claude API proxy endpoint
- `POST /v1/messages/count_tokens` - Count tokens without sending request

### Configuration Management

- `GET /api/config` - Read current configuration (API keys masked)
- `POST /api/config` - Update configuration (creates backup automatically)
- `POST /api/config/backup` - Create manual backup

### Transformer Management

- `GET /api/transformers` - List available transformers and their usage

### Usage Statistics

- `GET /api/usage` - Get total usage statistics
- `GET /api/usage/sessions` - Get all session statistics
- `GET /api/usage/sessions/:id` - Get specific session statistics
- `DELETE /api/usage/sessions/:id` - Delete session statistics

See [API.md](./API.md) for detailed API documentation.

## Configuration Management

### Automatic Backups

When updating configuration via the API, a backup is automatically created:

```bash
curl -X POST http://localhost:3456/api/config \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d @new-config.json
```

Response includes backup location:

```json
{
  "success": true,
  "message": "Configuration updated successfully. Server restart required to apply changes.",
  "backup": "/path/to/.backups/config.2025-10-16T12-00-00-000Z.json"
}
```

### Manual Backups

Create a backup without modifying configuration:

```bash
curl -X POST http://localhost:3456/api/config/backup \
  -H "Authorization: Bearer your-api-key"
```

### Backup Location

Backups are stored in `.backups/` directory relative to the config file:

```
config.json
.backups/
  ├── config.2025-10-16T12-00-00-000Z.json
  ├── config.2025-10-16T13-30-00-000Z.json
  └── config.2025-10-16T14-15-00-000Z.json
```

## Authentication

### API Key Authentication

If `APIKEY` is set in configuration, all `/v1/*` and `/api/*` endpoints require authentication:

```bash
# Using Authorization header
curl -H "Authorization: Bearer your-api-key" http://localhost:3456/api/config

# Using x-api-key header
curl -H "x-api-key: your-api-key" http://localhost:3456/api/config
```

### Localhost-Only Mode

If no API key is configured, the server binds to `127.0.0.1` for security.

## Usage Tracking

Track token usage per session:

```bash
# Send request with session ID
curl -X POST http://localhost:3456/v1/messages \
  -H "x-session-id: my-session" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Get session usage
curl http://localhost:3456/api/usage/sessions/my-session
```

Response:

```json
{
  "sessionId": "my-session",
  "providers": {
    "openrouter": {
      "inputTokens": 1500,
      "outputTokens": 800,
      "requests": 5
    }
  },
  "totalInputTokens": 1500,
  "totalOutputTokens": 800,
  "totalRequests": 5
}
```

## Logging

Configure logging in `config.json`:

```json
{
  "LOG": true,
  "LOG_LEVEL": "info"
}
```

Log levels: `fatal`, `error`, `warn`, `info`, `debug`, `trace`

Logs are written to `logs/` directory with automatic rotation.

## Examples

See [examples/](./examples/) directory for:

- Configuration management scripts
- Usage tracking examples
- Integration examples

## Development

```bash
# Install dependencies
bun install

# Run in development mode
bun run dev

# Type checking
bun run typecheck

# Build for production
bun run build
```

## Deployment

### Docker

```bash
docker build -t claude-router .
docker run -p 3456:3456 -v $(pwd)/config.json:/app/config.json claude-router
```

### Cloudflare Workers

See deployment documentation for Cloudflare Workers setup.

## Troubleshooting

### Configuration not loading

- Check `CONFIG_PATH` environment variable
- Verify config file exists and is valid JSON
- Check file permissions

### Provider requests failing

- Verify API keys are correct
- Check provider API base URL
- Review logs for detailed error messages

### Transformer not found

- Verify transformer name in provider configuration
- Check custom transformer file path
- Review available transformers: `GET /api/transformers`

## License

See root LICENSE file.
