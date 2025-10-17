# File Synchronization Guide

## Overview

The CLI automatically keeps local configuration files in sync with Cloudflare Workers when you make changes through the interface.

## Files Managed

### 1. `.dev.vars` (Local Development Secrets)

**Location**: `apps/router/.dev.vars`

**Purpose**: Stores secrets for local development with `bun run dev`

**Synced When**:

- Setting secrets via "Manage Secrets" → "Set Secret"

**Format**:

```bash
# Last synced: 2024-10-16T20:00:00.000Z
OPENROUTER_API_KEY=sk-or-v1-...
DEEPSEEK_API_KEY=sk-...
GEMINI_API_KEY=...
```

**Behavior**:

- When you set a secret via the CLI, it:
  1. Sets the secret in Cloudflare Workers (production)
  2. Updates `.dev.vars` with the same value (local development)
  3. Adds a timestamp comment indicating when it was last synced
- If the key already exists, it's updated
- If the key is new, it's appended to the file
- The file is created if it doesn't exist

### 2. `config.json` (Router Configuration)

**Location**: `apps/router/config.json`

**Purpose**: Defines routing rules, providers, and model configurations

**Synced When**:

- Saving changes via "Quick Config"
- Modifying router settings

**Format**:

```json
{
  "LOG": true,
  "LOG_LEVEL": "info",
  "Providers": [...],
  "Router": {
    "default": "openrouter,anthropic/claude-4.5-sonnet",
    "background": "openrouter,anthropic/claude-4.5-sonnet",
    "think": "openrouter,anthropic/claude-4.5-sonnet",
    "longContext": "openrouter,anthropic/claude-4.5-sonnet"
  }
}
```

**Behavior**:

- Changes are saved immediately when you press Ctrl+S in Quick Config
- The file is validated before saving (Zod schema)
- Deployment reads from this file

### 3. `wrangler.toml` (Cloudflare Workers Config)

**Location**: `apps/router/wrangler.toml`

**Purpose**: Defines worker name, environment variables, and deployment settings

**Synced When**:

- Currently **read-only** - not modified by CLI
- Verified before and after deployment

**Format**:

```toml
name = "claude-code-router-1016"
main = "src/workers.ts"
compatibility_date = "2024-10-01"

[vars]
LOG_LEVEL = "info"
```

**Behavior**:

- CLI verifies this file exists before deployment
- Shows warnings if file is missing or invalid
- Future: May support editing worker name and environment variables

## Sync Operations

### Setting Secrets

```
User Action: Set Secret (OPENROUTER_API_KEY)
    ↓
1. Call wrangler secret put OPENROUTER_API_KEY
    ↓
2. Update apps/router/.dev.vars
    ↓
3. Add sync timestamp comment
    ↓
4. Show success message with file update status
```

**Example Output**:

```
Setting secret: OPENROUTER_API_KEY...

✓ Secret set successfully in Cloudflare Workers!
✓ Local .dev.vars file updated
```

### Deploying Configuration

```
User Action: Deploy to Workers
    ↓
1. Verify local files exist (config.json, wrangler.toml)
    ↓
2. Show verification status
    ↓
3. Run wrangler deploy
    ↓
4. Post-deployment verification
    ↓
5. Show deployment status and warnings
```

**Example Output**:

```
Deploying to Cloudflare Workers...
Router path: /path/to/apps/router

Verifying local configuration files...
✓ Local configuration files verified

Running: bunx wrangler deploy
[wrangler output...]

✓ Deployment successful!
✓ Local configuration files verified
```

### Saving Configuration

```
User Action: Save Changes (Ctrl+S in Quick Config)
    ↓
1. Validate pending changes (Zod schema)
    ↓
2. Update config.json
    ↓
3. Show success message
```

## File Verification

The CLI performs verification at key points:

### Pre-Deployment Verification

Checks:

- ✅ `config.json` exists
- ✅ `wrangler.toml` exists
- ⚠️ `.dev.vars` exists (optional warning)

### Post-Deployment Verification

Checks:

