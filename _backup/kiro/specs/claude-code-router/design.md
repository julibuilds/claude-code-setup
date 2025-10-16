# Design Document

## Overview

The Claude Code Router/Proxy system is designed as a modular, extensible proxy service that intercepts Claude Code API requests and intelligently routes them to various LLM providers. The architecture follows a monorepo structure using Turborepo, with three primary components: a Core Library package, a Router Service application, and a Web Management UI application.

The system prioritizes flexibility, allowing users to configure multiple providers with custom routing rules, deploy to different environments (Docker or Cloudflare Workers), and extend functionality through a plugin-based transformer system.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Claude Code Client                       │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Router Service (Hono)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Auth         │  │ Router       │  │ Transformer  │      │
│  │ Middleware   │─▶│ Middleware   │─▶│ Pipeline     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌────────────────┐ ┌────────────┐ ┌────────────┐
│   OpenRouter   │ │  DeepSeek  │ │   Ollama   │
│   Provider     │ │  Provider  │ │  Provider  │
└────────────────┘ └────────────┘ └────────────┘

┌─────────────────────────────────────────────────────────────┐
│              Web Management UI (Next.js 15)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Config       │  │ Provider     │  │ Logs         │      │
│  │ Editor       │  │ Manager      │  │ Viewer       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API
                         ▼
                  Router Service API
```

### Monorepo Structure

```
claude-code-router/
├── packages/
│   ├── core/                    # Core Library
│   │   ├── src/
│   │   │   ├── types/          # TypeScript type definitions
│   │   │   ├── transformers/   # Base transformer implementations
│   │   │   ├── utils/          # Shared utilities
│   │   │   └── index.ts        # Package exports
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── ui/                      # Shared UI components (existing)
│       └── ...
│
├── apps/
│   ├── router/                  # Router Service
│   │   ├── src/
│   │   │   ├── index.ts        # Entry point
│   │   │   ├── server.ts       # Hono server setup
│   │   │   ├── middleware/     # Auth, logging, routing
│   │   │   ├── agents/         # Built-in agents
│   │   │   └── utils/          # Service-specific utilities
│   │   ├── Dockerfile
│   │   ├── wrangler.toml       # Cloudflare Workers config
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                     # Web Management UI (existing, to be enhanced)
│       └── ...
│
├── turbo.json
├── package.json
└── bun.lock
```

## Components and Interfaces

### 1. Core Library (`packages/core`)

The Core Library provides shared functionality across all applications.

#### Type Definitions

```typescript
// packages/core/src/types/config.ts

export interface ProviderConfig {
  name: string;
  api_base_url: string;
  api_key: string;
  models: string[];
  transformer?: TransformerConfig;
}

export interface TransformerConfig {
  use: Array<string | [string, Record<string, any>]>;
  [modelName: string]: {
    use: Array<string | [string, Record<string, any>]>;
  };
}

export interface RouterConfig {
  default: string;
  background?: string;
  think?: string;
  longContext?: string;
  longContextThreshold?: number;
  webSearch?: string;
  image?: string;
}

export interface AppConfig {
  APIKEY?: string;
  HOST?: string;
  PORT?: number;
  PROXY_URL?: string;
  LOG?: boolean;
  LOG_LEVEL?: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
  API_TIMEOUT_MS?: number;
  NON_INTERACTIVE_MODE?: boolean;
  CUSTOM_ROUTER_PATH?: string;
  Providers: ProviderConfig[];
  Router: RouterConfig;
  transformers?: Array<{
    path: string;
    options?: Record<string, any>;
  }>;
}
```

```typescript
// packages/core/src/types/api.ts

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string | ContentBlock[];
}

export interface ContentBlock {
  type: 'text' | 'tool_use' | 'tool_result' | 'image';
  text?: string;
  id?: string;
  name?: string;
  input?: Record<string, any>;
  tool_use_id?: string;
  content?: string | any[];
  source?: ImageSource;
}

export interface ImageSource {
  type: 'base64' | 'url';
  media_type: string;
  data?: string;
  url?: string;
}

export interface ClaudeRequest {
  model: string;
  messages: ClaudeMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  system?: string | SystemBlock[];
  tools?: Tool[];
  tool_choice?: ToolChoice;
  stream?: boolean;
  metadata?: Record<string, any>;
  thinking?: boolean;
}

export interface SystemBlock {
  type: 'text';
  text: string;
  cache_control?: { type: 'ephemeral' };
}

