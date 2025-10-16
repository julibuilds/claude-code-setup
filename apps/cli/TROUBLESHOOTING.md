# Troubleshooting Guide

## Common Issues

### "Config file not found" Error

**Problem**: The CLI can't find `apps/router/config.json`

**Solution**: Make sure you're running the CLI from the correct directory:

```bash
# Option 1: Run from project root
cd /path/to/claude-code-setup
ccr

# Option 2: Run from apps/cli
cd /path/to/claude-code-setup/apps/cli
ccr
```

**Why this happens**: The CLI uses relative paths to find the router configuration. It needs to be run from either the project root or the `apps/cli` directory.

### "cd: /router: No such file or directory" Error

**Problem**: Path resolution failed when trying to run wrangler commands

**Solution**: This was fixed in the latest version. Make sure you've rebuilt the CLI:

```bash
cd apps/cli
bun run build
```

If you linked it globally, you may need to relink:

```bash
bun run link
```

### "OPENROUTER_API_KEY not found" Error

**Problem**: The CLI can't find your OpenRouter API key

**Solution**: Create a `.env` file in one of these locations:

```bash
# Option 1: In apps/cli/.env
cd apps/cli
echo "OPENROUTER_API_KEY=your_key_here" > .env

# Option 2: In apps/router/.dev.vars
cd apps/router
echo "OPENROUTER_API_KEY=your_key_here" > .dev.vars
```

### Deployment Fails

**Problem**: Wrangler deployment commands fail

**Solutions**:

1. **Not logged in to Cloudflare**:

   ```bash
   cd apps/router
   bunx wrangler login
   ```

2. **Wrong directory**: Make sure `apps/router/wrangler.toml` exists

3. **Missing dependencies**:
   ```bash
   cd apps/router
   bun install
   ```

### Models Not Loading

**Problem**: Can't fetch models from OpenRouter

**Solutions**:

1. **Check API key**: Verify your `OPENROUTER_API_KEY` is correct
2. **Check internet connection**: The CLI needs to connect to OpenRouter's API
3. **API rate limits**: Wait a moment and try again

## Debug Mode

To see detailed path information, you can check where the CLI is looking for files:

```bash
cd apps/cli
bun run test-path.ts
```

This will show:

- Current working directory
- Router path being used
- Config path being used
- Whether the config file exists

## Getting Help

If you're still having issues:

1. Check that all files exist:

   ```bash
   ls -la apps/router/config.json
   ls -la apps/router/wrangler.toml
   ```

2. Verify you're in the right directory:

   ```bash
   pwd
   # Should show: /path/to/claude-code-setup or /path/to/claude-code-setup/apps/cli
   ```

3. Rebuild from scratch:
   ```bash
   cd apps/cli
   bun run fresh
   ```
