#!/bin/bash

# Turborepo Cleanup Script
# Recursively removes build artifacts, cache files, and dependencies concurrently

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo -e "${BLUE}🧹 Turborepo Cleanup Script${NC}"
echo -e "${BLUE}Project root: $PROJECT_ROOT${NC}"
echo ""

# Change to project root
cd "$PROJECT_ROOT"

echo -e "${BLUE}Starting concurrent cleanup...${NC}"

# Function to remove items concurrently
concurrent_remove() {
    local pattern="$1"
    local type="$2"
    
    # Find and remove in background
    (
        if [ "$type" = "dir" ]; then
            find "$PROJECT_ROOT" -name "$pattern" -type d -exec rm -rf {} + 2>/dev/null || true
        else
            find "$PROJECT_ROOT" -name "$pattern" -type f -exec rm -f {} + 2>/dev/null || true
        fi
    ) &
}

# Start all cleanup operations concurrently
concurrent_remove "node_modules" "dir"
concurrent_remove ".pnp" "dir"
concurrent_remove ".pnp.js" "file"
concurrent_remove "dist" "dir"
concurrent_remove "build" "dir"
concurrent_remove "out" "dir"
concurrent_remove ".next" "dir"
concurrent_remove ".turbo" "dir"
concurrent_remove ".vercel" "dir"
concurrent_remove "coverage" "dir"
concurrent_remove "target" "dir"
concurrent_remove "Cargo.lock" "file"
concurrent_remove "bun.lock" "file"
concurrent_remove "package-lock.json" "file"
concurrent_remove "yarn.lock" "file"
concurrent_remove "pnpm-lock.yaml" "file"
concurrent_remove "*.node" "file"
concurrent_remove "npm-debug.log*" "file"
concurrent_remove "yarn-debug.log*" "file"
concurrent_remove "yarn-error.log*" "file"
concurrent_remove ".DS_Store" "file"
concurrent_remove "*.pem" "file"
concurrent_remove "*.tsbuildinfo" "file"
concurrent_remove ".eslintcache" "file"
concurrent_remove ".stylelintcache" "file"
concurrent_remove ".cache" "dir"
concurrent_remove ".wrangler" "dir"
# NAPI build artifacts
concurrent_remove "index.js" "file"
concurrent_remove "index.d.ts" "file"
concurrent_remove "browser.js" "file"
concurrent_remove "cleanup_napi.*.node" "file"

# Wait for all background processes to complete
wait

echo -e "${GREEN}🎉 Cleanup completed successfully!${NC}"
echo ""
echo -e "${BLUE}Removed:${NC}"
echo "  • Node.js dependencies, build outputs, cache directories"
echo "  • Rust artifacts, lock files, native addons"
echo "  • Debug logs, system files, TypeScript build info"
echo ""
echo -e "${BLUE}Installing dependencies...${NC}"
bun install --force

echo ""
echo -e "${BLUE}Building project...${NC}"
bun run build

echo ""
echo -e "${GREEN}✅ All done! Project cleaned, dependencies installed, and built successfully.${NC}"