export interface Tool {
  name: string;
  description: string;
  input_schema: Record<string, any>;
}

export interface ToolChoice {
  type: 'auto' | 'any' | 'tool';
  name?: string;
}

export interface ClaudeResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: ContentBlock[];
  model: string;
  stop_reason: string | null;
  stop_sequence: string | null;
  usage: Usage;
}

export interface Usage {
  input_tokens: number;
  output_tokens: number;
}
```

#### Transformer Interface

```typescript
// packages/core/src/types/transformer.ts

export interface TransformerContext {
  config: AppConfig;
  provider: ProviderConfig;
  model: string;
  options?: Record<string, any>;
}

export interface Transformer {
  name: string;
  
  /**
   * Transform request before sending to provider
   */
  transformRequest?(
    request: ClaudeRequest,
    context: TransformerContext
  ): Promise<any> | any;
  
  /**
   * Transform response before returning to client
   */
  transformResponse?(
    response: any,
    context: TransformerContext
  ): Promise<ClaudeResponse> | ClaudeResponse;
  
  /**
   * Transform streaming response chunks
   */
  transformStreamChunk?(
    chunk: any,
    context: TransformerContext
  ): Promise<string> | string;
}
```

#### Utility Functions

```typescript
// packages/core/src/utils/env-interpolation.ts

/**
 * Recursively interpolate environment variables in configuration
 * Supports both $VAR_NAME and ${VAR_NAME} syntax
 */
export function interpolateEnvVars(obj: any): any {
  if (typeof obj === 'string') {
    return obj.replace(/\$\{?([A-Z_][A-Z0-9_]*)\}?/g, (_, varName) => {
      return process.env[varName] || '';
    });
  }
  
  if (Array.isArray(obj)) {
    return obj.map(interpolateEnvVars);
  }
  
  if (obj && typeof obj === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = interpolateEnvVars(value);
    }
    return result;
  }
  
  return obj;
}
```

```typescript
// packages/core/src/utils/token-counter.ts

import { get_encoding } from 'tiktoken';

const enc = get_encoding('cl100k_base');

export function calculateTokenCount(
  messages: ClaudeMessage[],
  system?: string | SystemBlock[],
  tools?: Tool[]
): number {
  let tokenCount = 0;
  
  // Count message tokens
  for (const message of messages) {
    if (typeof message.content === 'string') {
      tokenCount += enc.encode(message.content).length;
    } else if (Array.isArray(message.content)) {
      for (const block of message.content) {
        if (block.type === 'text' && block.text) {
          tokenCount += enc.encode(block.text).length;
        } else if (block.type === 'tool_use' && block.input) {
          tokenCount += enc.encode(JSON.stringify(block.input)).length;
        } else if (block.type === 'tool_result' && block.content) {
          const content = typeof block.content === 'string' 
            ? block.content 
            : JSON.stringify(block.content);
          tokenCount += enc.encode(content).length;
        }
      }
    }
  }
  
  // Count system tokens
  if (typeof system === 'string') {
    tokenCount += enc.encode(system).length;
  } else if (Array.isArray(system)) {
    for (const block of system) {
      if (block.type === 'text' && block.text) {
        tokenCount += enc.encode(block.text).length;
      }
    }
  }
  
  // Count tool tokens
  if (tools) {
    for (const tool of tools) {
      tokenCount += enc.encode(tool.name + (tool.description || '')).length;
      if (tool.input_schema) {
        tokenCount += enc.encode(JSON.stringify(tool.input_schema)).length;
      }
    }
  }
  
  return tokenCount;
}
```

#### Base Transformers

```typescript
// packages/core/src/transformers/openrouter.ts

import { Transformer, TransformerContext } from '../types/transformer';
import { ClaudeRequest } from '../types/api';

export class OpenRouterTransformer implements Transformer {
  name = 'openrouter';
  
  transformRequest(request: ClaudeRequest, context: TransformerContext): any {
    const { options } = context;
    
    const transformed: any = {
      model: request.model,
      messages: this.convertMessages(request.messages),
      max_tokens: request.max_tokens,
      temperature: request.temperature,
      top_p: request.top_p,
      stream: request.stream,
    };
    
    // Add system message if present
    if (request.system) {
      const systemContent = typeof request.system === 'string'
        ? request.system
        : request.system.map(b => b.text).join('\n');
      
      transformed.messages.unshift({
        role: 'system',
        content: systemContent,
      });
    }
    
    // Add tools if present
    if (request.tools && request.tools.length > 0) {
      transformed.tools = request.tools.map(tool => ({
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.input_schema,
        },
      }));
    }
    
