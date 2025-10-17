# Hybrid OpenTUI Strategy: Core + React

## Executive Summary

**TL;DR:** Use React for UI composition + Core for animations, focus, and screen control.

The React package in OpenTUI is a **reconciler** that creates core renderables from JSX. You can:
- Write React components (comfortable, familiar)
- Access underlying core renderables (powerful, flexible)
- Use core Timeline animations (smooth, 60fps)
- Mix direct renderable code with React JSX

---

## Architecture Overview

```
┌─────────────────────────────────────────┐
│  Your React Components (JSX)            │
│  - Declarative layout                   │
│  - Component state/logic                │
└────────────┬────────────────────────────┘
             │
             ▼ (via React Reconciler)
┌─────────────────────────────────────────┐
│  Core Renderables (TextRenderable,      │
│  BoxRenderable, SelectRenderable, etc)  │
│  - Actual terminal output               │
│  - Event system (SELECTION_CHANGED, etc)│
│  - Focus management                     │
│  - Timeline animations                  │
└─────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  CliRenderer                            │
│  - Terminal rendering                   │
│  - Frame loop (60fps)                   │
│  - Keyboard input                       │
└─────────────────────────────────────────┘
```

---

## How React Reconciler Works

**@opentui/react** creates a custom React renderer that maps JSX elements to core renderables:

```typescript
// React JSX
<box style={{ border: true, padding: 2 }}>
  <text>Hello</text>
</box>

// Becomes
new BoxRenderable(ctx, { 
  id: "box-0", 
  border: true, 
  padding: 2 
})
  .add(new TextRenderable(ctx, { id: "text-1", content: "Hello" }))
```

**Key Files:**
- `@opentui/react/src/reconciler/host-config.ts` - Maps React elements to renderables
- `@opentui/react/src/reconciler/renderer.ts` - Entry point, creates CliRenderer

**Process:**
1. `render(jsxElement)` creates a CliRenderer
2. React reconciler renders JSX tree
3. Reconciler calls `createInstance()` which creates core renderables
4. Renderables are added to renderer.root
5. Core renderer displays to terminal each frame

---

## Recommended Hybrid Strategy

### Best Practices

#### 1. Use React for Screen Structure
```typescript
// src/screens/QuickConfigScreen.tsx

import { useRenderer, useKeyboard, useTerminalDimensions } from "@opentui/react"
import { useEffect, useState } from "react"

export function QuickConfigScreen() {
  const { height, width } = useTerminalDimensions()
  const [selectedIndex, setSelectedIndex] = useState(0)

  return (
    <box style={{ flexDirection: "column", height }}>
      <Header title="Quick Config" />
      
      <box style={{ flex: 1, flexDirection: "row", gap: 2 }}>
        <RouterTypePanel 
          selected={selectedIndex === 0}
          onSelect={() => setSelectedIndex(0)}
        />
        <FilterPanel 
          selected={selectedIndex === 1}
          onSelect={() => setSelectedIndex(1)}
        />
        <ModelsPanel 
          selected={selectedIndex === 2}
          onSelect={() => setSelectedIndex(2)}
        />
      </box>

      <Footer />
    </box>
  )
}
```

#### 2. Use Core Features for Complex Interactions
```typescript
// src/components/AnimatedSelect.tsx

import { useRenderer } from "@opentui/react"
import { useEffect, useRef } from "react"
import { SelectRenderable, SelectRenderableEvents } from "@opentui/core"

export function AnimatedSelect({ options, onSelect }) {
  const renderer = useRenderer()
  const selectRef = useRef<SelectRenderable>(null)

  useEffect(() => {
    if (!selectRef.current) return

    // Listen to core events directly
    selectRef.current.on(
      SelectRenderableEvents.SELECTION_CHANGED, 
      (index, option) => {
        // Update based on core event
        onSelect(option)
      }
    )
  }, [])

  return (
    <select
      ref={selectRef}
      options={options}
      focused={true}
    />
  )
}
```

#### 3. Use Core Timeline for Animations
```typescript
// src/hooks/useProgressAnimation.ts

import { createTimeline } from "@opentui/core"
import { useEffect, useState } from "react"

export function useProgressAnimation(targetProgress: number) {
  const [currentProgress, setCurrentProgress] = useState(0)

  useEffect(() => {
    const target = { progress: currentProgress }
    const timeline = createTimeline({ duration: 500 })

    timeline.add(target,
      {
        progress: targetProgress,
        duration: 500,
        ease: "inOutQuad",
        onUpdate: (values) => {
          setCurrentProgress(values.targets[0].progress)
        }
      },
      0
    )
  }, [targetProgress])

  return currentProgress
}

// Usage
export function ProgressBar({ targetProgress }) {
  const progress = useProgressAnimation(targetProgress)
  const filled = Math.round((progress / 100) * 50)

  return (
    <box style={{ width: 50, height: 1, bg: "#333" }}>
      <box style={{ width: filled, height: 1, bg: "#0F0" }} />
    </box>
  )
}
```

