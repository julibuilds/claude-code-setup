# 🚀 Quick Start - Get Running in 2 Minutes

## Current Setup Status

✅ **Workers Deployed**: https://claude-code-router-1016.moonboylabs.workers.dev  
✅ **Config Files Created**: `config.json`, `.dev.vars`  
✅ **Build Successful**: Ready to run locally  
⏳ **Secrets**: Need to be set in Workers

## Step 1: Set Workers Secrets (30 seconds)

```bash
cd apps/router

# Option A: Use the script
bash set-secrets.sh

# Option B: Manual commands
echo "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" | wrangler secret put OPENROUTER_API_KEY
grep "^CONFIG_JSON=" .dev.vars | cut -d'=' -f2- | wrangler secret put CONFIG_JSON
bun run deploy:workers
```

## Step 2: Test Workers (10 seconds)

```bash
# Health check
curl https://claude-code-router-1016.moonboylabs.workers.dev/

# Send a test message
curl -X POST https://claude-code-router-1016.moonboylabs.workers.dev/v1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-haiku-4.5",
    "max_tokens": 100,
    "messages": [{"role": "user", "content": "Say hello!"}]
  }'
```

## Step 3: Configure Kiro/Claude Code (30 seconds)

Add this to your Kiro settings:

```json
{
  "models": {
    "default": "claude-haiku-4.5",
    "apiBaseUrl": "https://claude-code-router-1016.moonboylabs.workers.dev/v1"
  }
}
```

Or for local development:

```json
{
  "models": {
    "default": "claude-haiku-4.5",
    "apiBaseUrl": "http://localhost:3456/v1"
  }
}
```

## Step 4: Start Using! 🎉

Your router will automatically:

- Route to **Claude Haiku 4.5** for normal requests (fast & cheap)
- Route to **Claude Sonnet 4.5** for thinking/reasoning tasks
- Route to **GLM-4.6** for background tasks
- Route to **Claude Sonnet 4.5** for long context (>60k tokens)

## Local Development (Optional)

```bash
# Start local server
bun run dev

# Test locally
curl http://localhost:3456/
```

## Troubleshooting

**Workers not responding?**

- Check secrets are set: `wrangler secret list`
- View logs: `wrangler tail`

**Local server not starting?**

- Check port 3456 is free: `lsof -i :3456`
- Check config.json exists

**API errors?**

- Verify OpenRouter API key is valid
- Check model names match OpenRouter's catalog

## What's Next?

- Add more providers (DeepSeek, Gemini, etc.)
- Customize routing rules in `config.json`
- Monitor usage: `curl http://localhost:3456/api/usage`
- View available transformers: `curl http://localhost:3456/api/transformers`

## Support

- Full docs: `README.md`
- API reference: `API.md`
- Setup guide: `SETUP.md`
