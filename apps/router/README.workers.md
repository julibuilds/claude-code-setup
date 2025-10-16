# Cloudflare Workers Deployment Guide

This guide explains how to deploy the Claude Code Router to Cloudflare Workers.

## Prerequisites

- [Cloudflare account](https://dash.cloudflare.com/sign-up)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed
- Bun installed for building

## Quick Start

### 1. Authenticate with Cloudflare

```bash
wrangler login
```

### 2. Configure Secrets

Set your API keys as secrets (they won't be visible in wrangler.toml):

```bash
# Optional: API key for router authentication
wrangler secret put APIKEY

# Provider API keys
wrangler secret put OPENROUTER_API_KEY
wrangler secret put DEEPSEEK_API_KEY
wrangler secret put GEMINI_API_KEY
```

### 3. Configure Your Router

You have two options for configuration:

#### Option A: Use CONFIG_JSON Secret (Recommended)

Store your entire configuration as a JSON string:

```bash
wrangler secret put CONFIG_JSON
# Paste your config.json content when prompted
```

Example configuration:

```json
{
  "LOG": true,
  "LOG_LEVEL": "info",
  "Providers": [
    {
      "name": "openrouter",
      "api_base_url": "https://openrouter.ai/api/v1/chat/completions",
      "api_key": "$OPENROUTER_API_KEY",
      "models": ["anthropic/claude-3.5-sonnet", "google/gemini-2.0-flash"],
      "transformer": {
        "use": ["openrouter"]
      }
    }
  ],
  "Router": {
    "default": "openrouter,anthropic/claude-3.5-sonnet",
    "background": "openrouter,google/gemini-2.0-flash",
    "longContext": "openrouter,google/gemini-2.0-flash",
    "longContextThreshold": 60000
  }
}
```

#### Option B: Edit wrangler.toml

Add environment variables directly in `wrangler.toml`:

```toml
[vars]
LOG_LEVEL = "info"
# Add other non-sensitive configuration here
```

### 4. Deploy

```bash
# Deploy to production
npm run deploy:workers

# Or deploy to staging
wrangler deploy --env staging
```

### 5. Test Your Deployment

```bash
curl https://claude-code-router.your-subdomain.workers.dev/
```

## Development

### Local Development

Run the Workers development server locally:

```bash
npm run dev:workers
```

This starts a local server that simulates the Cloudflare Workers environment.

### Testing with Local Secrets

Create a `.dev.vars` file in the `apps/router` directory:

```env
APIKEY=your-dev-api-key
OPENROUTER_API_KEY=your-openrouter-key
CONFIG_JSON={"Providers":[],"Router":{"default":""}}
```

**Note:** Never commit `.dev.vars` to version control!

## Configuration

### Environment Variables

| Variable             | Description                                            | Required            |
| -------------------- | ------------------------------------------------------ | ------------------- |
| `APIKEY`             | API key for router authentication                      | No                  |
| `CONFIG_JSON`        | Full configuration as JSON string                      | Recommended         |
| `OPENROUTER_API_KEY` | OpenRouter API key                                     | If using OpenRouter |
| `DEEPSEEK_API_KEY`   | DeepSeek API key                                       | If using DeepSeek   |
| `GEMINI_API_KEY`     | Gemini API key                                         | If using Gemini     |
| `LOG_LEVEL`          | Logging level (fatal, error, warn, info, debug, trace) | No (default: info)  |

### Updating Configuration

To update your configuration after deployment:

```bash
# Update CONFIG_JSON
wrangler secret put CONFIG_JSON

# Or update individual secrets
wrangler secret put OPENROUTER_API_KEY
```

## Monitoring

### View Logs

```bash
# Tail production logs
wrangler tail

# Tail staging logs
wrangler tail --env staging
```

### View Analytics

Visit the [Cloudflare Dashboard](https://dash.cloudflare.com/) to view:

- Request metrics
- Error rates
- CPU usage
- Bandwidth usage

## Limitations

Cloudflare Workers have some limitations compared to the Docker deployment:

1. **CPU Time**: Maximum 50 seconds per request (configured in wrangler.toml)
2. **Memory**: 128 MB per request
3. **File System**: No persistent file system (use KV or Durable Objects for storage)
4. **Logging**: Logs are ephemeral (consider using external logging service)

## Advanced Features

### KV Storage for Configuration

To store configuration in KV instead of secrets:

1. Create a KV namespace:

```bash
wrangler kv:namespace create "CONFIG_STORE"
```

2. Update `wrangler.toml` with the namespace ID

3. Store configuration:

```bash
wrangler kv:key put --namespace-id=<ID> "config" "$(cat config.json)"
```

### Durable Objects for Sessions

Uncomment the Durable Objects section in `src/workers.ts` and configure in `wrangler.toml` to enable session management.

## Troubleshooting

### Build Errors

If you encounter build errors:

```bash
# Clean and rebuild
rm -rf dist
npm run build:workers
```

### Deployment Errors

Check your wrangler.toml configuration and ensure all required secrets are set:

```bash
wrangler secret list
```

### Runtime Errors

View real-time logs during deployment:

```bash
wrangler tail
```

## Cost Considerations

Cloudflare Workers pricing (as of 2024):

- **Free Tier**: 100,000 requests/day
- **Paid Plan**: $5/month for 10 million requests
- Additional requests: $0.50 per million

See [Cloudflare Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/) for current rates.

## Security Best Practices

1. **Always use secrets** for API keys (never hardcode in wrangler.toml)
2. **Enable APIKEY** authentication for production deployments
3. **Use environment-specific configurations** (staging vs production)
4. **Regularly rotate API keys**
5. **Monitor logs** for suspicious activity
6. **Set up rate limiting** if needed

## Support

For issues specific to Cloudflare Workers deployment:

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare Community](https://community.cloudflare.com/)
