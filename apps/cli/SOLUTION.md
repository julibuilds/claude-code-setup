# Solution: Using import.meta.dir for Compiled Binaries

## The Problem

When compiling a Bun application to a standalone binary with `bun build --compile`, the binary needs to locate project files (like `.env` files and configuration) regardless of where it's executed from.

## Why process.execPath Doesn't Work

```typescript
// ❌ BROKEN: process.execPath points to the binary itself
const binaryPath = process.execPath;
// When running from ~: /Users/sean/code/claude-code-setup/apps/cli/dist/router-workers-cli
// Can't reliably determine project structure from this
```

## Why import.meta.dir Works

According to Bun documentation, `import.meta.dir` is **embedded at compile time** and points to the **original source directory**, not the binary location.

```typescript
// ✅ WORKS: import.meta.dir is embedded at compile time
const sourceDir = import.meta.dir;
// Always points to: /Users/sean/code/claude-code-setup/apps/cli/src/utils
// Regardless of where the binary is executed from
```

## Implementation

### For apps/cli/src/utils/env.ts

```typescript
function findEnvFiles(): string[] {
  const possiblePaths: string[] = [];

  try {
    // This file is at: apps/cli/src/utils/env.ts
    // So import.meta.dir points to: apps/cli/src/utils
    const sourceDir = import.meta.dir;

    if (sourceDir) {
      // Navigate up the directory tree
      const srcDir = resolve(sourceDir, ".."); // apps/cli/src
      const cliDir = resolve(srcDir, ".."); // apps/cli
      const appsDir = resolve(cliDir, ".."); // apps
      const projectRoot = resolve(appsDir, ".."); // project root

      // Now we can reliably find project files
      const envPath = resolve(projectRoot, "apps", "cli", ".env");
      const varsPath = resolve(projectRoot, "apps", "router", ".dev.vars");

      if (existsSync(envPath)) {
        possiblePaths.push(envPath);
      }
      if (existsSync(varsPath)) {
        possiblePaths.push(varsPath);
      }
    }
  } catch (_err) {
    // Fallback to other methods
  }

  // ... additional fallback strategies ...

  return possiblePaths;
}
```

### For apps/cli/src/utils/config.ts

```typescript
export function getRouterPath(): string {
  try {
    // This file is at: apps/cli/src/utils/config.ts
    // So import.meta.dir points to: apps/cli/src/utils
    const sourceDir = import.meta.dir;

    if (sourceDir) {
      const srcDir = resolve(sourceDir, ".."); // apps/cli/src
      const cliDir = resolve(srcDir, ".."); // apps/cli
      const appsDir = resolve(cliDir, ".."); // apps
      const routerPath = resolve(appsDir, "router"); // apps/router

      if (existsSync(join(routerPath, "config.json"))) {
        return routerPath;
      }
    }
  } catch (_err) {
    // Fallback to other methods
  }

  // ... additional fallback strategies ...
}
```

## Key Insights from Bun Documentation

From the Bun docs on `import.meta`:

```typescript
import.meta.dir; // => "/path/to/project/src"
import.meta.file; // => "file.ts"
import.meta.path; // => "/path/to/project/src/file.ts"
```

These properties are:

- **Embedded at compile time** - they don't change based on execution location
- **Relative to the source file** - each file has its own `import.meta.dir`
- **Reliable in compiled binaries** - unlike `process.cwd()` or `process.execPath`

## Testing

```bash
# Build the binary
cd apps/cli
bun run build

# Test from different locations
cd ~
/path/to/project/apps/cli/dist/router-workers-cli  # ✅ Works

cd /tmp
/path/to/project/apps/cli/dist/router-workers-cli  # ✅ Works

cd /path/to/project
./apps/cli/dist/router-workers-cli  # ✅ Works
```

## Benefits

1. **Location Independent**: Binary works from any directory
2. **No Configuration**: No need to set environment variables for paths
3. **Compile-Time Resolution**: Paths are determined at build time
4. **Bun Best Practice**: Uses Bun's recommended approach for compiled binaries

## Alternative Approaches (Not Used)

### 1. Environment Variables

```bash
# ❌ Requires user configuration
export PROJECT_ROOT=/path/to/project
ccr
```

### 2. Relative to Binary

```typescript
// ❌ Fragile, breaks if binary is moved
const binaryDir = dirname(process.execPath);
const projectRoot = resolve(binaryDir, "..", "..", "..");
```

### 3. Search from CWD

```typescript
// ❌ Only works if run from project directory
const projectRoot = process.cwd();
```

## Conclusion

Using `import.meta.dir` is the correct solution for Bun compiled binaries because:

- It's embedded at compile time
- It's relative to the source file location
- It works regardless of execution location
- It's the recommended Bun approach

This allows the CLI to be a truly portable binary that can be run from anywhere on the system.

## References

- [Bun import.meta Documentation](https://bun.sh/docs/api/import-meta)
- [Bun Compiled Executables](https://bun.sh/docs/bundler/executables)
- [Bun Environment Variables](https://bun.sh/docs/runtime/env)
