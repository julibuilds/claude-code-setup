# Claude Code Toolkit/Setup TODO List

## TODO

We're creating a Claude Code Router/Proxy (and any necessary libraries) that allows for multi-provider configurations and usage in Claude Code.

Refer to example implementations in the `_examples/*` directory. Keep in mind that Claude/Anthropic APIs and SDKs had an update fairly recently that made some breaking changes for previous implementation versions - the claude-code-router projects in `_examples/claude-code-router/*` seem to be the most promising, maintained, and up-to-date examples to use as reference. However you can use tavily/context7 MCP tools to debug, research, and search documentation as needed.

### Requirements

- OpenRouter support is a must
- Local (Docker) and Cloudflare Workers deployment options
- Bun, TypeScript, Hono

### Ideas

- Web app (in `apps/web`) using Next.js 15+ (App Router), React 19, Tailwind CSS v4+, etc. that's a custom version/port of `_examples/claude-code-router/claude-code-router/ui`.
- Maybe we can design with focus on 2-3 major components: 1. A core/common/shared/utils type library as a new package 2. A web app 3. CLI app (bonus - future, out of scope for right now.)