#### 4. Access and Manipulate Core Renderables
```typescript
// src/hooks/useFocusManagement.ts

import { useRenderer } from "@opentui/react"
import { useEffect, useRef } from "react"
import type { SelectRenderable, InputRenderable } from "@opentui/core"

export function useFocusManagement() {
  const renderer = useRenderer()
  const focusableRefs = useRef<(SelectRenderable | InputRenderable)[]>([])
  const currentFocusIndex = useRef(0)

  useEffect(() => {
    // Listen for Tab key
    renderer.keyInput.on("keypress", (key) => {
      if (key.name === "tab") {
        focusableRefs.current.forEach(el => el?.blur())
        focusableRefs.current[currentFocusIndex.current]?.focus()
        
        if (key.shift) {
          currentFocusIndex.current = 
            (currentFocusIndex.current - 1 + focusableRefs.current.length) % 
            focusableRefs.current.length
        } else {
          currentFocusIndex.current = 
            (currentFocusIndex.current + 1) % focusableRefs.current.length
        }
        
        focusableRefs.current[currentFocusIndex.current]?.focus()
      }
    })
  }, [])

  return { focusableRefs, setFocusable: (el) => focusableRefs.current.push(el) }
}
```

---

## Specific Use Cases

### Use Case 1: Complex Animations
**Problem:** Need smooth progress bar animation during deployment

**Hybrid Solution:**
```typescript
// Component: DeploymentProgress.tsx (React)
import { useEffect, useState } from "react"
import { createTimeline } from "@opentui/core"

export function DeploymentProgress({ totalSteps }) {
  const [currentStep, setCurrentStep] = useState(0)

  // Animate step progression
  useEffect(() => {
    const target = { step: currentStep }
    const timeline = createTimeline({ duration: 2000 })

    timeline.add(target,
      { 
        step: totalSteps,
        duration: 2000,
        ease: "linear",
        onUpdate: (v) => setCurrentStep(v.targets[0].step)
      },
      0
    )
  }, [totalSteps])

  return (
    <box>
      <text>Deployment Progress: {Math.round(currentStep)}/{totalSteps}</text>
      {/* Progress visualization */}
    </box>
  )
}
```

### Use Case 2: Focus Management Across Panels
**Problem:** Need Tab to switch between panels (router type, filter, models)

**Hybrid Solution:**
```typescript
// Hook: useMultiPanelFocus.ts
export function useMultiPanelFocus(panelCount: number) {
  const [focusedPanel, setFocusedPanel] = useState(0)
  const renderer = useRenderer()

  useEffect(() => {
    renderer.keyInput.on("keypress", (key) => {
      if (key.name === "tab") {
        setFocusedPanel((current) => 
          key.shift 
            ? (current - 1 + panelCount) % panelCount
            : (current + 1) % panelCount
        )
      }
    })
  }, [panelCount])

  return { focusedPanel, setFocusedPanel }
}

// Usage in QuickConfigScreen
export function QuickConfigScreen() {
  const { focusedPanel } = useMultiPanelFocus(3)

  return (
    <box style={{ flexDirection: "row" }}>
      <RouterTypePanel focused={focusedPanel === 0} />
      <FilterPanel focused={focusedPanel === 1} />
      <ModelsPanel focused={focusedPanel === 2} />
    </box>
  )
}
```

### Use Case 3: Custom Event Handling
**Problem:** Need to react to Select item selection and update other panels

**Hybrid Solution:**
```typescript
// Component: ModelSelector.tsx
import { SelectRenderable, SelectRenderableEvents } from "@opentui/core"
import { useRef, useEffect } from "react"

export function ModelSelector({ onModelSelect }) {
  const selectRef = useRef<SelectRenderable>(null)

  useEffect(() => {
    if (!selectRef.current) return

    selectRef.current.on(
      SelectRenderableEvents.ITEM_SELECTED,
      (index, option) => {
        onModelSelect(option)
      }
    )
  }, [onModelSelect])

  return (
    <select
      ref={selectRef}
      options={modelOptions}
      focused={true}
    />
  )
}
```

### Use Case 4: Controlled Component with Validation
**Problem:** Input with real-time validation feedback

