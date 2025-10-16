#!/bin/bash

# Test Configuration Management
# This script tests the configuration management endpoints

set -e

BASE_URL="${BASE_URL:-http://localhost:3456}"
API_KEY="${API_KEY:-}"

echo "=== Configuration Management Test ==="
echo "Base URL: $BASE_URL"
echo ""

# Helper function for authenticated requests
auth_curl() {
    if [ -n "$API_KEY" ]; then
        curl -s -H "Authorization: Bearer $API_KEY" "$@"
    else
        curl -s "$@"
    fi
}

# 1. Health Check
echo "1. Health Check"
curl -s "$BASE_URL/" | jq '.'
echo ""

# 2. Get Current Configuration
echo "2. Get Current Configuration"
auth_curl "$BASE_URL/api/config" | jq '.Providers[0].name, .Router.default'
echo ""

# 3. List Transformers
echo "3. List Available Transformers"
auth_curl "$BASE_URL/api/transformers" | jq '.transformers[] | {name, type, available}'
echo ""

# 4. Create Manual Backup
echo "4. Create Manual Backup"
auth_curl -X POST "$BASE_URL/api/config/backup" | jq '.'
echo ""

# 5. Test Configuration Validation (should fail)
echo "5. Test Configuration Validation (invalid config)"
auth_curl -X POST "$BASE_URL/api/config" \
  -H "Content-Type: application/json" \
  -d '{
    "Providers": []
  }' | jq '.'
echo ""

# 6. Test Valid Configuration Update
echo "6. Test Valid Configuration Update"
auth_curl -X POST "$BASE_URL/api/config" \
  -H "Content-Type: application/json" \
  -d '{
    "APIKEY": "test-key",
    "Providers": [
      {
        "name": "test-provider",
        "api_base_url": "https://api.example.com",
        "api_key": "test",
        "models": ["test-model"],
        "transformer": {
          "use": ["openrouter"]
        }
      }
    ],
    "Router": {
      "default": "test-provider,test-model"
    }
  }' | jq '.'
echo ""

echo "=== Test Complete ==="
echo ""
echo "Note: Configuration changes require server restart to take effect"