    // Add provider routing if specified
    if (options?.provider) {
      transformed.provider = options.provider;
    }
    
    return transformed;
  }
  
  private convertMessages(messages: any[]): any[] {
    return messages.map(msg => {
      if (typeof msg.content === 'string') {
        return { role: msg.role, content: msg.content };
      }
      
      // Handle complex content blocks
      const content: any[] = [];
      for (const block of msg.content) {
        if (block.type === 'text') {
          content.push({ type: 'text', text: block.text });
        } else if (block.type === 'tool_use') {
          // Convert to OpenAI tool call format
          return {
            role: 'assistant',
            tool_calls: [{
              id: block.id,
              type: 'function',
              function: {
                name: block.name,
                arguments: JSON.stringify(block.input),
              },
            }],
          };
        } else if (block.type === 'tool_result') {
          return {
            role: 'tool',
            tool_call_id: block.tool_use_id,
            content: typeof block.content === 'string' 
              ? block.content 
              : JSON.stringify(block.content),
          };
        }
      }
      
      return { role: msg.role, content };
    });
  }
  
  transformResponse(response: any, context: TransformerContext): any {
    const choice = response.choices?.[0];
    if (!choice) return response;
    
    const content: any[] = [];
    
    // Handle text content
    if (choice.message?.content) {
      content.push({
        type: 'text',
        text: choice.message.content,
      });
    }
    
    // Handle tool calls
    if (choice.message?.tool_calls) {
      for (const toolCall of choice.message.tool_calls) {
        content.push({
          type: 'tool_use',
          id: toolCall.id,
          name: toolCall.function.name,
          input: JSON.parse(toolCall.function.arguments),
        });
      }
    }
    
    return {
      id: response.id,
      type: 'message',
      role: 'assistant',
      content,
      model: response.model,
      stop_reason: choice.finish_reason,
      stop_sequence: null,
      usage: {
        input_tokens: response.usage?.prompt_tokens || 0,
        output_tokens: response.usage?.completion_tokens || 0,
      },
    };
  }
  
  transformStreamChunk(chunk: any, context: TransformerContext): string {
    // Transform SSE chunk from OpenRouter format to Claude format
    const choice = chunk.choices?.[0];
    if (!choice) return '';
    
    const claudeChunk: any = {
      type: 'content_block_delta',
      index: 0,
      delta: {},
    };
    
    if (choice.delta?.content) {
      claudeChunk.delta.type = 'text_delta';
      claudeChunk.delta.text = choice.delta.content;
    }
    
    return `event: content_block_delta\ndata: ${JSON.stringify(claudeChunk)}\n\n`;
  }
}
```

### 2. Router Service (`apps/router`)

The Router Service is the core proxy application built with Hono.

#### Server Setup

```typescript
// apps/router/src/server.ts

import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { authMiddleware } from './middleware/auth';
import { routerMiddleware } from './middleware/router';
import { transformerMiddleware } from './middleware/transformer';
import { AppConfig } from '@claude-router/core';

