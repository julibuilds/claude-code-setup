---
inclusion: always
---

# OpenTUI React - Quick Reference

**INSTRUCTIONS**: Modify this file as needed! Yes, you, Kiro Agent! Update with accurate and important usage rules, implementations, examples, "gotchas", discovered limitations, bug resolutions, etc.

**LIMITATIONS**: Concisiveness is key! Aim to limit this entire file length to below 500 lines.

**Version**: v0.1.27 | **Runtime**: Bun | **React**: >=19.0.0
**Repo**: 
**Key Directories/Files**: 
  - https://github.com/sst/opentui/tree/main/packages/core/docs
  - https://github.com/sst/opentui/blob/main/packages/react/README.md
  - https://github.com/sst/opentui/blob/main/packages/react/docs/EXTEND.md
  - https://github.com/sst/opentui/tree/main/packages/react/examples
**Notes**: Use context7 MCP tools to retrieve additional documentation, examples, source code, etc. as needed.


## Setup

### Critical tsconfig.json
```json
{
  "compilerOptions": {
    "lib": ["ESNext", "DOM"],
    "jsx": "react-jsx",
    "jsxImportSource": "@opentui/react",  // REQUIRED
    "moduleResolution": "bundler"
  }
}
```


## Core Components

### `<text>` - Display
```tsx
<text>Hello</text>
<text content="Hello" />
<text fg="red" bg="blue">Colored</text>
<text attributes={TextAttributes.BOLD | TextAttributes.ITALIC}>Styled</text>
<text><strong>Bold</strong> <em>Italic</em> <u>Underline</u></text>
```

### `<box>` - Container
```tsx
<box border title="Title" padding={2} flexDirection="column">
  <text>Content</text>
</box>
```

**Key Props**: `border`, `borderStyle`, `title`, `padding`, `margin`, `width`, `height`, `flexDirection`, `justifyContent`, `alignItems`, `backgroundColor`

### `<input>` - Text Input
```tsx
<box title="Enter name" style={{ border: true, height: 3 }}>
  <input
    placeholder="Type here..."
    focused={focused}
    onInput={setValue}
    onSubmit={handleSubmit}
  />
</box>
```

**Critical**: Only ONE input can be `focused={true}` at a time.

### `<select>` - Dropdown
```tsx
// ✅ WORKS: Container needs explicit height, select needs flexGrow
<box border height={12}>
  <select
    options={[
      { name: "Option 1", description: "...", value: "opt1" },
      { name: "Option 2", value: "opt2" }
    ]}
    focused={focused}
    onChange={(index, option) => console.log(option?.value)}
    showScrollIndicator
    style={{ flexGrow: 1 }}
  />
</box>

// ❌ DOESN'T WORK: Without height, options won't render
<box border>
  <select options={[...]} focused={true} />
</box>

// ✅ RECOMMENDED: Handle selection with Enter key separately
<box border height={12}>
  <select
    options={options}
    focused={true}
    onChange={(index) => setSelectedIndex(index)}  // Fires on arrow navigation
    style={{ flexGrow: 1 }}
  />
</box>

useKeyboard((key) => {
  if (key.name === "return") {
    handleSelection(options[selectedIndex])  // Confirm with Enter
  }
})
```

**Critical**: 
- Container must have explicit `height` prop (e.g., `height={12}`)
- Select should have `style={{ flexGrow: 1 }}` to fill container
- `onChange` option parameter is `SelectOption | null` (use optional chaining)
- **`onChange` fires on arrow key navigation**, not on Enter key
- For Enter-to-confirm behavior, track index in `onChange` and handle selection in `useKeyboard`

### `<scrollbox>` - Scrollable
```tsx
<scrollbox focused={focused}>
  {/* Long content */}
</scrollbox>
```

### `<ascii-font>` - ASCII Art
```tsx
<ascii-font text="HELLO" font="block" />  
{/* fonts: "block" | "shade" | "slick" | "tiny" */}
```


## Essential Hooks

### `useKeyboard(handler)`
```tsx
useKeyboard((key) => {
  if (key.name === "escape") process.exit(0)
  if (key.name === "tab") cycleFocus()
  if (key.ctrl && key.name === "k") toggleDebug()
})
```

**Key names**: `"escape"`, `"return"`, `"tab"`, `"up"`, `"down"`, `"left"`, `"right"`  
**Modifiers**: `key.ctrl`, `key.shift`, `key.meta`

### `useRenderer()`
```tsx
const renderer = useRenderer()
renderer.console.show()      // Debug output
renderer.toggleDebugOverlay() // Layout inspector
```

### `useTerminalDimensions()`
```tsx
const { width, height } = useTerminalDimensions()
```

### `useTimeline(options)`
```tsx
const timeline = useTimeline({ duration: 2000, loop: false })

timeline.add(
  { width: 0 },
  { 
    width: 50, 
    ease: "linear",
    onUpdate: (anim) => setWidth(anim.targets[0].width)
  }
)
```


## Rendering

