#!/bin/bash

# Fix Workers Authentication
# This script sets the APIKEY secret in Cloudflare Workers

set -e

echo "🔧 Fixing Workers Authentication..."
echo ""

# Your router API key from .credentials
ROUTER_API_KEY="3b9308aec547b2b7f2329f594b3a652ccc6b3478b2cbde93d1b0f62d7c38c307"

# Set the APIKEY secret
echo "Setting APIKEY secret..."
echo "$ROUTER_API_KEY" | bunx wrangler secret put APIKEY

echo ""
echo "✅ Done! Your Workers deployment now requires authentication."
echo ""
echo "📝 Update your Claude Code settings to use:"
echo ""
echo "  apiKey: $ROUTER_API_KEY"
echo "  apiBaseUrl: https://claude-code-router-1016.moonboylabs.workers.dev/v1"
echo ""
echo "🧪 Test with:"
echo ""
echo "curl -X POST https://claude-code-router-1016.moonboylabs.workers.dev/v1/messages \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'x-api-key: $ROUTER_API_KEY' \\"
echo "  -d '{\"model\": \"anthropic/claude-haiku-4.5\", \"max_tokens\": 100, \"messages\": [{\"role\": \"user\", \"content\": \"Hello!\"}]}'"
echo ""
