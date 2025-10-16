# Implementation Plan

- [x] 1. Set up Core Library package structure

  - Create `packages/core` directory with TypeScript configuration
  - Configure package.json with Bun and necessary dependencies (tiktoken, zod)
  - Set up exports in index.ts for public API
  - _Requirements: 1.3, 1.4_

- [x] 2. Implement Core Library type definitions

  - [x] 2.1 Create configuration types (ProviderConfig, RouterConfig, AppConfig)

    - Write TypeScript interfaces in `packages/core/src/types/config.ts`
    - Include transformer configuration types
    - _Requirements: 1.4_

  - [x] 2.2 Create API types (ClaudeRequest, ClaudeResponse, ContentBlock)

    - Write TypeScript interfaces in `packages/core/src/types/api.ts`
    - Define message, tool, and streaming types
    - _Requirements: 1.1, 1.3, 1.7_

  - [x] 2.3 Create Transformer interface
    - Write Transformer interface in `packages/core/src/types/transformer.ts`
    - Define transformRequest, transformResponse, and transformStreamChunk methods
    - _Requirements: 1.5_

- [x] 3. Implement Core Library utilities

  - [x] 3.1 Implement environment variable interpolation

    - Write interpolateEnvVars function in `packages/core/src/utils/env-interpolation.ts`
    - Support both $VAR and ${VAR} syntax
    - Handle nested objects and arrays
    - _Requirements: 1.4_

  - [x] 3.2 Implement token counting utility

    - Write calculateTokenCount function in `packages/core/src/utils/token-counter.ts`
    - Use tiktoken for accurate token counting
    - Handle messages, system prompts, and tools
    - _Requirements: 1.3_

  - [x] 3.3 Implement configuration loader
    - Write loadConfig function in `packages/core/src/utils/config-loader.ts`
    - Read JSON configuration file
    - Apply environment variable interpolation
    - Validate configuration structure
    - _Requirements: 1.3, 1.4_

- [x] 4. Implement base transformers in Core Library

  - [x] 4.1 Implement OpenRouter transformer

    - Write OpenRouterTransformer class in `packages/core/src/transformers/openrouter.ts`
    - Convert Claude format to OpenAI format for requests
    - Convert OpenAI format to Claude format for responses
    - Handle streaming transformations
    - _Requirements: 1.1, 1.5, 1.7_

  - [x] 4.2 Implement DeepSeek transformer

    - Write DeepSeekTransformer class in `packages/core/src/transformers/deepseek.ts`
    - Handle DeepSeek-specific API format
    - _Requirements: 1.5_

  - [x] 4.3 Implement Gemini transformer

    - Write GeminiTransformer class in `packages/core/src/transformers/gemini.ts`
    - Handle Gemini-specific API format
    - _Requirements: 1.5_

  - [x] 4.4 Create transformer registry utility
    - Write TransformerRegistry class in `packages/core/src/utils/transformer-registry.ts`
    - Load and manage transformer instances
    - Support custom transformer loading from file paths
    - _Requirements: 1.5_

- [x] 5. Set up Router Service application structure

  - Create `apps/router` directory with TypeScript configuration
  - Configure package.json with Hono, Bun, and dependencies
  - Add dependency on @repo/core package
  - Create src directory structure (middleware, utils, agents)
  - _Requirements: 1.2_

- [x] 6. Implement Router Service core server

  - [x] 6.1 Create Hono server setup

    - Write createServer function in `apps/router/src/server.ts`
    - Configure Hono app with CORS and logging middleware
    - Set up health check endpoint
    - _Requirements: 1.2_

  - [x] 6.2 Implement main proxy endpoint

    - Create POST /v1/messages endpoint in server.ts
    - Handle request forwarding to providers
    - Support both streaming and non-streaming responses
    - _Requirements: 1.1, 1.7_

  - [x] 6.3 Implement token counting endpoint
    - Create POST /v1/messages/count_tokens endpoint
    - Use Core Library token counting utility
    - _Requirements: 1.3_

- [x] 7. Implement Router Service middleware

  - [x] 7.1 Implement authentication middleware

    - Write authMiddleware in `apps/router/src/middleware/auth.ts`
    - Support Bearer token and x-api-key header
    - Enforce localhost binding when API key not configured
    - _Requirements: 1.8_

  - [x] 7.2 Implement routing middleware

    - Write routerMiddleware in `apps/router/src/middleware/router.ts`
    - Implement token-based routing logic (long context, background, think)
    - Support explicit model override via comma syntax
    - Handle custom router script loading
    - _Requirements: 1.1, 1.3_

  - [x] 7.3 Implement transformer middleware
    - Write transformerMiddleware in `apps/router/src/middleware/transformer.ts`
    - Apply request transformations before forwarding
    - Apply response transformations before returning
    - Support transformer chaining
    - _Requirements: 1.5_

