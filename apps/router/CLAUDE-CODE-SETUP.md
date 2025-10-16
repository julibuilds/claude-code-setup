# ✅ Claude Code Configuration Complete!

Your Claude Code is now configured to use your router!

## What Was Done

Updated `~/.claude/settings.json` with:

```json
{
  "alwaysThinkingEnabled": false,
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "3b9308aec547b2b7f2329f594b3a652ccc6b3478b2cbde93d1b0f62d7c38c307",
    "ANTHROPIC_BASE_URL": "https://claude-code-router-1016.moonboylabs.workers.dev",
    "API_TIMEOUT_MS": "600000"
  }
}
```

## How It Works

1. **ANTHROPIC_AUTH_TOKEN**: Your router API key (for authentication)
2. **ANTHROPIC_BASE_URL**: Points to your Workers deployment instead of Anthropic
3. **API_TIMEOUT_MS**: 10 minute timeout for long requests

## What Happens Now

When you use Claude Code:

- All requests go to your router at `claude-code-router-1016.moonboylabs.workers.dev`
- Your router authenticates with the API key
- Requests are routed based on your config:
  - Default → `anthropic/claude-haiku-4.5` (fast & cheap)
  - Thinking → `anthropic/claude-sonnet-4.5` (reasoning)
  - Background → `z-ai/glm-4.6` (background tasks)
  - Long context → `anthropic/claude-sonnet-4.5` (>60k tokens)

## Important: Logout First!

If you were previously logged into Claude Code with Anthropic, you need to logout:

```bash
claude /logout
```

This clears the managed API key so Claude Code will use your router token instead.

## Test It Now!

1. Make sure you've logged out (see above)
2. Open Claude Code
3. Ask it a question
4. Check your OpenRouter dashboard to see the usage

## Monitoring

View live requests to your router:

```bash
npx wrangler tail
```

## Troubleshooting

**Claude Code not connecting?**

- Restart Claude Code to pick up the new settings
- Check the config: `cat ~/.claude/settings.json`
- Test the endpoint: `curl https://claude-code-router-1016.moonboylabs.workers.dev/`

**Authentication errors?**

- Verify API key in settings.json matches `.credentials` file
- Check Workers secrets: `npx wrangler secret list`

**Want to use local router instead?**

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "any-key-works-locally",
    "ANTHROPIC_BASE_URL": "http://localhost:3456",
    "API_TIMEOUT_MS": "600000"
  }
}
```

Then run: `cd apps/router && bun run dev`

## Reverting to Anthropic

To go back to using Anthropic directly:

```bash
cat > ~/.claude/settings.json << 'EOF'
{
  "alwaysThinkingEnabled": false
}
EOF
```

## Your Setup Summary

✅ Router deployed: https://claude-code-router-1016.moonboylabs.workers.dev
✅ Authentication enabled
✅ Claude Code configured
✅ Ready to use!

**Start using Claude Code now - all requests will go through your router! 🚀**