export function createServer(config: AppConfig) {
  const app = new Hono();
  
  // Global middleware
  app.use('*', logger());
  app.use('*', cors());
  
  // Authentication middleware
  if (config.APIKEY) {
    app.use('*', authMiddleware(config.APIKEY));
  }
  
  // Health check endpoint
  app.get('/', (c) => {
    return c.json({
      status: 'ok',
      version: '1.0.0',
      providers: config.Providers.map(p => p.name),
    });
  });
  
  // Token counting endpoint
  app.post('/v1/messages/count_tokens', async (c) => {
    const { messages, system, tools } = await c.req.json();
    const tokenCount = calculateTokenCount(messages, system, tools);
    return c.json({ input_tokens: tokenCount });
  });
  
  // Main proxy endpoint
  app.post('/v1/messages', 
    routerMiddleware(config),
    transformerMiddleware(config),
    async (c) => {
      // Forward request to selected provider
      const { provider, model, transformedRequest } = c.get('routingContext');
      
      const response = await fetch(provider.api_base_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${provider.api_key}`,
        },
        body: JSON.stringify(transformedRequest),
      });
      
      if (transformedRequest.stream) {
        // Handle streaming response
        return c.stream(async (stream) => {
          const reader = response.body?.getReader();
          if (!reader) return;
          
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            await stream.write(value);
          }
        });
      }
      
      // Handle non-streaming response
      const data = await response.json();
      const transformedResponse = c.get('transformedResponse');
      return c.json(transformedResponse || data);
    }
  );
  
  // Configuration management endpoints
  app.get('/api/config', async (c) => {
    return c.json(config);
  });
  
  app.post('/api/config', async (c) => {
    const newConfig = await c.req.json();
    // Save configuration logic
    return c.json({ success: true });
  });
  
  return app;
}
```

#### Routing Middleware

```typescript
// apps/router/src/middleware/router.ts

import { MiddlewareHandler } from 'hono';
import { AppConfig, calculateTokenCount } from '@claude-router/core';

export function routerMiddleware(config: AppConfig): MiddlewareHandler {
  return async (c, next) => {
    const request = await c.req.json();
    
    // Calculate token count
    const tokenCount = calculateTokenCount(
      request.messages,
      request.system,
      request.tools
    );
    
    // Determine routing
    let routeKey: string;
    
    // Check for explicit model override
    if (request.model.includes(',')) {
      const [providerName, modelName] = request.model.split(',');
      const provider = config.Providers.find(p => p.name === providerName);
      if (provider && provider.models.includes(modelName)) {
        c.set('routingContext', {
          provider,
          model: modelName,
          request,
          tokenCount,
        });
        await next();
        return;
      }
    }
    
    // Check for long context
    const longContextThreshold = config.Router.longContextThreshold || 60000;
    if (tokenCount > longContextThreshold && config.Router.longContext) {
      routeKey = config.Router.longContext;
    }
    // Check for background task (haiku model)
    else if (request.model.includes('haiku') && config.Router.background) {
      routeKey = config.Router.background;
    }
    // Check for web search
    else if (request.tools?.some((t: any) => t.type?.startsWith('web_search')) 
             && config.Router.webSearch) {
      routeKey = config.Router.webSearch;
    }
    // Check for thinking/reasoning
    else if (request.thinking && config.Router.think) {
      routeKey = config.Router.think;
    }
    // Default route
    else {
      routeKey = config.Router.default;
    }
    
    // Parse route key (format: "provider,model")
    const [providerName, modelName] = routeKey.split(',');
    const provider = config.Providers.find(p => p.name === providerName);
    
    if (!provider) {
      return c.json({ error: 'Provider not found' }, 404);
    }
    
    c.set('routingContext', {
      provider,
      model: modelName,
      request,
      tokenCount,
    });
    
    await next();
  };
}
```

#### Transformer Middleware

```typescript
// apps/router/src/middleware/transformer.ts

import { MiddlewareHandler } from 'hono';
import { AppConfig, Transformer } from '@claude-router/core';
import { TransformerRegistry } from '../utils/transformer-registry';

export function transformerMiddleware(config: AppConfig): MiddlewareHandler {
  const registry = new TransformerRegistry(config);
  
  return async (c, next) => {
    const { provider, model, request } = c.get('routingContext');
    
    // Get transformers for this provider/model
    const transformers = registry.getTransformers(provider, model);
    
    // Apply request transformations
    let transformedRequest = request;
    for (const transformer of transformers) {
      if (transformer.transformRequest) {
        transformedRequest = await transformer.transformRequest(
          transformedRequest,
          { config, provider, model }
        );
      }
    }
    
    c.set('routingContext', {
      ...c.get('routingContext'),
      transformedRequest,
    });
    
    await next();
    
    // Apply response transformations
    const response = await c.res.json();
    let transformedResponse = response;
    for (const transformer of transformers.reverse()) {
      if (transformer.transformResponse) {
        transformedResponse = await transformer.transformResponse(
          transformedResponse,
          { config, provider, model }
        );
      }
    }
    
    c.set('transformedResponse', transformedResponse);
  };
}
```

#### Deployment Configurations

**Docker:**

```dockerfile
# apps/router/Dockerfile

FROM oven/bun:1 as base
WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
COPY packages/core/package.json ./packages/core/
RUN bun install --frozen-lockfile

# Copy source
COPY packages/core ./packages/core
COPY apps/router ./apps/router

# Build
RUN bun run build

# Production image
FROM oven/bun:1-slim
WORKDIR /app

COPY --from=base /app/apps/router/dist ./dist
COPY --from=base /app/node_modules ./node_modules

ENV PORT=3456
ENV HOST=0.0.0.0

EXPOSE 3456

CMD ["bun", "dist/index.js"]
```

**Cloudflare Workers:**

```toml
# apps/router/wrangler.toml

name = "claude-code-router"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[build]
command = "bun run build"

[env.production]
vars = { LOG_LEVEL = "info" }
```

### 3. Web Management UI (`apps/web`)

The Web Management UI is built with Next.js 15, React 19, and Tailwind CSS v4.

#### Key Pages

```typescript
// apps/web/app/page.tsx

import { ConfigEditor } from '@/components/config-editor';
import { ProviderList } from '@/components/provider-list';
import { RouterRules } from '@/components/router-rules';

export default async function HomePage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Claude Code Router</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProviderList />
        <RouterRules />
      </div>
      
      <div className="mt-6">
        <ConfigEditor />
      </div>
    </div>
  );
}
```

#### Components

```typescript
// apps/web/components/provider-list.tsx

'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@repo/ui/components/ui/card';
import { Button } from '@repo/ui/components/ui/button';

export function ProviderList() {
  const [providers, setProviders] = useState([]);
  
  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => setProviders(data.Providers));
  }, []);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Providers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {providers.map((provider: any) => (
            <div key={provider.name} className="border p-4 rounded">
              <h3 className="font-semibold">{provider.name}</h3>
              <p className="text-sm text-muted-foreground">
                {provider.models.length} models
              </p>
            </div>
          ))}
          <Button>Add Provider</Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

## Data Models

### Configuration File Structure

```json
{
  "APIKEY": "optional-secret-key",
  "HOST": "0.0.0.0",
  "PORT": 3456,
  "LOG": true,
  "LOG_LEVEL": "info",
  "API_TIMEOUT_MS": 600000,
  "Providers": [
    {
      "name": "openrouter",
      "api_base_url": "https://openrouter.ai/api/v1/chat/completions",
      "api_key": "$OPENROUTER_API_KEY",
      "models": [
        "anthropic/claude-3.5-sonnet",
        "google/gemini-2.0-flash"
      ],
      "transformer": {
        "use": ["openrouter"]
      }
    }
  ],
  "Router": {
    "default": "openrouter,anthropic/claude-3.5-sonnet",
    "background": "openrouter,google/gemini-2.0-flash",
    "think": "openrouter,anthropic/claude-3.5-sonnet",
    "longContext": "openrouter,google/gemini-2.0-flash",
    "longContextThreshold": 60000
  }
}
```

## Error Handling

### Error Types

1. **Configuration Errors**: Invalid provider configuration, missing API keys
2. **Routing Errors**: No matching provider, invalid model selection
3. **Transformation Errors**: Failed request/response transformation
4. **Network Errors**: Provider API unavailable, timeout
5. **Authentication Errors**: Invalid API key, unauthorized access

### Error Response Format

```typescript
interface ErrorResponse {
  error: {
    type: string;
    message: string;
    details?: any;
  };
}
```

### Error Handling Strategy

- Log all errors with appropriate severity levels
- Return user-friendly error messages to clients
- Implement retry logic for transient network errors
- Fallback to default provider on routing failures
- Graceful degradation for non-critical features

## Testing Strategy

### Unit Tests

- Core utility functions (token counting, env interpolation)
- Transformer implementations
- Routing logic
- Configuration validation

### Integration Tests

- End-to-end request flow through router
- Provider API integration
- Streaming response handling
- Authentication middleware

### E2E Tests

- Web UI functionality
- Configuration management
- Multi-provider routing scenarios

### Test Tools

- Bun test runner for unit tests
- Playwright for E2E tests
- Mock providers for integration tests

## Performance Considerations

1. **Streaming**: Implement efficient streaming for real-time responses
2. **Caching**: Cache provider configurations and transformer instances
3. **Connection Pooling**: Reuse HTTP connections to providers
4. **Token Counting**: Optimize token calculation for large contexts
5. **Lazy Loading**: Load transformers on-demand

## Security Considerations

1. **API Key Protection**: Store keys in environment variables, never in code
2. **Authentication**: Require API key for production deployments
3. **Rate Limiting**: Implement rate limiting per client
4. **Input Validation**: Validate all incoming requests
5. **CORS**: Configure appropriate CORS policies
6. **Logging**: Sanitize logs to prevent sensitive data exposure
