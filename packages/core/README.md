# @claude-router/core

Core library for Claude Code Router providing shared types, utilities, and transformer implementations.

## Features

- TypeScript type definitions for Claude API and provider configurations
- Environment variable interpolation utilities
- Token counting using tiktoken
- Configuration loader with validation
- Built-in transformers for OpenRouter, DeepSeek, and Gemini
- Extensible transformer registry for custom providers

## Installation

```bash
bun add @claude-router/core
```

## Usage

```typescript
import { 
  loadConfig, 
  calculateTokenCount,
  OpenRouterTransformer 
} from '@claude-router/core';

// Load configuration
const config = loadConfig('./config.json');

// Count tokens
const tokenCount = calculateTokenCount(messages, system, tools);

// Use transformers
const transformer = new OpenRouterTransformer();
const transformedRequest = transformer.transformRequest(request, context);
```

## Development

```bash
# Install dependencies
bun install

# Build
bun run build

# Type check
bun run typecheck
```
