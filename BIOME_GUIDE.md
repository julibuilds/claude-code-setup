# Biome Setup Guide for Turborepo

This guide explains the Biome configuration and commands available in this turborepo.

## 📚 Official Documentation

For detailed information about Biome CLI commands and options, refer to:
- [Biome CLI Reference](https://biomejs.dev/reference/cli/)

## 🛠️ Configuration

The main Biome configuration is located at the root: `biome.json`

### Key Features Enabled:

- ✅ **VCS Integration**: Git integration with `.gitignore` support
- ✅ **Formatter**: Tabs, 100 character line width, double quotes
- ✅ **Linter**: Recommended rules enabled
- ✅ **Import Organization**: Automatic import sorting
- ✅ **File Ignoring**: Ignores build artifacts, node_modules, etc.
- ✅ **JSON Support**: Formats JSON files

## 📦 Available Commands

### Root Level Commands

Run these from the project root to execute across all workspaces:

```bash
# Run lint across all workspaces (formats, lints, organizes imports, fixes issues)
bun run lint

# Run CI checks across all workspaces (read-only validation)
bun run ci
```

### Workspace Level Commands

Run these from within a workspace (e.g., `apps/web` or `packages/ui`):

```bash
# Lint, format, organize imports, and fix all issues
bun run lint

# Run CI checks (read-only, exits with error if issues found)
bun run ci
```

**That's it!** Just 2 commands:
- `lint` - Does everything (format + lint + organize imports + auto-fix)
- `ci` - Validates everything without making changes

## 🔧 Biome CLI Commands

### Main Commands

#### `biome check`
Runs formatter, linter, and import sorting. This is the primary command for development.

```bash
# Check all files in current directory
biome check .

# Check and fix all issues
biome check --write .

# Check and apply unsafe fixes
biome check --write --unsafe .

# Check specific files
biome check src/**/*.ts
```

#### `biome ci`
Optimized for CI environments. Exits with error code if any issues are found.

```bash
# Run in CI (fails if issues found)
biome ci .
```

#### `biome format`
Run the formatter on files.

```bash
# Format and write changes
biome format --write .

# Check formatting without writing
biome format .
```

#### `biome lint`
Run the linter on files.

```bash
# Lint files
biome lint .

# Lint and apply fixes
biome lint --write .

# Lint with unsafe fixes
biome lint --write --unsafe .
```

### Useful Options

- `--write`: Write formatting/fixes to files
- `--unsafe`: Apply unsafe fixes (use with caution)
- `--changed`: Only check changed files (requires VCS)
- `--staged`: Only check staged files (Git)
- `--no-errors-on-unmatched`: Don't error if no files match
- `--skip-parse-errors`: Skip files with syntax errors
- `--max-diagnostics=N`: Limit number of diagnostics shown

## 📋 Turbo Configuration

The `turbo.json` is configured to:

1. **Cache Biome tasks**: `lint`, `format`, `check`, and `ci` are cached
2. **Track `biome.json` changes**: Tasks re-run when config changes
3. **Dependency order**: Tasks run in the correct order across workspaces

## 🚀 Recommended Workflows

### Development Workflow

```bash
# Before committing - format, lint, organize imports, and fix issues
bun run lint
```

### CI/CD Workflow

```bash
# In your CI pipeline - validate without making changes
bun run ci
```

This will fail the build if any formatting, linting, or import organization issues are found.

## 🎯 Git Hooks Integration

To run Biome automatically on git hooks, consider using tools like:

- [husky](https://typicode.github.io/husky/) + [lint-staged](https://github.com/okonet/lint-staged)
- [lefthook](https://github.com/evilmartians/lefthook)

Example with lint-staged:

```json
{
	"*.{js,jsx,ts,tsx,json,css}": [
		"biome check --write --no-errors-on-unmatched"
	]
}
```

## 🔍 Advanced Usage

### Search with GritQL

Biome includes experimental GritQL pattern searching:

```bash
# Find all console.log statements
biome search '`console.log($message)`'

# Search in specific directory
biome search '`console.log($message)`' src/
```

### Explain Rules

Get documentation about specific rules:

```bash
# Explain a specific rule
biome explain noDebugger

# Explain daemon logs
biome explain daemon-logs
```

### Migrate from ESLint/Prettier

If you want to migrate from ESLint or Prettier:

```bash
# Migrate Prettier config
biome migrate prettier

# Migrate ESLint config
biome migrate eslint --include-inspired --include-nursery
```

## 📊 Performance Tips

1. **Use VCS Integration**: Only check changed files with `--changed`
2. **Daemon Mode**: Biome can run as a daemon for faster checks
3. **Ignore Unknown Files**: Enabled in config for better performance
4. **Parallel Execution**: Turbo runs Biome in parallel across workspaces

## 🐛 Troubleshooting

### Daemon Issues

```bash
# Stop the daemon
biome stop

# Start the daemon
biome start

# Print debugging info
biome rage
```

### Clean Logs

```bash
# Clean daemon logs
biome clean
```

## 📝 VS Code Integration

Install the official [Biome VS Code extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) for:

- Real-time linting and formatting
- Auto-fix on save
- Import organization on save

Add to your `.vscode/settings.json`:

```json
{
	"editor.defaultFormatter": "biomejs.biome",
	"editor.formatOnSave": true,
	"editor.codeActionsOnSave": {
		"source.organizeImports.biome": "explicit"
	}
}
```

## 🔗 Additional Resources

- [Biome Documentation](https://biomejs.dev/)
- [CLI Reference](https://biomejs.dev/reference/cli/)
- [Configuration Reference](https://biomejs.dev/reference/configuration/)
- [Linter Rules](https://biomejs.dev/linter/rules/)
- [Migration from Prettier](https://biomejs.dev/guides/migrate-prettier/)
- [Migration from ESLint](https://biomejs.dev/guides/migrate-eslint/)

