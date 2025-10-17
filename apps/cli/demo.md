# Advanced Configuration Demo

## Quick Start

```bash
# Build and run the CLI
bun run build
./dist/router-workers-cli

# Or run in development
bun run dev
```

## Demo Flow

### 1. Main Menu
- Select option `1` for "Advanced Config"
- Notice the updated description mentioning advanced tools

### 2. Model Browser Tab (Default)
- **Browse Models**: Use ↑↓ to navigate the model table
- **Filter Models**: Tab to "filter" area, use ←→ to change filters
  - Try "anthropic" to see only Claude models
  - Try "reasoning" to see o1 and thinking models
  - Try "multimodal" to see vision-capable models
- **Sort Models**: Tab to "sort" area, use ←→ to change sorting
  - "context" shows highest context first
  - "cost" shows cheapest models first
  - "name" for alphabetical sorting
- **Search Models**: Tab to "search" area, type to search
  - Try "claude" to find Claude models
  - Try "gpt" to find GPT models
  - Try "vision" to find multimodal models
- **Assign Models**: 
  - Tab to "router" area to select router type
  - Tab to "models" area and press Enter to assign
  - Notice the "*" indicator for pending changes

### 3. Provider Manager Tab
- Tab to switch to "Provider Settings"
- **View Providers**: See all configured providers in table format
- **Edit Provider**: Use number keys 1-5 to edit different fields
  - 1: Provider name
  - 2: API base URL  
  - 3: API key
  - 4: Model list (comma-separated)
  - 5: Transformers (JSON or comma-separated)
- **Add Provider**: Press 'N' to add new provider
- **Delete Provider**: Press 'D' to remove selected provider

### 4. Configuration Summary Tab
- Tab to switch to "Configuration Summary"
- **Review Settings**: See complete configuration overview
- **Check Validation**: View any configuration issues
- **View Statistics**: See provider/model counts and pending changes

### 5. Save Changes
- Press `Ctrl+S` from any tab to save all pending changes
- Press `Ctrl+R` to reset/discard pending changes
- Notice success/error messages in the footer

## Key Features to Highlight

### Enhanced Model Discovery
- **Rich Metadata**: Context length, cost per million tokens, provider info
- **Smart Categorization**: Automatic detection of reasoning/multimodal capabilities
- **Real-time Search**: Instant filtering as you type
- **Multiple Sort Options**: Find models by different criteria

### Better Provider Management
- **Visual Interface**: Table-based provider management
- **Inline Editing**: Edit settings directly in the interface
- **Status Indicators**: See which providers need configuration
- **Flexible Configuration**: Support for custom endpoints and transformers

### Improved UX
- **Tabbed Interface**: Organized workflow vs. single screen
- **Keyboard Navigation**: Efficient navigation with clear focus indicators
- **Pending Changes**: Safe editing with explicit save/reset
- **Comprehensive Help**: Context-sensitive help text

### OpenRouter Integration
- **Smart Caching**: 24-hour cache with rate limit protection
- **User Preferences**: Uses `/models/user` endpoint when available
- **Fallback Handling**: Works offline with cached data
- **Rich API Data**: Leverages full OpenRouter model metadata

## Comparison with QuickConfig

| Feature | QuickConfig | Advanced Config |
|---------|-------------|-----------------|
| Interface | Single screen | Tabbed interface |
| Model Info | Basic (name, context) | Rich (cost, features, provider) |
| Filtering | Simple dropdown | Multi-criteria + search |
| Provider Mgmt | None | Full management interface |
| Validation | Basic | Comprehensive with details |
| Caching | Simple | Smart with rate limiting |
| Navigation | Tab cycling | Focus areas + tabs |
| Changes | Immediate | Staged with explicit save |

## Environment Setup

```bash
# Required environment variables
OPENROUTER_API_KEY=sk-or-v1-your-key-here

# Optional: Create .env file in apps/cli/
echo "OPENROUTER_API_KEY=sk-or-v1-your-key-here" > apps/cli/.env
```

## Troubleshooting

### No Models Loading
- Check OPENROUTER_API_KEY is set
- Verify internet connection
- Check if cached models exist (will show warning)

### Navigation Issues
- Use Tab to switch between focus areas
- Use ←→↑↓ for navigation within areas
- Check help text at bottom of screen

### Save Issues
- Ensure you have write permissions
- Check that config.json exists in router directory
- Verify .dev.vars file is writable