**Hybrid Solution:**
```typescript
export function ValidatedInput({ onValidChange }) {
  const [value, setValue] = useState("")
  const [isValid, setIsValid] = useState(false)
  const inputRef = useRef<InputRenderable>(null)

  useEffect(() => {
    // Validate on change
    const valid = value.length > 0 && value.length <= 100
    setIsValid(valid)
    onValidChange(valid)

    // Update border color based on validity
    if (inputRef.current) {
      inputRef.current.borderColor = valid ? "#0F0" : "#F00"
    }
  }, [value])

  return (
    <box>
      <input
        ref={inputRef}
        value={value}
        onInput={setValue}
        placeholder="Enter text..."
      />
      {!isValid && (
        <text fg="#F00">Invalid input</text>
      )}
    </box>
  )
}
```

---

## Migration Path

### Phase 1: Leverage Existing React Structure
Keep current React-based approach, but:
- [ ] Add Core Timeline hooks for animations
- [ ] Access renderer via `useRenderer()` hook
- [ ] Create animation components (ProgressBar, Spinner, etc.)

### Phase 2: Add Advanced Focus Management
- [ ] Create `useFocusManagement()` hook
- [ ] Implement panel switching with Tab key
- [ ] Use core events (SELECTION_CHANGED, FOCUSED, BLURRED)

### Phase 3: Optimize Complex Screens
- [ ] Identify screens needing heavy animation/control
- [ ] Create custom hooks for those features
- [ ] Mix React declarative code with core imperative code

### Phase 4: Consider Full Core If Needed
- [ ] IF performance is an issue OR
- [ ] IF animations aren't smooth OR
- [ ] IF focus management is complex
- [ ] → Then migrate to pure core renderables
- [ ] → Use ScreenController pattern from examples

---

## Current CLI App - Hybrid Recommendations

### What Works Well Currently
✓ React JSX for layout structure
✓ Config state management (Zustand)
✓ Component composition

### What to Add
- [ ] Timeline animations for progress/loading states
- [ ] `useRenderer()` for core feature access
- [ ] Focus management hooks
- [ ] Core event handlers (SelectRenderableEvents)
- [ ] Custom renderable refs via `useRef<SelectRenderable>()`

### Minimal Changes to Get Core Power

**Step 1: Use Core Timeline in React**
```typescript
// hooks/useProgressAnimation.ts - NEW
import { createTimeline } from "@opentui/core"
import { useEffect, useState } from "react"

export function useProgressAnimation(target: number) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const obj = { p: progress }
    const timeline = createTimeline({ duration: 500 })
    timeline.add(obj,
      { p: target, duration: 500, ease: "inOutQuad",
        onUpdate: (v) => setProgress(v.targets[0].p) },
      0
    )
  }, [target])

  return progress
}
```

**Step 2: Use renderer for keyboard/events**
```typescript
// hooks/useScreenFocus.ts - NEW
import { useRenderer } from "@opentui/react"
import { useEffect } from "react"

export function useScreenFocus(onTabPressed: () => void) {
  const renderer = useRenderer()

  useEffect(() => {
    const handleKeyPress = (key: any) => {
      if (key.name === "tab") onTabPressed()
    }
    renderer.keyInput.on("keypress", handleKeyPress)
    return () => renderer.keyInput.off("keypress", handleKeyPress)
  }, [])
}
```

**Step 3: Add renderable refs for select elements**
```typescript
// In QuickConfigScreen.tsx
import { useRef } from "react"
import type { SelectRenderable } from "@opentui/core"

const routerTypeSelectRef = useRef<SelectRenderable>(null)

// Access ref to attach event listeners
useEffect(() => {
  if (routerTypeSelectRef.current) {
    routerTypeSelectRef.current.on(...) // Attach core events
  }
}, [])
```

---

## Conclusion

**Hybrid approach is optimal because:**

1. ✓ Leverages React for comfortable UI composition
2. ✓ Accesses Core power for animations and control
3. ✓ Minimal changes to existing React codebase
4. ✓ Gradual path to pure Core if needed later
5. ✓ Best of both worlds: declarative + imperative

**Next Steps:**
1. Update PLAN.md to reflect hybrid approach
2. Create animation hooks (useProgressAnimation, useSpinnerAnimation)
3. Create focus management hooks (useScreenFocus, useMultiPanelFocus)
4. Add renderable refs to QuickConfigScreen
5. Test animations and focus management

---

## Resources

**@opentui/react source:** `/Users/sean/code/opentui/packages/react/src/`
- `reconciler/host-config.ts` - How JSX maps to renderables
- `reconciler/renderer.ts` - Entry point
- `hooks/use-renderer.ts` - Access core renderer

**@opentui/core source:** `/Users/sean/code/opentui/packages/core/src/`
- `renderables/Select.ts` - SelectRenderable implementation
- `animation/Timeline.ts` - Timeline system
- `Renderable.ts` - Base renderable class

**Examples using both (indirectly):**
- `/Users/sean/code/claude-code-setup/_examples/opentui/react/` - React examples
- `/Users/sean/code/opentui/packages/core/src/examples/` - Core examples