```tsx
import { render } from "@opentui/react"

render(<App />, {
  exitOnCtrlC: false  // Optional: disable auto-exit
})
```


## Critical Patterns

### Focus Management (REQUIRED)
```tsx
const [focused, setFocused] = useState<"field1" | "field2">("field1")

useKeyboard((key) => {
  if (key.name === "tab") {
    setFocused(prev => prev === "field1" ? "field2" : "field1")
  }
})

<input focused={focused === "field1"} />
<input focused={focused === "field2"} />
```

### Login Form
```tsx
function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [focused, setFocused] = useState<"user" | "pass">("user")

  useKeyboard((key) => {
    if (key.name === "tab") {
      setFocused(prev => prev === "user" ? "pass" : "user")
    }
  })

  const handleSubmit = useCallback(() => {
    // Process login
  }, [username, password])

  return (
    <box style={{ border: true, padding: 2, flexDirection: "column", gap: 1 }}>
      <box title="Username" style={{ border: true, height: 3 }}>
        <input
          placeholder="Enter username..."
          onInput={setUsername}
          onSubmit={handleSubmit}
          focused={focused === "user"}
        />
      </box>
      <box title="Password" style={{ border: true, height: 3 }}>
        <input
          placeholder="Enter password..."
          onInput={setPassword}
          onSubmit={handleSubmit}
          focused={focused === "pass"}
        />
      </box>
    </box>
  )
}
```

### Menu Navigation (Manual)
```tsx
const [selected, setSelected] = useState(0)
const items = ["Start", "Settings", "Exit"]

useKeyboard((key) => {
  if (key.name === "up") setSelected(prev => Math.max(0, prev - 1))
  if (key.name === "down") setSelected(prev => Math.min(items.length - 1, prev + 1))
  if (key.name === "return") handleSelect(items[selected])
})

return (
  <box>
    {items.map((item, i) => (
      <text key={i} fg={selected === i ? "cyan" : "white"}>
        {selected === i ? "> " : "  "}{item}
      </text>
    ))}
  </box>
)
```

### Menu Selection with `<select>` Component
```tsx
// ✅ CORRECT: Track index, handle Enter separately
const [selectedIndex, setSelectedIndex] = useState(0)

const options: SelectOption[] = items.map((item) => ({
  name: item.name,
  description: item.description,
  value: item.id,
}))

useKeyboard((key) => {
  if (key.name === "return") {
    const selected = items[selectedIndex]
    handleSelect(selected)
  }
  if (key.name === "escape") handleCancel()
})

return (
  <box border height={12}>
    <select
      options={options}
      focused={true}
      onChange={(index) => setSelectedIndex(index)}  // Just update index
      showScrollIndicator
      style={{ flexGrow: 1 }}
    />
  </box>
)

// ❌ WRONG: Using onChange to trigger selection
// This will fire immediately on arrow key press!
<select
  options={options}
  onChange={(index, option) => {
    handleSelect(items[index])  // DON'T DO THIS
  }}
/>
```
## Core Utilities

```tsx
import { 
  TextAttributes,      // BOLD, ITALIC, UNDERLINE, DIM
  measureText,         // Get ASCII font dimensions
  bold, italic, fg, bg, // Text formatters
  t,                   // Template helper
  type SelectOption 
} from "@opentui/core"

// Combine attributes with bitwise OR
<text attributes={TextAttributes.BOLD | TextAttributes.UNDERLINE}>Styled</text>

// Measure ASCII font
const { width, height } = measureText({ text: "HELLO", font: "block" })

// Use formatting utilities
<text content={t`${bold(italic(fg("cyan")(`Styled!`)))}`} />
```


## Custom Components

```tsx
import { BoxRenderable, OptimizedBuffer, RGBA, type RenderContext } from "@opentui/core"
import { extend } from "@opentui/react"

class ButtonRenderable extends BoxRenderable {
  private _label = "Button"

  constructor(ctx: RenderContext, options: any) {
    super(ctx, options)
    if (options.label) this._label = options.label
    this.borderStyle = "single"
    this.padding = 2
  }

  protected renderSelf(buffer: OptimizedBuffer): void {
    super.renderSelf(buffer)
    const x = this.x + Math.floor(this.width / 2 - this._label.length / 2)
    const y = this.y + Math.floor(this.height / 2)
    buffer.drawText(this._label, x, y, RGBA.fromInts(255, 255, 255, 255))
  }

  set label(value: string) {
    this._label = value
    this.requestRender()
  }
}

// TypeScript declaration
declare module "@opentui/react" {
  interface OpenTUIComponents {
    button: typeof ButtonRenderable
  }
}

extend({ button: ButtonRenderable })

// Usage
<button label="Click me!" style={{ backgroundColor: "blue" }} />
```


## Style Reference

```tsx
style={{
  // Layout
  width: 40, height: 10, padding: 2, margin: 1,
  flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 1,
  
  // Border
  border: true, borderStyle: "single", // "double" | "rounded" | "bold"
  
  // Colors (use hex for compatibility)
  backgroundColor: "#000", fg: "#fff", bg: "#000",
  
  // Text
  attributes: TextAttributes.BOLD | TextAttributes.ITALIC
}}
```