- [x] 8. Implement Router Service logging and monitoring

  - [x] 8.1 Implement structured logging

    - Configure pino logger with rotating file streams
    - Log requests, routing decisions, and errors
    - Support configurable log levels
    - _Requirements: 1.9_

  - [x] 8.2 Implement session usage tracking
    - Create usage cache in `apps/router/src/utils/cache.ts`
    - Track token usage per session
    - _Requirements: 1.9_

- [x] 9. Implement Router Service configuration management

  - [x] 9.1 Create configuration API endpoints

    - Implement GET /api/config endpoint for reading configuration
    - Implement POST /api/config endpoint for updating configuration
    - Add configuration backup functionality
    - _Requirements: 1.6_

  - [x] 9.2 Create transformer listing endpoint
    - Implement GET /api/transformers endpoint
    - Return list of available transformers
    - _Requirements: 1.5, 1.6_

- [x] 10. Implement Docker deployment configuration

  - [x] 10.1 Create Dockerfile

    - Write multi-stage Dockerfile in `apps/router/Dockerfile`
    - Use Bun base image
    - Optimize for production deployment
    - _Requirements: 1.2_

  - [x] 10.2 Create docker-compose configuration
    - Write docker-compose.yml for local development
    - Configure environment variables
    - Set up volume mounts for configuration
    - _Requirements: 1.2_

- [x] 11. Implement Cloudflare Workers deployment configuration

  - [x] 11.1 Create wrangler configuration

    - Write wrangler.toml in `apps/router/wrangler.toml`
    - Configure build command and compatibility date
    - Set up environment variables
    - _Requirements: 1.2_

  - [x] 11.2 Create Workers entry point
    - Adapt server.ts for Cloudflare Workers runtime
    - Handle Workers-specific request/response objects
    - _Requirements: 1.2_

- [ ] 12. Enhance Web Management UI structure

  - Update `apps/web` to use Next.js 15 App Router
  - Configure Tailwind CSS v4
  - Add dependency on @claude-router/core and @repo/ui packages
  - _Requirements: 1.10_

- [ ] 13. Implement Web UI configuration management pages

  - [ ] 13.1 Create dashboard page

    - Build main dashboard in `apps/web/app/page.tsx`
    - Display provider list and routing rules
    - Show system status and statistics
    - _Requirements: 1.6, 1.10_

  - [ ] 13.2 Create provider management components

    - Build ProviderList component in `apps/web/components/provider-list.tsx`
    - Build ProviderForm component for adding/editing providers
    - Implement provider CRUD operations
    - _Requirements: 1.6, 1.10_

  - [ ] 13.3 Create routing rules management components

    - Build RouterRules component in `apps/web/components/router-rules.tsx`
    - Build rule editor with dropdown selectors
    - Implement rule update functionality
    - _Requirements: 1.6, 1.10_

  - [ ] 13.4 Create configuration editor component
    - Build ConfigEditor component in `apps/web/components/config-editor.tsx`
    - Use Monaco editor for JSON editing
    - Add validation and syntax highlighting
    - _Requirements: 1.6, 1.10_

- [ ] 14. Implement Web UI API routes

  - [ ] 14.1 Create configuration API proxy routes

    - Build GET /api/config route in `apps/web/app/api/config/route.ts`
    - Build POST /api/config route for saving configuration
    - Proxy requests to Router Service
    - _Requirements: 1.6_

  - [ ] 14.2 Create logs API routes
    - Build GET /api/logs route for fetching logs
    - Build GET /api/logs/files route for listing log files
    - _Requirements: 1.9_

- [ ] 15. Implement Web UI monitoring and logs viewer

  - [ ] 15.1 Create logs viewer page

    - Build logs page in `apps/web/app/logs/page.tsx`
    - Display logs with filtering and search
    - Support real-time log streaming
    - _Requirements: 1.9, 1.10_

  - [ ] 15.2 Create metrics dashboard
    - Build metrics components showing request counts, token usage
    - Display provider health status
    - _Requirements: 1.9, 1.10_

- [ ] 16. Configure Turborepo build pipeline

  - Update turbo.json with build dependencies
  - Configure build order (core → router, core → web)
  - Set up caching for faster builds
  - _Requirements: 1.2, 1.4_

- [ ] 17. Create example configuration files

  - Create config.example.json with OpenRouter setup
  - Create .env.example with environment variable templates
  - Document configuration options in README
  - _Requirements: 1.1, 1.3, 1.4_

- [ ] 18. Create documentation
  - Write main README.md with setup instructions
  - Document deployment options (Docker and Cloudflare Workers)
  - Create provider configuration guide
  - Document custom transformer development
  - _Requirements: 1.1, 1.2, 1.5_
