#!/bin/bash

# Configuration Management Examples
# These examples demonstrate how to use the configuration API endpoints

BASE_URL="http://localhost:3456"

echo "=== Configuration Management Examples ==="
echo ""

# 1. Get current configuration
echo "1. Getting current configuration..."
curl -s "${BASE_URL}/api/config" | jq '.'
echo ""

# 2. List available transformers
echo "2. Listing available transformers..."
curl -s "${BASE_URL}/api/transformers" | jq '.'
echo ""

# 3. Update configuration (example)
echo "3. Updating configuration..."
curl -s -X POST "${BASE_URL}/api/config" \
  -H "Content-Type: application/json" \
  -d '{
    "APIKEY": "your-api-key",
    "HOST": "0.0.0.0",
    "PORT": 3456,
    "LOG": true,
    "LOG_LEVEL": "info",
    "Providers": [
      {
        "name": "openrouter",
        "api_base_url": "https://openrouter.ai/api/v1/chat/completions",
        "api_key": "sk-or-v1-your-key",
        "models": ["anthropic/claude-3.5-sonnet"],
        "transformer": {
          "use": ["openrouter"]
        }
      }
    ],
    "Router": {
      "default": "openrouter,anthropic/claude-3.5-sonnet"
    }
  }' | jq '.'
echo ""

# 4. Get health status
echo "4. Getting server health status..."
curl -s "${BASE_URL}/" | jq '.'
echo ""

echo "=== Examples Complete ==="
