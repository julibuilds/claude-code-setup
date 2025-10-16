# 🔐 Security Configuration

## ✅ Your Router is Now Secured!

Authentication is **ENABLED** and **REQUIRED** for all API endpoints.

## 🔑 Your Credentials

**Location**: `.credentials` file (already created, NOT in git)

**Router API Key**: `3b9308aec547b2b7f2329f594b3a652ccc6b3478b2cbde93d1b0f62d7c38c307`

## 🛡️ What's Protected

All `/v1/*` and `/api/*` endpoints require authentication:

- ✅ `/v1/messages` - Main proxy endpoint
- ✅ `/v1/messages/count_tokens` - Token counting
- ✅ `/api/config` - Configuration management
- ✅ `/api/usage` - Usage statistics
- ✅ `/api/transformers` - Transformer info

**Public endpoints** (no auth required):

- `/` - Health check only

## 🔒 How Authentication Works

The router accepts API keys via two headers:

1. `x-api-key: YOUR_KEY`
2. `Authorization: Bearer YOUR_KEY`

Example:

```bash
curl -H "x-api-key: 3b9308aec547b2b7f2329f594b3a652ccc6b3478b2cbde93d1b0f62d7c38c307" \
  https://claude-code-router-1016.moonboylabs.workers.dev/v1/messages
```

## 📱 Use in Kiro/Claude Code

```json
{
  "models": {
    "default": "anthropic/claude-haiku-4.5",
    "apiKey": "3b9308aec547b2b7f2329f594b3a652ccc6b3478b2cbde93d1b0f62d7c38c307",
    "apiBaseUrl": "https://claude-code-router-1016.moonboylabs.workers.dev/v1"
  }
}
```

## 🔄 Rotating Your API Key

If you need to change your API key:

```bash
# Generate new key
openssl rand -hex 32

# Set in Workers
echo "YOUR_NEW_KEY" | npx wrangler secret put APIKEY

# Update CONFIG_JSON in .dev.vars
# Then update the secret:
grep "^CONFIG_JSON=" .dev.vars | cut -d'=' -f2- | npx wrangler secret put CONFIG_JSON

# Redeploy
bun run deploy:workers

# Update .credentials file with new key
```

## 🚨 Security Best Practices

1. **Never commit** `.credentials`, `.dev.vars`, or `config.json` to git
2. **Rotate keys** periodically (every 90 days recommended)
3. **Monitor usage** via OpenRouter dashboard
4. **Use different keys** for dev/staging/production if needed
5. **Revoke immediately** if key is compromised

## 📊 Monitoring Access

View live requests:

```bash
npx wrangler tail
```

Check for unauthorized attempts:

```bash
npx wrangler tail | grep "authentication_error"
```

## 🔐 Secrets in Cloudflare

Your secrets are stored securely in Cloudflare Workers:

```bash
# List all secrets
npx wrangler secret list

# Delete a secret (if needed)
npx wrangler secret delete APIKEY
```

Current secrets:

- `APIKEY` - Router authentication key
- `OPENROUTER_API_KEY` - OpenRouter API key
- `CONFIG_JSON` - Full configuration (includes APIKEY reference)

## ⚠️ What to Do If Key is Compromised

1. Generate new key immediately:

   ```bash
   openssl rand -hex 32
   ```

2. Update Workers secret:

   ```bash
   echo "NEW_KEY" | npx wrangler secret put APIKEY
   ```

3. Update CONFIG_JSON:

   ```bash
   # Edit .dev.vars with new key
   grep "^CONFIG_JSON=" .dev.vars | cut -d'=' -f2- | npx wrangler secret put CONFIG_JSON
   ```

4. Redeploy:

   ```bash
   bun run deploy:workers
   ```

5. Update all clients (Kiro, scripts, etc.) with new key

## ✅ Security Checklist

- [x] API key authentication enabled
- [x] Secrets stored in Cloudflare Workers (not in code)
- [x] `.credentials` file in `.gitignore`
- [x] `.dev.vars` file in `.gitignore`
- [x] `config.json` file in `.gitignore`
- [x] Strong random API key (64 hex characters)
- [x] All sensitive endpoints protected
- [x] Health check endpoint public (safe)

**Your router is now secure! 🎉**
