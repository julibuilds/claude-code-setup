---
inclusion: always
---

# OpenTUI Usage

**Version**: v0.1.27 | **Runtime**: Bun | **React**: >=19.0.0
**Key Directories/Files**:

- https://github.com/sst/opentui/tree/main/packages/core/docs
- https://github.com/sst/opentui/blob/main/packages/react/README.md
- https://github.com/sst/opentui/blob/main/packages/react/docs/EXTEND.md
- https://github.com/sst/opentui/tree/main/packages/react/examples

## Setup

### Critical tsconfig.json

```json
{
  "compilerOptions": {
    "lib": ["ESNext", "DOM"],
    "jsx": "react-jsx",
    "jsxImportSource": "@opentui/react", // REQUIRED
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

{/* Text modifiers (must be inside <text>) */}
<text>
  <strong>Bold</strong> <em>Italic</em> <u>Underline</u>
  <b>Bold</b> <i>Italic</i>
  <span fg="red">Colored span</span>
  <br />  {/* Line break */}
</text>
```

**Helpers**: `<span>`, `<strong>`, `<em>`, `<u>`, `<b>`, `<i>`, `<br>` - Must be used inside `<text>` component

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
// ✅ CORRECT: Container with explicit height
<box style={{ border: true, height: 24 }}>
  <select
    style={{ height: 22 }}
    options={[
      { name: "Option 1", description: "Description 1", value: "opt1" },
      { name: "Option 2", description: "Description 2", value: "opt2" }
    ]}
    focused={true}
    onChange={(index, option) => {
      setSelectedIndex(index)
      console.log("Selected:", option)
    }}
    showScrollIndicator
  />
</box>

// ❌ DOESN'T WORK: Without explicit height
<box border>
  <select options={[...]} focused={true} />
</box>
```

**Critical**:

- Container must have explicit `height` prop (e.g., `height={24}`)
- Select should have explicit `height` in style (e.g., `style={{ height: 22 }}`)
- `onChange` receives `(index: number, option: SelectOption)` - option is NOT nullable in React version
- `onChange` fires on arrow key navigation AND on Enter key press
- Use `showScrollIndicator` prop to show scroll arrows

### `<scrollbox>` - Scrollable

```tsx
<scrollbox
  style={{
    rootOptions: {
      backgroundColor: "#24283b",
    },
    wrapperOptions: {
      backgroundColor: "#1f2335",
    },
    viewportOptions: {
      backgroundColor: "#1a1b26",
    },
    contentOptions: {
      backgroundColor: "#16161e",
    },
    scrollbarOptions: {
      showArrows: true,
      trackOptions: {
        foregroundColor: "#7aa2f7",
        backgroundColor: "#414868",
      },
    },
  }}
  focused
>
  {/* Long content */}
</scrollbox>
```

### `<ascii-font>` - ASCII Art

```tsx
import { measureText } from "@opentui/core"

const text = "HELLO"
const font = "block"
const { width, height } = measureText({ text, font })

<ascii-font style={{ width, height }} text={text} font={font} />
{/* fonts: "block" | "shade" | "slick" | "tiny" */}
```

**Critical**: Must set `width` and `height` in style using `measureText()` utility

### `<tab-select>` - Tab Selection

```tsx
<tab-select
  options={[
    { name: "Home", description: "Dashboard", value: "home" },
    { name: "Settings", description: "Configure", value: "settings" },
  ]}
  focused={true}
  onChange={(index, option) => console.log(option)}
/>
```

## Essential Hooks

### `useKeyboard(handler)`

```tsx
useKeyboard((key) => {
  if (key.name === "escape") process.exit(0);
  if (key.name === "tab") cycleFocus();
  if (key.ctrl && key.name === "k") toggleDebug();
});
```

**Key names**: `"escape"`, `"return"`, `"tab"`, `"up"`, `"down"`, `"left"`, `"right"`  
**Modifiers**: `key.ctrl`, `key.shift`, `key.meta`

### `useRenderer()`

```tsx
const renderer = useRenderer();
renderer.console.show(); // Debug output
renderer.toggleDebugOverlay(); // Layout inspector
```

### `useTerminalDimensions()`

```tsx
const { width, height } = useTerminalDimensions()

// Automatically updates when terminal is resized
<box style={{ width: Math.floor(width / 2), height: Math.floor(height / 3) }}>
  <text>Half-width, third-height box</text>
