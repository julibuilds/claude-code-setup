# CLI Component Library

Component documentation for Claude Code Router CLI.

## Directory Structure

```
components/
├── common/          # Reusable UI components
├── layout/          # Layout and container components
├── features/        # Feature-specific screens
└── README.md        # This file
```

## Common Components

### SelectList
Wrapper around OpenTUI `<select>` with consistent styling.

**Props:**
- `options: SelectOption[]` - List of options
- `focused: boolean` - Whether component has focus
- `onChange: (index, option) => void` - Selection handler
- `height: number` - Component height
- `showScrollIndicator?: boolean` - Show scroll arrows

### StatusBox
Display status messages with color-coded indicators.

**Props:**
- `status: "loading" | "success" | "error" | "warning"` - Status type
- `message: string` - Main message
- `details?: string` - Additional details

### ErrorBox
Display error messages with contextual help.

**Props:**
- `title: string` - Error title
- `message: string` - Error message
- `suggestion?: string` - Recovery suggestion

### ProgressBar
Visual progress indicator with animation support.

**Props:**
- `label: string` - Progress label
- `percent: number` - Progress percentage (0-100)

### Badge
Display tags, status, or model tier.

**Props:**
- `text: string` - Badge text
- `variant: "primary" | "success" | "warning" | "error"` - Color variant

## Layout Components

### Header
Standardized screen header with icon and title.

**Props:**
- `icon: string` - Icon/emoji
- `title: string` - Screen title
- `subtitle: string` - Description text

### Footer
Keyboard shortcuts display.

**Props:**
- `shortcuts: Array<{ keys: string, description: string }>` - Shortcut list

### Panel
Bordered panel with optional focus state.

**Props:**
- `title: string` - Panel title
- `focused: boolean` - Focus state
- `children: ReactNode` - Panel content
- `height: number` - Panel height

### MultiPanelLayout
Side-by-side panel layout with automatic width distribution.

**Props:**
- `panels: ReactNode[]` - Array of panels
- `height: number` - Layout height
- `gap?: number` - Space between panels (default: 2)

## Feature Components

See individual feature directories for detailed documentation.
