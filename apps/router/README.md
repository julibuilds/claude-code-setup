# Claude Code Router - Cloudflare Workers

A lightweight, edge-deployed proxy service that routes Claude Code API requests to multiple LLM providers with intelligent routing rules and request/response transformation. Runs on Cloudflare Workers for global low-latency access.

## Features

- **Edge Deployment**: Runs on Cloudflare's global network for minimal latency
- **Multi-Provider Support**: Route requests to OpenRouter and other providers
- **Intelligent Routing**: Automatic routing based on context length, task type, and model selection
- **Request Transformation**: Convert between Claude API format and provider-specific formats (OpenRouter/OpenAI)
- **Usage Tracking**: Monitor token usage per session and provider
- **Streaming Support**: Full support for Server-Sent Events (SSE) streaming responses
- **Zero Infrastructure**: No servers to manage, scales automatically

## Quick Start

### 1. Configure Your Router

Edit `config.json` with your provider settings:

```json
{
  "APIKEY": "your-secret-api-key",
  "HOST": "0.0.0.0",
  "PORT": 3456,
  "LOG": true,
  "LOG_LEVEL": "info",
  "API_TIMEOUT_MS": 600000,
  "Providers": [
    {
      "name": "openrouter",
      "api_base_url": "https://openrouter.ai/api/v1/chat/completions",
      "api_key": "$OPENROUTER_API_KEY",
      "models": [
        "anthropic/claude-haiku-4.5",
        "anthropic/claude-sonnet-4.5",
        "openai/gpt-5-codex",
        "z-ai/glm-4.6"
      ],
      "transformer": {
        "use": ["openrouter"]
      }
    }
  ],
  "Router": {
    "default": "openrouter,anthropic/claude-sonnet-4.5",
    "background": "openrouter,anthropic/claude-haiku-4.5",
    "think": "openrouter,openai/gpt-5-codex",
    "longContext": "openrouter,z-ai/glm-4.6",
    "longContextThreshold": 60000
  }
}
```

### 2. Set Secrets

Store your API keys as Wrangler secrets:

```bash
# Set OpenRouter API key
bunx wrangler secret put OPENROUTER_API_KEY
# Enter: sk-or-v1-your-key-here

# Optional: Set router authentication key
bunx wrangler secret put APIKEY
# Enter: your-secret-key
```

For local development, create `.dev.vars`:

```bash
OPENROUTER_API_KEY=sk-or-v1-your-key-here
APIKEY=your-secret-key
```

### 3. Deploy to Cloudflare Workers

```bash
# Deploy to production
bun run deploy

# Or deploy to a specific environment
bunx wrangler deploy --env production
```

### 4. Test Your Deployment

```bash
# Health check
curl https://your-worker.workers.dev/

# Count tokens
curl -X POST https://your-worker.workers.dev/v1/messages/count_tokens \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello, world!"}
    ]
  }'

# Send a message
curl -X POST https://your-worker.workers.dev/v1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-4-5",
    "messages": [{"role": "user", "content": "Write a haiku"}],
    "max_tokens": 100
  }'
```

## Configuration

### Provider Configuration

Each provider requires:

- `name`: Unique identifier
- `api_base_url`: Provider API endpoint
- `api_key`: Authentication key (use `$VAR_NAME` to reference Wrangler secrets)
- `models`: Array of available model IDs from the provider
- `transformer`: Transformer configuration for request/response conversion

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

**Finding Model IDs**: Use the OpenRouter API to get exact model IDs:

```bash
curl https://openrouter.ai/api/v1/models | jq '.data[] | {id, name}'
```

### Routing Rules

The router automatically selects providers and models based on request characteristics:

```json
{
  "Router": {
    "default": "openrouter,anthropic/claude-sonnet-4.5",
    "background": "openrouter,anthropic/claude-haiku-4.5",
    "think": "openrouter,openai/gpt-5-codex",
    "longContext": "openrouter,z-ai/glm-4.6",
    "longContextThreshold": 60000
  }
}
```

**Routing Logic**:

1. **Explicit Override**: Use `provider,model` format in request: `"model": "openrouter,anthropic/claude-sonnet-4.5"`
2. **Long Context**: Requests exceeding `longContextThreshold` tokens use `longContext` route
3. **Background Tasks**: Requests with "haiku" in model name use `background` route
4. **Thinking Mode**: Requests with `thinking` field use `think` route
5. **Web Search**: Requests with `web_search` tools use `webSearch` route (if configured)
6. **Default**: All other requests use `default` route

