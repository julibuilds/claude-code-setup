# Responsive Design Guide

## Quick Reference

### Breakpoints
```typescript
const BREAKPOINTS = {
  wide: 100,    // Full-featured layout
  medium: 70,   // Standard layout
  narrow: 50,   // Compact layout
};

const MIN_SIZE = {
  width: 50,    // Below this shows warning
  height: 20,
};
```

### Using the Hook
```typescript
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

function MyComponent() {
  const { 
    width,          // Terminal width
    height,         // Terminal height
    layoutMode,     // 'wide' | 'medium' | 'narrow'
    isWide,         // Boolean helpers
    isMedium,
    isNarrow,
    padding,        // Responsive padding value
    gap,            // Responsive gap value
  } = useResponsiveLayout();

  return (
    <box style={{ padding, gap }}>
      {isNarrow ? <CompactView /> : <FullView />}
    </box>
  );
}
```

### Responsive Patterns

#### 1. Conditional Content
```typescript
// Show different content based on size
{isNarrow ? (
  <text>Short</text>
) : (
  <text>Long descriptive text</text>
)}
```

#### 2. Adaptive Sizing
```typescript
// Adjust dimensions
const containerWidth = isNarrow ? width - 2 : Math.min(120, width - 4);
const containerPadding = isNarrow ? 1 : 2;
```

#### 3. Compact Components
```typescript
// Use compact prop
<Header
  title={isNarrow ? "Short" : "Full Title"}
  subtitle={isNarrow ? undefined : "Detailed subtitle"}
  compact={isNarrow}
/>

<Footer
  shortcuts={isNarrow ? compactShortcuts : fullShortcuts}
  groupByCategory={!isNarrow}
  compact={isNarrow}
/>
```

#### 4. Panel Heights
```typescript
const getPanelHeights = () => {
  const headerFooterSpace = isNarrow ? 12 : 16;
  const availableHeight = Math.max(20, height - headerFooterSpace);
  
  if (isNarrow) {
    return {
      panel1: Math.max(6, Math.floor(availableHeight * 0.3)),
      panel2: Math.max(10, Math.floor(availableHeight * 0.7)),
    };
  }
  
  return {
    panel1: Math.max(8, Math.floor(availableHeight * 0.4)),
    panel2: Math.max(12, Math.floor(availableHeight * 0.6)),
  };
};
```

## Layout Modes

### Wide (100+ columns)
- Full descriptions and labels
- Multiple columns where appropriate
- Generous padding (3)
- Large gaps (2)
- All features visible

### Medium (70-99 columns)
- Standard descriptions
- Single column layouts
- Standard padding (2)
- Standard gaps (1)
- Most features visible

### Narrow (50-69 columns)
- Abbreviated text
- Compact layouts
- Minimal padding (1)
- Minimal gaps (1)
- Essential features only

### Too Small (< 50 columns)
- Warning message displayed
- App not rendered
- Instructions to resize

## Component Guidelines

### Headers
```typescript
<Header
  icon={isNarrow ? undefined : "⚡"}  // Hide icon in narrow
  title={isNarrow ? "CCR" : "Claude Code Router"}
  subtitle={isNarrow ? undefined : "Full description"}
  compact={isNarrow}
/>
```

### Footers
```typescript
const shortcuts = isNarrow
  ? [
      { keys: "↑↓", description: "Nav", category: "Nav" },
      { keys: "Enter", description: "Select", category: "Nav" },
    ]
  : [
      { keys: "↑↓", description: "Navigate", category: "Navigation" },
      { keys: "Enter", description: "Select", category: "Navigation" },
    ];

<Footer
  shortcuts={shortcuts}
  groupByCategory={!isNarrow}
  compact={isNarrow}
/>
```

### Panels
```typescript
<Panel
  title={isNarrow ? "Config" : "Configuration"}
  focused={isFocused}
  padding={isNarrow ? 1 : 2}
  variant="standard"
>
  {content}
</Panel>
```

## Best Practices

### 1. Always Use Minimum Size Warning
```typescript
<MinimumSizeWarning minWidth={50} minHeight={20}>
  <App />
</MinimumSizeWarning>
```

### 2. Calculate Available Space
```typescript
// Account for borders, padding, headers, footers
const availableHeight = height - headerHeight - footerHeight - padding * 2 - 4;
const availableWidth = width - padding * 2 - 2;
```

### 3. Use Math.max for Minimums
```typescript
// Ensure minimum sizes
const panelHeight = Math.max(6, calculatedHeight);
const panelWidth = Math.max(30, calculatedWidth);
```

### 4. Truncate Long Text
```typescript
import { truncateTextResponsive } from '@repo/tui';

const displayText = truncateTextResponsive(longText, maxWidth);
```

### 5. Test All Sizes
- Test at 40 cols (should show warning)
- Test at 50 cols (narrow mode)
- Test at 70 cols (medium mode)
- Test at 100+ cols (wide mode)

## Common Pitfalls

### ❌ Don't: Fixed Widths
```typescript
// Bad
<box style={{ width: 100 }}>
```

### ✅ Do: Responsive Widths
```typescript
// Good
<box style={{ width: Math.min(100, width - 4) }}>
```

### ❌ Don't: Ignore Small Terminals
```typescript
// Bad - will break on small terminals
<box style={{ padding: 3 }}>
```

### ✅ Do: Use Responsive Values
```typescript
// Good
const { padding } = useResponsiveLayout();
<box style={{ padding }}>
```

### ❌ Don't: Assume Content Fits
```typescript
// Bad
<text>{veryLongModelName}</text>
```

### ✅ Do: Truncate When Needed
```typescript
// Good
<text>{isNarrow ? truncate(modelName, 30) : modelName}</text>
```

## Debugging Tips

1. **Log terminal dimensions**:
```typescript
console.log(`Terminal: ${width}x${height}, Mode: ${layoutMode}`);
```

2. **Visual indicators**:
```typescript
<text style={{ fg: 'yellow' }}>
  {width}x{height} ({layoutMode})
</text>
```

3. **Test with different terminals**:
- iTerm2 / Terminal.app (macOS)
- Windows Terminal
- GNOME Terminal / Konsole (Linux)

4. **Use border colors to debug focus**:
```typescript
borderColor={isFocused ? 'cyan' : 'gray'}
```