- ✅ All files still exist
- ✅ No corruption occurred during deployment

### Verification Output

```
Verifying local configuration files...
✓ Local configuration files verified

Files checked:
  - config.json
  - .dev.vars
  - wrangler.toml
```

## Best Practices

### 1. Always Use the CLI for Secrets

```bash
# ✅ GOOD: Use CLI to set secrets
ccr → Manage Secrets → Set Secret

# ❌ AVOID: Manually editing .dev.vars without updating Workers
vim apps/router/.dev.vars
```

**Why**: CLI keeps both local and remote in sync

### 2. Review Changes Before Deployment

```bash
# ✅ GOOD: Review pending changes
Quick Config → See pending changes → Ctrl+S to save

# ❌ AVOID: Deploying without saving config changes
```

**Why**: Ensures deployed configuration matches your intent

### 3. Keep .dev.vars in .gitignore

```bash
# ✅ GOOD: .dev.vars is gitignored
apps/router/.dev.vars  # Never committed

# ✅ GOOD: Use .dev.vars.example for reference
apps/router/.dev.vars.example  # Committed
```

**Why**: Prevents accidentally committing secrets

### 4. Backup Before Major Changes

The CLI automatically creates backups when modifying files:

```bash
apps/router/.dev.vars.backup-2024-10-16T20-00-00-000Z
apps/router/config.json.backup-2024-10-16T20-00-00-000Z
```

## Troubleshooting

### Secret Set But .dev.vars Not Updated

**Symptom**: CLI shows "Secret set in Workers, but failed to update .dev.vars"

**Cause**: Permission issue or file locked

**Solution**:

```bash
# Check file permissions
ls -la apps/router/.dev.vars

# Ensure file is writable
chmod 644 apps/router/.dev.vars

# Try setting secret again
ccr → Manage Secrets → Set Secret
```

### Deployment Warnings About Missing Files

**Symptom**: "⚠ Warning: Some configuration files are missing"

**Cause**: Required files don't exist

**Solution**:

```bash
# Check which files are missing
ls -la apps/router/

# Create .dev.vars from example
cp apps/router/.dev.vars.example apps/router/.dev.vars

# Verify wrangler.toml exists
cat apps/router/wrangler.toml
```

### Config Changes Not Reflected After Deployment

**Symptom**: Deployed worker uses old configuration

**Cause**: Changes not saved before deployment

**Solution**:

```bash
# 1. Make changes in Quick Config
# 2. Press Ctrl+S to save
# 3. Verify config.json was updated
cat apps/router/config.json

# 4. Then deploy
ccr → Deploy to Workers → Deploy Now
```

## Future Enhancements

Planned improvements for file synchronization:

1. **Bidirectional Sync**: Pull secrets from Workers to local files
2. **Conflict Detection**: Warn if local and remote are out of sync
3. **Wrangler.toml Editing**: Modify worker name and vars through CLI
4. **Automatic Backups**: Create timestamped backups before changes
5. **Sync Status Dashboard**: Show sync status for all files
6. **Rollback Support**: Restore from backups if deployment fails

## API Reference

### `setWorkerSecret(key: string, value: string)`

Sets a secret in Cloudflare Workers and updates local `.dev.vars`

**Returns**:

```typescript
{
  success: boolean;
  localFileUpdated?: boolean;
  error?: string;
}
```

### `verifyLocalFiles()`

Verifies that required configuration files exist

**Returns**:

```typescript
{
  success: boolean;
  filesChecked: string[];
  filesUpdated: string[];
  errors: string[];
}
```

### `deployToWorkers(onOutput?: (line: string) => void)`

Deploys to Cloudflare Workers with pre/post verification

**Returns**:

```typescript
{
  success: boolean;
  error?: string;
  filesVerified?: boolean;
  verificationWarnings?: string[];
}
```

## Related Documentation

- [FIXES.md](./FIXES.md) - Bug fixes and resolutions
- [SOLUTION.md](./SOLUTION.md) - Technical implementation details
- [README.md](./README.md) - General usage guide
- [TODO.md](./TODO.md) - Planned features