</box>
```

### `useOnResize(callback)`

```tsx
import { useOnResize, useRenderer } from "@opentui/react";

useOnResize((width, height) => {
  console.log(`Terminal resized to ${width}x${height}`);
});
```

### `useTimeline(options)`

```tsx
const [width, setWidth] = useState(0);

const timeline = useTimeline({
  duration: 2000,
  loop: false,
});

useEffect(() => {
  timeline.add(
    { width },
    {
      width: 50,
      duration: 2000,
      ease: "linear",
      onUpdate: (animation) => {
        setWidth(animation.targets[0].width);
      },
    },
    0 // Start time
  );
}, []);
```

## Rendering

```tsx
import { render } from "@opentui/react";

render(<App />);

// With optional config
await render(<App />, {
  exitOnCtrlC: false, // Optional: disable auto-exit (default: true)
});
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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [focused, setFocused] = useState<"username" | "password">("username");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  useKeyboard((key) => {
    if (key.name === "tab") {
      setFocused((prev) => (prev === "username" ? "password" : "username"));
    }
  });

  const handleSubmit = useCallback(() => {
    if (username === "admin" && password === "secret") {
      setStatus("success");
    } else {
      setStatus("error");
    }
  }, [username, password]);

  return (
    <box style={{ border: true, padding: 2, flexDirection: "column", gap: 1 }}>
      <text fg="#FFFF00">Login Form</text>

      <box title="Username" style={{ border: true, width: 40, height: 3 }}>
        <input
          placeholder="Enter username..."
          onInput={setUsername}
          onSubmit={handleSubmit}
          focused={focused === "username"}
        />
      </box>

      <box title="Password" style={{ border: true, width: 40, height: 3 }}>
        <input
          placeholder="Enter password..."
          onInput={setPassword}
          onSubmit={handleSubmit}
          focused={focused === "password"}
        />
      </box>

      <text
        style={{
          fg:
            status === "success"
              ? "green"
              : status === "error"
              ? "red"
              : "#999",
        }}
      >
        {status.toUpperCase()}
      </text>
    </box>
  );
}
```

### Menu Navigation (Manual)

```tsx
const [selected, setSelected] = useState(0);
const items = ["Start", "Settings", "Exit"];

useKeyboard((key) => {
  if (key.name === "up") setSelected((prev) => Math.max(0, prev - 1));
  if (key.name === "down")
    setSelected((prev) => Math.min(items.length - 1, prev + 1));
  if (key.name === "return") handleSelect(items[selected]);
});

return (
  <box>
    {items.map((item, i) => (
      <text key={i} fg={selected === i ? "cyan" : "white"}>
        {selected === i ? "> " : "  "}
        {item}
      </text>
    ))}
  </box>
);
```

### Menu Selection with `<select>` Component

```tsx
const [selectedIndex, setSelectedIndex] = useState(0);

const options: SelectOption[] = [
  { name: "Option 1", description: "Description 1", value: "opt1" },
  { name: "Option 2", description: "Description 2", value: "opt2" },
  { name: "Option 3", description: "Description 3", value: "opt3" },
];

return (
  <box style={{ border: true, height: 24 }}>
    <select
      style={{ height: 22 }}
      options={options}
      focused={true}
      onChange={(index, option) => {
        setSelectedIndex(index);
        console.log("Selected:", option);
      }}
      showScrollIndicator
    />
  </box>
);
```

**Note**: In React version, `onChange` fires on both navigation AND Enter key. The second parameter `option` is the full SelectOption object (not nullable).

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
import {
  BoxRenderable,
  OptimizedBuffer,
  RGBA,
  type BoxOptions,
  type RenderContext
} from "@opentui/core"
import { extend } from "@opentui/react"

class ConsoleButtonRenderable extends BoxRenderable {
  private _label: string = "Button"

  constructor(ctx: RenderContext, options: BoxOptions & { label?: string }) {
    super(ctx, options)

    if (options.label) {
      this._label = options.label
    }

    // Set default styling
    this.borderStyle = "single"
    this.padding = 2
  }

  protected override renderSelf(buffer: OptimizedBuffer): void {
    super.renderSelf(buffer)

    const centerX = this.x + Math.floor(this.width / 2 - this._label.length / 2)
    const centerY = this.y + Math.floor(this.height / 2)

    buffer.drawText(this._label, centerX, centerY, RGBA.fromInts(255, 255, 255, 255))
  }

  get label(): string {
    return this._label
  }

  set label(value: string) {
    this._label = value
    this.requestRender()
  }
}

// TypeScript module augmentation
declare module "@opentui/react" {
  interface OpenTUIComponents {
    consoleButton: typeof ConsoleButtonRenderable
  }
}

// Extend the component catalogue
extend({ consoleButton: ConsoleButtonRenderable })

// Usage
<consoleButton
  label="Click me!"
  style={{
    border: true,
    backgroundColor: "blue"
  }}
/>
```