### Transformers

The router includes an OpenRouter transformer that:

- Converts Claude API format to OpenAI-compatible format for requests
- Converts OpenRouter/OpenAI responses back to Claude API format
- Handles streaming responses with proper SSE formatting
- Manages tool calls and content blocks

Built-in transformer: `openrouter` (works with OpenRouter, Groq, and other OpenAI-compatible APIs)

## API Endpoints

### Proxy Endpoints

- `POST /v1/messages` - Main Claude API proxy endpoint (supports streaming)
- `POST /v1/messages/count_tokens` - Count tokens without sending request

### Health Check

- `GET /` - Returns router status and configuration summary

## Usage Tracking

The router tracks token usage per session using an in-memory LRU cache:

```bash
# Send request with session ID
curl -X POST https://your-worker.workers.dev/v1/messages \
  -H "x-session-id: my-session" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-4-5",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 100
  }'
```

Usage data is tracked per session and includes:

- Input tokens
- Output tokens
- Request count per provider

**Note**: Usage data is stored in memory and resets when the Worker restarts.

## Development

### Local Development

Run the router locally with Wrangler:

```bash
# Install dependencies
bun install

# Start local dev server (uses .dev.vars for secrets)
bun run dev

# The router will be available at http://localhost:8787
```

### Building

```bash
# Build the worker bundle
bun run build:workers

# Output: dist/workers.js
```

### Project Structure

```
apps/router/
├── src/
│   ├── server.ts          # Hono server setup
│   ├── workers.ts         # Cloudflare Workers entry point
│   ├── middleware/
│   │   ├── auth.ts        # Authentication middleware
│   │   ├── router.ts      # Intelligent routing logic
│   │   └── transformer.ts # Request/response transformation
│   ├── routes/
│   │   └── proxy.ts       # Proxy endpoints
│   └── utils/
│       └── cache.ts       # LRU cache for usage tracking
├── config.json            # Router configuration
├── wrangler.toml          # Cloudflare Workers config
└── package.json
```

## Deployment

### Deploy to Cloudflare Workers

```bash
# Deploy to production
bun run deploy

# Deploy to specific environment
bunx wrangler deploy --env production

# View deployment logs
bunx wrangler tail
```

### Environment Variables

Set via Wrangler secrets (production) or `.dev.vars` (local):

- `OPENROUTER_API_KEY` - Your OpenRouter API key
- `APIKEY` - Optional authentication key for the router
- `CONFIG_JSON` - Full configuration as JSON (auto-generated from config.json)
- `LOG_LEVEL` - Logging level (info, debug, error)

### Updating Configuration

To update the router configuration:

1. Edit `config.json`
2. Redeploy: `bun run deploy`

The `CONFIG_JSON` secret is automatically updated from `config.json` during deployment.

## Troubleshooting

### "Invalid or missing API key" errors

Check that your secrets are set correctly:

```bash
# List secrets
bunx wrangler secret list

# Update secret
bunx wrangler secret put OPENROUTER_API_KEY
```

For local development, verify `.dev.vars` exists and contains your keys.

### Provider requests failing

1. **Verify API key**: Test directly with the provider's API
2. **Check model ID**: Use `curl https://openrouter.ai/api/v1/models` to verify model names
3. **Review logs**: Use `bunx wrangler tail` to see real-time logs

### "undefined is not an object" errors

This usually means the response format doesn't match expectations:

1. Verify the model ID exists in your provider's model list
2. Check that the transformer is configured correctly
3. Review logs to see the actual API response

### Configuration not updating

After editing `config.json`, you must redeploy:

```bash
bun run deploy
```

The configuration is baked into the Worker at deployment time.

### Local development not working

1. Ensure `.dev.vars` exists with your API keys
2. Check that `config.json` is valid JSON
3. Run `bun run dev` and check for errors

## Claude Code Integration

To use this router with Claude Code, configure your API endpoint:

```bash
# Set custom API endpoint
claude config set api.baseUrl https://your-worker.workers.dev

# Optional: Set API key if you configured APIKEY
claude config set api.key your-router-api-key
```

The router will automatically handle model routing based on your configuration.

## Performance

- **Cold Start**: ~15-20ms on Cloudflare Workers
- **Request Latency**: Adds ~5-10ms overhead for routing and transformation
- **Global Edge**: Deployed to 300+ Cloudflare locations worldwide
- **Scalability**: Automatically scales to handle any request volume

## License

See root LICENSE file.
