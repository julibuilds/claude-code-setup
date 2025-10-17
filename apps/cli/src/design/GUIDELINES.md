# Design Guidelines

Design system guidelines for Claude Code Router CLI.

## Color Usage

### Background Colors
- `bg.dark` (#1a1b26): Main content areas, darkest background
- `bg.mid` (#1f2335): Secondary containers, panels
- `bg.light` (#28293a): Hover states (rarely used)

### Accent Colors
- `accent.cyan` (#00D9FF): Primary actions, focused elements
- `accent.purple` (#bb9af7): Secondary actions, alternative highlights

### Status Colors
- `success` (#9ece6a): Confirmations, successful operations
- `warning` (#e0af68): Alerts, pending changes
- `error` (#f7768e): Errors, critical states
- `info` (#7aa2f7): Informational messages

### Text Colors
- `text.primary` (#7aa2f7): Default text, high contrast
- `text.dim` (#565f89): Secondary information
- `text.veryDim` (#3b4261): Minimal visibility hints

## Typography

### Text Attributes
Use bitwise OR to combine:
```tsx
attributes: TextAttributes.BOLD | TextAttributes.ITALIC
```

### When to Use
- **BOLD**: Titles, important status messages
- **DIM**: Supporting text, descriptions
- **ITALIC**: Rarely used, for emphasis only

## Spacing

Use the spacing scale from theme:
- 0: No spacing
- 1: Minimal gap
- 2: Standard spacing (most common)
- 3: Medium spacing
- 4: Large spacing
- 6: Extra large spacing
- 8: Maximum spacing

## Component Patterns

### Bordered Containers
Always use explicit height for containers with select components:
```tsx
<box style={{ border: true, height: 24 }}>
  <select style={{ height: 22 }} />
</box>
```

### Focus States
Only one component can be focused at a time:
```tsx
const [focused, setFocused] = useState<"input1" | "input2">("input1")
<input focused={focused === "input1"} />
<input focused={focused === "input2"} />
```

### Panel Layout
Use MultiPanelLayout for side-by-side panels:
```tsx
<MultiPanelLayout
  height={height - 12}
  panels={[<Panel1 />, <Panel2 />, <Panel3 />]}
/>
```

## Animation Guidelines

### Loading States
Use StatusOverlay for loading/saving states:
```tsx
{loading && <StatusOverlay type="loading" width={width} height={height} />}
```

### Progress Indicators
Use ProgressBar with useTimeline for animated progress:
```tsx
<ProgressBar label="Deploying..." percent={progress} />
```

## Best Practices

1. **Consistent Spacing**: Use theme.spacing values
2. **Color Semantics**: Use status colors appropriately
3. **Explicit Dimensions**: Always set height for select containers
4. **Focus Management**: Track focus state explicitly
5. **Error Handling**: Show clear error messages with recovery actions
6. **Keyboard Shortcuts**: Display shortcuts in footer
7. **Responsive Design**: Use useTerminalDimensions for layout