## Style Reference

```tsx
style={{
  // Layout
  width: 40, height: 10, padding: 2, margin: 1,
  marginTop: 1, marginBottom: 1, marginLeft: 1, marginRight: 1,
  flexDirection: "column", // "row" | "column"
  justifyContent: "center", // "flex-start" | "center" | "flex-end" | "space-between" | "space-around"
  alignItems: "center", // "flex-start" | "center" | "flex-end" | "stretch"
  gap: 1,
  flexGrow: 1,
  flexShrink: 1,

  // Border
  border: true,
  borderStyle: "single", // "single" | "double" | "rounded" | "heavy"
  borderColor: "#FFFFFF",
  focusedBorderColor: "#00FF00",
  title: "Box Title",
  titleAlignment: "center", // "left" | "center" | "right"

  // Colors (use hex for compatibility)
  backgroundColor: "#000",
  fg: "#fff",
  bg: "#000",

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

- [ ] Container has explicit height (e.g., `height={24}`)
- [ ] Select has explicit height in style (e.g., `style={{ height: 22 }}`)
- [ ] `onChange` receives `(index, option)` where option is NOT nullable
- [ ] `onChange` fires on both navigation AND Enter key press
- [ ] Use `showScrollIndicator` prop for scroll arrows

**Best Practices**

- [ ] `useCallback` for handlers
- [ ] Explicit dimensions on containers
- [ ] Hex colors (#FF0000)
- [ ] Error states for async ops
- [ ] Exit mechanisms

## Common Gotchas & Solutions

### `<select>` Component Behavior

```tsx
// ✅ CORRECT: onChange fires on both navigation AND Enter
<select
  options={options}
  focused={true}
  onChange={(index, option) => {
    setSelectedIndex(index)
    console.log("Selected:", option)  // option is NOT nullable in React version
  }}
  style={{ height: 22 }}
/>

// ❌ COMMON MISTAKE: Not setting explicit heights
<box border>
  <select options={options} />  // Won't render properly
</box>

// ✅ CORRECT: Explicit heights on both container and select
<box style={{ border: true, height: 24 }}>
  <select style={{ height: 22 }} options={options} />
</box>
```

### Environment Variables in Global CLIs

```tsx
// ❌ PROBLEM: .env not loaded when running globally
const token = process.env.GITHUB_TOKEN; // undefined

// ✅ SOLUTION: Load .env manually
const cliDir = join(import.meta.dir, "..");
const envPath = join(cliDir, ".env");
if (existsSync(envPath)) {
  const envFile = await Bun.file(envPath).text();
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
import {
  render,
  useKeyboard,
  useRenderer,
  useTerminalDimensions,
  useTimeline,
} from "@opentui/react";
import { useState, useEffect, useCallback } from "react";
import { TextAttributes, measureText, type SelectOption } from "@opentui/core";
```

## Troubleshooting

- **Components not rendering**: Check `jsxImportSource` in tsconfig
- **Focus not working**: Only one `focused={true}` allowed
- **Keyboard ignored**: Use `useKeyboard` in rendered component
- **Layout issues**: Add `border` props to debug, verify flexbox props
- **Colors missing**: Use hex format, ensure terminal supports ANSI
- **"TextNodeRenderable only accepts strings" error**: Cannot nest `<text>` components. Use string concatenation, separate text elements in a box, or the `t` template helper from `@opentui/core`
- **`<select>` not rendering options**: Container and select must have explicit `height` props. Container should be taller than select (e.g., container: 24, select: 22)
- **`<select>` onChange behavior**: In React version, `onChange` fires on both arrow navigation AND Enter key press. The `option` parameter is NOT nullable.
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
10. **`<select>` needs explicit heights** - Both container and select must have height props
11. **`<ascii-font>` needs dimensions** - Use `measureText()` to get width/height
12. **Load .env manually for global CLIs** - Use `import.meta.dir` to find env files
13. **Use `useOnResize()` hook** - Handle terminal resize events properly
