# Router Service Examples

This directory contains example scripts demonstrating how to use the Router Service API.

## Configuration Management

The `config-management.sh` script demonstrates:

1. **Getting current configuration** - Retrieve the active router configuration
2. **Listing transformers** - View all available transformers and their capabilities
3. **Updating configuration** - Modify the router configuration
4. **Health check** - Verify the server is running

### Usage

Make sure the router service is running:

```bash
bun run dev
```

Then run the examples:

```bash
./config-management.sh
```

### Prerequisites

- `curl` - for making HTTP requests
- `jq` - for formatting JSON output (optional but recommended)

Install jq on macOS:

```bash
brew install jq
```

## API Endpoints

See [API.md](../API.md) for complete API documentation.

## Configuration Structure

The router configuration includes:

- **Providers**: Array of LLM provider configurations

  - `name`: Provider identifier
  - `api_base_url`: Provider API endpoint
  - `api_key`: Authentication key
  - `models`: List of available models
  - `transformer`: Transformer configuration

- **Router**: Routing rules

  - `default`: Default provider and model
  - `background`: Provider for background tasks
  - `think`: Provider for reasoning tasks
  - `longContext`: Provider for long context requests
  - `webSearch`: Provider for web search requests

- **Server Settings**:
  - `APIKEY`: Optional API key for router authentication
  - `HOST`: Server bind address
  - `PORT`: Server port
  - `LOG`: Enable/disable logging
  - `LOG_LEVEL`: Logging verbosity

## Transformers

Transformers convert between Claude API format and provider-specific formats.

Built-in transformers:

- `openrouter` - OpenAI-compatible format (OpenRouter, Groq, etc.)
- `deepseek` - DeepSeek API format
- `gemini` - Google Gemini API format

Custom transformers can be loaded from file paths specified in the configuration.
