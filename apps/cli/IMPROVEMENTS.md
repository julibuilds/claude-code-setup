# TUI Design Improvements

## Overview
Comprehensive fixes for design flaws and responsiveness issues in the Claude Code Router CLI TUI application.

## Issues Fixed

### 1. Responsiveness & Layout
- **Added minimum terminal size check** (50x20) with clear warning message
- **Implemented responsive breakpoints**: wide (100+), medium (70+), narrow (50+)
- **Dynamic padding and spacing** based on terminal size
- **Adaptive panel heights** that adjust to available space
- **Compact mode** for headers and footers in narrow terminals

### 2. Visual Hierarchy
- **Consistent panel state colors** via new `panelState` theme property
  - Active: cyan/blue (focused panels)
  - Inactive: gray (unfocused panels)
  - Success/Warning/Error: semantic colors
- **Improved focus indicators** with clear visual distinction
- **Better spacing system** with consistent gaps and padding

### 3. Content Management
- **Text truncation** for narrow terminals
- **Abbreviated labels** in compact mode
- **Conditional content** (hide non-essential elements when space is limited)
- **Responsive shortcuts** (shorter descriptions in narrow mode)

### 4. Theme System Enhancements
- **Added `panelState` colors** to all themes (dark, light, neon)
- **Responsive utilities** in TUI package:
  - `getLayoutMode()` - determine current layout
  - `getResponsivePadding()` - calculate padding
  - `getResponsiveGap()` - calculate gaps
  - `truncateText()` - text truncation
  - `calculatePanelHeights()` - panel sizing

### 5. New Components
- **MinimumSizeWarning** - displays when terminal is too small
- **ResponsiveBox** - container with layout mode awareness
- **Enhanced Panel** - better state handling with panelState colors

## Files Modified

### TUI Package (`packages/tui/`)
- `src/utils/responsive.ts` - NEW: responsive utilities
- `src/components/minimum-size-warning.tsx` - NEW: size warning component
- `src/components/responsive-box.tsx` - NEW: responsive container
- `src/styles/types.ts` - added `panelState` to ColorPalette
- `src/styles/themes/neon.ts` - added panelState colors
- `src/styles/themes/dark.ts` - added panelState colors
- `src/styles/themes/light.ts` - added panelState colors
- `src/index.tsx` - exported new utilities and components

### CLI App (`apps/cli/`)
- `src/index.tsx` - wrapped app in MinimumSizeWarning
- `src/hooks/useResponsiveLayout.ts` - enhanced with TUI utilities
- `src/constants/layout.ts` - NEW: layout constants
- `src/constants/index.ts` - re-export layout constants
- `src/components/layout/Panel.tsx` - use panelState colors
- `src/components/layout/Header.tsx` - added compact mode
- `src/components/layout/Footer.tsx` - added compact mode
- `src/components/features/MainMenu/index.tsx` - responsive improvements
- `src/components/features/QuickConfig/index.tsx` - responsive improvements

## Usage Examples

### Responsive Layout Hook
```typescript
const { width, height, layoutMode, isNarrow, padding, gap } = useResponsiveLayout();

// Use responsive values
<box style={{ padding, gap }}>
  {isNarrow ? <CompactView /> : <FullView />}
</box>
```

### Minimum Size Protection
```typescript
<MinimumSizeWarning minWidth={50} minHeight={20}>
  <YourApp />
</MinimumSizeWarning>
```

### Panel States
```typescript
<Panel
  focused={isFocused}
  variant="success"
  showFocusIndicator={true}
>
  {content}
</Panel>
```

### Compact Components
```typescript
<Header
  title={isNarrow ? "Short" : "Long Title"}
  compact={isNarrow}
/>

<Footer
  shortcuts={isNarrow ? compactShortcuts : fullShortcuts}
  compact={isNarrow}
/>
```

## Testing Recommendations

1. **Test at different terminal sizes**:
   - Very narrow (< 50 cols) - should show warning
   - Narrow (50-69 cols) - compact mode
   - Medium (70-99 cols) - standard mode
   - Wide (100+ cols) - full mode

2. **Test panel focus states**:
   - Verify active panels use cyan/blue borders
   - Verify inactive panels use gray borders
   - Check focus indicators appear correctly

3. **Test content truncation**:
   - Long model names should truncate
   - Descriptions should adapt to space
   - No content overflow

4. **Test keyboard shortcuts**:
   - Verify shortcuts work in all modes
   - Check footer displays correctly

## Future Improvements

1. **Horizontal scrolling** for very long content
2. **Collapsible sections** for better space management
3. **Zoom levels** (compact/normal/comfortable)
4. **User preferences** for layout mode override
5. **Better error boundaries** with recovery options
