# Router Service API Documentation

## Configuration Management Endpoints

### GET /api/config

Retrieves the current router configuration.

**Response:**

```json
{
  "APIKEY": "***",
  "HOST": "0.0.0.0",
  "PORT": 3456,
  "LOG": true,
  "LOG_LEVEL": "info",
  "Providers": [
    {
      "name": "openrouter",
      "api_base_url": "https://openrouter.ai/api/v1/chat/completions",
      "api_key": "***",
      "models": ["anthropic/claude-3.5-sonnet"],
      "transformer": {
        "use": ["openrouter"]
      }
    }
  ],
  "Router": {
    "default": "openrouter,anthropic/claude-3.5-sonnet",
    "background": "openrouter,google/gemini-2.0-flash"
  }
}
```

**Notes:**

- API keys are masked with `***` for security
- Returns the full configuration structure

### POST /api/config

Updates the router configuration.

**Request Body:**

```json
{
  "APIKEY": "your-api-key",
  "Providers": [
    {
      "name": "openrouter",
      "api_base_url": "https://openrouter.ai/api/v1/chat/completions",
      "api_key": "sk-or-v1-...",
      "models": ["anthropic/claude-3.5-sonnet"],
      "transformer": {
        "use": ["openrouter"]
      }
    }
  ],
  "Router": {
    "default": "openrouter,anthropic/claude-3.5-sonnet"
  }
}
```

**Response (Success):**

```json
{
  "success": true,
  "message": "Configuration updated successfully. Server restart required to apply changes.",
  "backup": "/path/to/.backups/config.2025-10-16T12-00-00-000Z.json"
}
```

**Response (Validation Error):**

```json
{
  "error": {
    "type": "validation_error",
    "message": "Configuration validation failed",
    "details": [
      "At least one provider must be configured",
      "Router must have a default route"
    ]
  }
}
```

**Validation Rules:**

- At least one provider must be configured
- Router configuration is required
- Router must have a default route

**Notes:**

- A backup of the current configuration is automatically created before updating
- The backup file is stored in `.backups/` directory relative to the config file
- Server restart is required for changes to take effect
- Configuration management requires the server to be started with a config file path

### POST /api/config/backup

Creates a backup of the current configuration without modifying it.

**Response:**

```json
{
  "success": true,
  "backup": "/path/to/.backups/config.2025-10-16T12-00-00-000Z.json"
}
```

**Use Cases:**

- Manual backup before making changes
- Scheduled backups for disaster recovery
- Testing configuration changes

### GET /api/transformers

Lists all available transformers and their usage.

**Response:**

```json
{
  "transformers": [
    {
      "name": "openrouter",
      "available": true,
      "type": "built-in",
      "capabilities": {
        "transformRequest": true,
        "transformResponse": true,
        "transformStreamChunk": true
      }
    },
    {
      "name": "deepseek",
      "available": true,
      "type": "built-in",
      "capabilities": {
        "transformRequest": true,
        "transformResponse": true,
        "transformStreamChunk": true
      }
    },
    {
      "name": "gemini",
      "available": true,
      "type": "built-in",
      "capabilities": {
        "transformRequest": true,
        "transformResponse": true,
        "transformStreamChunk": true
      }
    }
  ],
  "usage": {
    "openrouter": {
      "provider": "openrouter",
      "models": ["anthropic/claude-3.5-sonnet", "google/gemini-2.0-flash"],
      "transformers": ["openrouter"]
    }
  },
  "total": 3
}
```

**Response Fields:**

- `transformers`: Array of available transformers with their capabilities
  - `name`: Transformer identifier
  - `available`: Whether the transformer is loaded and available
  - `type`: Either "built-in" or "custom"
  - `capabilities`: Which transformation methods are implemented
- `usage`: Map of provider names to their transformer configurations
- `total`: Total number of available transformers

## Usage Statistics Endpoints

### GET /api/usage

Get total usage statistics across all sessions.

### GET /api/usage/sessions

Get usage statistics for all sessions.

### GET /api/usage/sessions/:sessionId

Get usage statistics for a specific session.

### DELETE /api/usage/sessions/:sessionId

Delete usage statistics for a specific session.

## Proxy Endpoints

### POST /v1/messages

Main proxy endpoint for Claude API requests.

### POST /v1/messages/count_tokens

Count tokens in a request without sending it to a provider.

## Health Check

### GET /

Returns server status and available providers.

**Response:**

```json
{
  "status": "ok",
  "version": "1.0.0",
  "service": "claude-code-router",
  "providers": ["openrouter", "deepseek", "gemini"]
}
```