## Implementation Checklist

**Setup**
- [ ] `jsxImportSource: "@opentui/react"` in tsconfig
- [ ] React >= 19.0.0
- [ ] Load .env manually if running as global CLI

**Focus**
- [ ] State for tracking focused component
- [ ] Tab key cycling with `useKeyboard`
- [ ] Only ONE `focused={true}` at a time

**Keyboard**
- [ ] ESC key: `process.exit(0)`
- [ ] Lowercase key names
- [ ] Check modifiers: `key.ctrl`, `key.shift`

**`<select>` Components**
- [ ] Track selected index in state
- [ ] Handle selection in `useKeyboard` with Enter
- [ ] Don't trigger actions in `onChange`
- [ ] Container has explicit height
- [ ] Select has `style={{ flexGrow: 1 }}`

**Best Practices**
- [ ] `useCallback` for handlers
- [ ] Explicit dimensions on containers
- [ ] Hex colors (#FF0000)
- [ ] Error states for async ops
- [ ] Exit mechanisms


## Common Gotchas & Solutions

### `<select>` Component Behavior
```tsx
// ❌ COMMON MISTAKE: onChange fires on arrow navigation
<select onChange={(index, option) => {
  handleSelect(option)  // Triggers immediately!
}} />

// ✅ CORRECT: Separate navigation from selection
const [selectedIndex, setSelectedIndex] = useState(0)
<select onChange={(index) => setSelectedIndex(index)} />
useKeyboard((key) => {
  if (key.name === "return") handleSelect(options[selectedIndex])
})
```

### Environment Variables in Global CLIs
```tsx
// ❌ PROBLEM: .env not loaded when running globally
const token = process.env.GITHUB_TOKEN  // undefined

// ✅ SOLUTION: Load .env manually
const cliDir = join(import.meta.dir, "..")
const envPath = join(cliDir, ".env")
if (existsSync(envPath)) {
  const envFile = await Bun.file(envPath).text()
  // Parse and set process.env...
}
```

### Focus Management Edge Cases
```tsx
// ❌ PROBLEM: Multiple focused components
<input focused={true} />
<input focused={true} />  // Only last one works

// ✅ SOLUTION: Single focus state
const [focused, setFocused] = useState<"input1" | "input2">("input1")
<input focused={focused === "input1"} />
<input focused={focused === "input2"} />
```

### Nested Text Components
```tsx
// ❌ PROBLEM: Cannot nest <text> components
<text fg="#888">
  <text fg="#00D9FF">◈</text> Section Title
</text>  // Error: TextNodeRenderable only accepts strings

// ✅ SOLUTION: Use string concatenation or template literals
<text fg="#888">◈ Section Title</text>

// ✅ ALTERNATIVE: Use separate text components
<box flexDirection="row" gap={0}>
  <text fg="#00D9FF">◈</text>
  <text fg="#888"> Section Title</text>
</box>

// ✅ ALTERNATIVE: Use styled text utilities from @opentui/core
import { t, fg } from "@opentui/core"
<text content={t`${fg("#00D9FF")("◈")} Section Title`} />
```

## Quick Imports

```tsx
import { render, useKeyboard, useRenderer, useTerminalDimensions, useTimeline } from "@opentui/react"
import { useState, useEffect, useCallback } from "react"
import { TextAttributes, measureText, type SelectOption } from "@opentui/core"
```


## Troubleshooting

- **Components not rendering**: Check `jsxImportSource` in tsconfig
- **Focus not working**: Only one `focused={true}` allowed
- **Keyboard ignored**: Use `useKeyboard` in rendered component
- **Layout issues**: Add `border` props to debug, verify flexbox props
- **Colors missing**: Use hex format, ensure terminal supports ANSI
- **"TextNodeRenderable only accepts strings" error**: Cannot nest `<text>` components. Use string concatenation, separate text elements in a box, or the `t` template helper from `@opentui/core`
- **`<select>` triggers immediately on arrow keys**: `onChange` fires on navigation, not Enter. Track index in `onChange`, handle selection in `useKeyboard` with Enter key
- **Environment variables not loading (Bun)**: When running as global CLI, `.env` files in app directory aren't auto-loaded. Use `import.meta.dir` to find and manually load env files


## Key Rules

1. **Always set jsxImportSource** - Required for importless JSX
2. **Manage focus explicitly** - One focused component at a time
3. **Never nest `<text>` components** - Use string concatenation or separate elements
4. **Wrap inputs in bordered boxes** - Standard pattern
5. **Use hex colors** - More compatible than named
6. **Handle ESC/Ctrl+C** - Always provide exit
7. **Import TextAttributes from @opentui/core** - For bitwise flags
8. **Test terminal sizes** - Use `useTerminalDimensions()`
9. **Debug with renderer.console.show()** - Essential for development
10. **`<select>` onChange ≠ selection** - Track index separately, confirm with Enter
11. **Load .env manually for global CLIs** - Use `import.meta.dir` to find env files
