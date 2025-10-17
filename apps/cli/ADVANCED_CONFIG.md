# Advanced Configuration System

The Advanced Configuration system replaces the previous QuickConfig with a comprehensive, tabbed interface for managing Claude Code Router settings. It provides better OpenRouter API integration, enhanced model browsing, and advanced provider management.

## Features

### 🤖 Model Browser
- **Comprehensive Model Table**: Browse 400+ models with detailed information
- **Advanced Filtering**: Filter by provider (Anthropic, OpenAI, etc.), capabilities (reasoning, multimodal), or popularity
- **Smart Sorting**: Sort by context length, cost, name, or provider
- **Real-time Search**: Search models by name, ID, provider, or description
- **Router Assignment**: Easily assign models to different router types (default, background, think, longContext)
- **Cost Analysis**: View cost per million tokens for budget planning
- **Feature Detection**: Identify reasoning and multimodal capabilities

### 🔧 Provider Manager
- **Visual Provider Table**: Manage multiple API providers in a structured interface
- **Inline Editing**: Edit provider settings directly in the interface
- **Validation Status**: See which providers are properly configured
- **Model Management**: Configure model lists and transformers per provider
- **Add/Remove Providers**: Dynamically manage your provider list

### 📋 Configuration Summary
- **Complete Overview**: See all configuration settings at a glance
- **Change Tracking**: Identify pending changes before saving
- **Validation Checks**: Automatic validation with issue reporting
- **Statistics**: View provider counts, model counts, and configuration completeness

## Navigation

### Keyboard Controls
- **Tab**: Switch between tabs and focus areas
- **←→**: Navigate within focused areas (tabs, filters, sorts)
- **↑↓**: Navigate lists and tables
- **Enter**: Select/assign models or edit fields
- **Ctrl+S**: Save all pending changes
- **Ctrl+R**: Reset pending changes
- **ESC**: Return to main menu

### Focus Areas (Model Browser)
1. **Router Type**: Select which router to configure (default, background, think, longContext)
2. **Filter**: Choose model filter (all, popular, anthropic, openai, reasoning, multimodal)
3. **Sort**: Select sorting method (context, name, cost, provider)
4. **Search**: Text search across model names and descriptions
5. **Models**: Browse and select from the filtered model list

## OpenRouter Integration

### Enhanced API Usage
- **Caching Strategy**: 24-hour cache with smart refresh to avoid rate limits
- **User Preferences**: Utilizes `/models/user` endpoint when API key is available
- **Fallback Handling**: Graceful degradation when API is unavailable
- **Rich Metadata**: Extracts pricing, context length, capabilities, and provider info

### Model Intelligence
- **Automatic Categorization**: Identifies reasoning models (o1, think, reasoning)
- **Multimodal Detection**: Finds vision and image-capable models
- **Cost Calculation**: Computes total cost per million tokens
- **Provider Extraction**: Automatically identifies model providers

### Caching Benefits
- **Offline Usage**: Works without internet after initial cache
- **Performance**: Instant model browsing with cached data
- **Rate Limit Protection**: Reduces API calls to stay within limits
- **Smart Refresh**: Only fetches when cache expires or forced

## Configuration Management

### Pending Changes System
- **Non-destructive Editing**: Changes are staged before saving
- **Visual Indicators**: Pending changes are clearly marked with "*"
- **Batch Operations**: Save multiple changes at once
- **Easy Reset**: Discard all pending changes with Ctrl+R

### Validation & Safety
- **Real-time Validation**: Immediate feedback on configuration issues
- **Required Field Checking**: Ensures all critical settings are configured
- **API Key Validation**: Warns about missing or placeholder API keys
- **Model Assignment Tracking**: Shows which routers have assigned models

## Usage Examples

### Configuring a Reasoning Router
1. Navigate to Model Browser tab
2. Select "think" router type
3. Set filter to "reasoning" 
4. Browse o1, reasoning, and think models
5. Select desired model with Enter
6. Save with Ctrl+S

### Adding a New Provider
1. Go to Provider Manager tab
2. Press 'N' to add new provider
3. Edit fields using number keys (1-5)
4. Configure API endpoint, key, and models
5. Save configuration

### Finding Cost-Effective Models
1. In Model Browser, set sort to "cost"
2. Browse models sorted by price
3. Check the $/1M tok column for pricing
4. Consider context length vs. cost trade-offs

## Advanced Features

### Search Capabilities
- **Multi-field Search**: Searches name, ID, provider, and description
- **Real-time Filtering**: Results update as you type
- **Case Insensitive**: Flexible matching for easier discovery

### Model Recommendations
- **Popular Models**: Curated list of widely-used models
- **Reasoning Models**: Specialized models for complex reasoning tasks
- **Multimodal Models**: Vision and image-capable models
- **Long Context**: Models with 100K+ context windows

### Provider Flexibility
- **Multiple Endpoints**: Support for various API providers
- **Custom Transformers**: Configure request/response transformations
- **Model Lists**: Specify available models per provider
- **API Key Management**: Secure credential handling

## Migration from QuickConfig

The Advanced Configuration system is a complete replacement for QuickConfig, offering:

- **Better UX**: Tabbed interface vs. single-screen navigation
- **More Information**: Detailed model metadata and statistics
- **Enhanced Search**: Real-time search vs. basic filtering
- **Provider Management**: Full provider configuration vs. model-only focus
- **Validation**: Comprehensive validation vs. basic checks
- **Caching**: Smart caching strategy vs. simple API calls

To migrate, simply use the new Advanced Configuration option from the main menu. Your existing configuration will be preserved and enhanced with the new interface.