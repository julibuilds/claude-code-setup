# Quick Setup Guide

## ✅ Current Status

Your router is deployed and configured with:

- **Workers URL**: https://claude-code-router-1016.moonboylabs.workers.dev
- **Local Port**: 3456
- **Provider**: OpenRouter
- **Models**: Claude Haiku 4.5, Claude Sonnet 4.5, GLM-4.6, GPT-5 Codex

## 🚀 Next Steps

### 1. Set Workers Secrets

Your `.dev.vars` file is configured. Now set the secrets in Cloudflare:

```bash
cd apps/router

# Set OpenRouter API key
echo "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" | wrangler secret put OPENROUTER_API_KEY

# Set the full config
cat .dev.vars | grep CONFIG_JSON | cut -d'=' -f2- | wrangler secret put CONFIG_JSON
```

Or use the helper script:

```bash
./setup-workers-secrets.sh
```

### 2. Test Local Server

```bash
# Start local server
bun run dev

# In another terminal, test it
curl http://localhost:3456/

# Test with a message
curl -X POST http://localhost:3456/v1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-4.5",
    "max_tokens": 1024,
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

### 3. Test Workers Deployment

```bash
# Test health check
curl https://claude-code-router-1016.moonboylabs.workers.dev/

# Test with a message
curl -X POST https://claude-code-router-1016.moonboylabs.workers.dev/v1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-4.5",
    "max_tokens": 1024,
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

### 4. Configure Claude Code (Kiro)

Add to your Kiro settings or Claude Code config:

**For Local Development:**

```json
{
  "apiBaseUrl": "http://localhost:3456/v1",
  "apiKey": "any-key-works-locally"
}
```

**For Workers (Production):**

```json
{
  "apiBaseUrl": "https://claude-code-router-1016.moonboylabs.workers.dev/v1",
  "apiKey": "your-api-key-if-set"
}
```

## 📝 Configuration Files

- **`config.json`**: Local development config (uses env vars)
- **`.dev.vars`**: Environment variables for local dev and Workers secrets
- **`wrangler.toml`**: Workers deployment config

## 🔧 Common Commands

```bash
# Local development
bun run dev              # Start with auto-reload
bun run start            # Start production build

# Workers deployment
bun run deploy:workers   # Deploy to Cloudflare Workers
wrangler tail            # View live logs

# Testing
curl http://localhost:3456/api/usage              # Check usage stats
curl http://localhost:3456/api/transformers       # List transformers
```

## 🎯 Routing Rules

Your current routing configuration:

- **Default**: Claude Haiku 4.5 (fast, cheap)
- **Background**: GLM-4.6 (background tasks)
- **Think**: Claude Sonnet 4.5 (reasoning)
- **Long Context**: Claude Sonnet 4.5 (>60k tokens)
- **Web Search**: Claude Sonnet 4.5 (search tasks)

## 🔐 Security Notes

- **Local**: No API key required (binds to localhost)
- **Workers**: Set `APIKEY` secret for authentication
- **API Keys**: Stored as Workers secrets, never in code

## 📚 More Info

- Full API docs: `API.md`
- Configuration guide: `README.md`
- Examples: `examples/` directory
