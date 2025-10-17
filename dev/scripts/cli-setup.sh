#!/bin/bash

# CLI Setup Script
# Cleans, rebuilds, and links the CLI tool

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo -e "${BLUE}🚀 CLI Setup Script${NC}"
echo -e "${BLUE}Project root: $PROJECT_ROOT${NC}"
echo ""

# Run cleanup script (which also installs and builds)
echo -e "${BLUE}Running cleanup...${NC}"
bash "$SCRIPT_DIR/cleanup.sh"

echo ""
echo -e "${BLUE}Setting up CLI...${NC}"
cd "$PROJECT_ROOT/apps/cli"

echo ""
echo -e "${BLUE}Linking CLI globally...${NC}"
bun run link

echo ""
echo -e "${GREEN}✅ CLI setup complete! You can now run 'ccr' from any directory.${NC}"
