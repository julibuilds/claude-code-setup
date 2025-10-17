# Claude Code Router CLI - UI/UX Refactor Plan (OpenTUI Core Edition)

## Executive Summary

This document outlines a comprehensive refactor of the Claude Code Router CLI to leverage sophisticated OpenTUI core patterns discovered in reference implementations. Rather than high-level abstractions, we'll adopt low-level renderable-based architecture for maximum control, performance, and visual sophistication.

**Current State:** React-based UI using high-level OpenTUI abstractions. Functional but limited in control and polish.

**Target State:** Sophisticated terminal UI using low-level renderables with:
- Event-driven architecture (SELECTION_CHANGED, FOCUSED, BLURRED)
- Timeline-based animations with smooth interpolation
- Focus management system with visual feedback
- Multi-screen navigation (ScreenController pattern)
- Professional visual design with consistent styling

**Key Decision:** Migrate from `@opentui/react` to `@opentui/core` renderables for:
- Fine-grained layout control (flexGrow, flexShrink, flexBasis, flexDirection)
- Direct animation support via Timeline
- Better event system
- Superior performance
- Advanced focus management

---

## OpenTUI Core Patterns Reference

Patterns extracted from analysis of:
- `opentui-demo.ts` - Borders, text attributes, colors, animations
- `input-select-layout-demo.ts` - Layout, focus management, form patterns
- `simple-layout-example.ts` - Responsive layouts, flexbox patterns
- `timeline-example.ts` - Animation architecture, lifecycle hooks
- `tab-controller.ts` - Multi-screen navigation pattern
- `select-demo.ts` - Event-driven state management

### Pattern 1: Layout Architecture
Use nested BoxRenderable containers with flexbox properties:
```typescript
// Responsive layout switching
contentArea.flexDirection = "row" // or "column"
sidebar.flexGrow = 0; sidebar.flexShrink = 0; sidebar.width = 20
mainContent.flexGrow = 1; mainContent.flexShrink = 1
```

### Pattern 2: Event-Driven State
React to renderable events for all state updates:
```typescript
select.on(SelectRenderableEvents.SELECTION_CHANGED, (index, option) => {
  updateDisplay() // Update other UI elements
})
```

### Pattern 3: Focus Management
Track focusable elements and update focus via explicit calls:
```typescript
focusableElements = [input1, select1, input2]
focusableBoxes = [box1, box2, box3] // Borders change on focus
function updateFocus() {
  focusableElements.forEach(e => e.blur())
  focusableElements[currentIndex].focus()
  focusableBoxes[currentIndex].focus() // Changes border color
}
```

### Pattern 4: Timeline-Based Animations
Animate by interpolating object properties:
```typescript
const target = { x: 0, y: 0, scale: 1 }
timeline.add(target,
  { x: 100, y: 50, duration: 2000, ease: "inOutQuad",
    onUpdate: (values) => {
      element.x = values.targets[0].x
      element.y = values.targets[0].y
    }
  }, 0
)
```

### Pattern 5: Screen Lifecycle
Screens have init/show/hide/update lifecycle:
```typescript
class Screen {
  init(container: BoxRenderable) { /* One-time setup */ }
  update(deltaMs: number, container: BoxRenderable) { /* Per-frame */ }
  show() { /* When screen becomes visible */ }
  hide() { /* When screen becomes hidden */ }
}
```

### Pattern 6: Proper Cleanup
Always clean up resources:
```typescript
function destroy() {
  renderer.off("resize", handleResize)
  renderer.keyInput.off("keypress", keyboardHandler)
  selectElement.destroy()
  renderer.root.remove(selectElement.id)
}
```

---

## Phase 1: Foundation & Core Renderables (2 weeks)

### 1.1 Shift from React to Core Renderables

**Decision:** Migrate from `@opentui/react` to direct `@opentui/core` usage.

**Rationale:**
- High-level React abstractions hide low-level control
- OpenTUI core enables sophisticated animations and focus management
- Better separation of concerns between layout and state
- Direct access to update() loop for real-time animation
- Reference implementations (opentui-demo.ts, etc.) use core directly

**Migration Strategy:**
- [ ] Install `@opentui/core` (already available)
- [ ] Remove React JSX dependency from main app
- [ ] Keep React for complex component composition (optional, Phase 2+)
- [ ] Build app structure directly with Renderables

**Deliverables:**
- Index.ts refactored to use ScreenController
- All screens implemented as Renderable-based classes

### 1.2 Create Renderable Base Classes

**File Structure:**
```
src/renderables/
├── base/
│   ├── Screen.ts              # Base screen class
│   ├── FormInput.ts           # Validated input
│   ├── FormSelect.ts          # Select with filtering
│   └── Panel.ts               # Standard panel with focus
├── layouts/
│   ├── RowLayout.ts
│   ├── ColumnLayout.ts
│   └── MultiPanelLayout.ts
├── animated/
│   ├── ProgressBar.ts
│   ├── Spinner.ts
│   └── AnimatedBorder.ts
└── ScreenController.ts        # Multi-screen manager
```

**Screen Base Class**

File: `src/renderables/base/Screen.ts`

```typescript
export abstract class Screen {
  protected renderer: CliRenderer
  protected container: BoxRenderable
  protected focusableElements: (InputRenderable | SelectRenderable)[] = []
  protected currentFocusIndex = 0

  constructor(id: string, renderer: CliRenderer) {
    this.renderer = renderer
    this.container = new BoxRenderable(renderer, {
      id,
      width: "auto",
      height: "auto",
      flexGrow: 1,
      flexShrink: 1,
    })
  }

  // Lifecycle hooks - override in subclasses
  abstract init(): void
  update(deltaMs: number): void {}
  show(): void {}
  hide(): void {}

  // Focus management
  protected updateFocus(): void {
    this.focusableElements.forEach(e => e.blur())
    if (this.focusableElements[this.currentFocusIndex]) {
      this.focusableElements[this.currentFocusIndex].focus()
    }
  }

  protected nextFocus(): void {
    this.currentFocusIndex = 
      (this.currentFocusIndex + 1) % this.focusableElements.length
    this.updateFocus()
  }

  getContainer(): BoxRenderable {
    return this.container
  }

  abstract destroy(): void
}
```

**FormInput Renderable**

File: `src/renderables/base/FormInput.ts`

```typescript
export class FormInput extends InputRenderable {
  private errorBox: BoxRenderable | null = null
  private errorText: TextRenderable | null = null
  private validationState: "idle" | "valid" | "error" = "idle"

  constructor(id: string, renderer: CliRenderer, opts: InputRenderableOptions) {
    super(renderer, { id, ...opts })
    this.on(InputRenderableEvents.FOCUSED, () => {
      this.borderColor = theme.colors.accent.cyan
    })
    this.on(InputRenderableEvents.BLURRED, () => {
      this.borderColor = theme.colors.text.dim
    })
  }

  setError(message: string): void {
    this.validationState = "error"
    // Create/update error display
  }

  setValid(): void {
    this.validationState = "valid"
    // Remove error display
  }
}
```

**FormSelect Renderable**

File: `src/renderables/base/FormSelect.ts`

```typescript
export class FormSelect extends SelectRenderable {
  private filterInput: FormInput | null = null
  private filteredOptions: SelectOption[] = []

  constructor(id: string, renderer: CliRenderer, opts: any) {
    super(renderer, opts)
    this.on(SelectRenderableEvents.FOCUSED, () => {
      // Show filter input when focused
    })
  }

  setFilter(query: string): void {
    // Filter options by query
    // Update display
  }

  getFilteredOptions(): SelectOption[] {
    return this.filteredOptions
  }
}
```

**Panel Renderable**

File: `src/renderables/base/Panel.ts`

```typescript
export class Panel extends BoxRenderable {
  private header: TextRenderable
  private content: BoxRenderable
  private footer: TextRenderable | null = null
  private isLoading = false

  constructor(id: string, renderer: CliRenderer, title: string) {
    super(renderer, {
      id,
      border: true,
      borderStyle: "single",
      borderColor: theme.colors.text.dim,
      flexDirection: "column",
      ...
    })

    this.header = new TextRenderable(renderer, {
      content: title,
      fg: theme.colors.accent.cyan,
      attributes: TextAttributes.BOLD,
    })
    this.add(this.header)

    this.content = new BoxRenderable(renderer, {
      flexGrow: 1,
      flexShrink: 1,
    })
    this.add(this.content)
  }

  addContent(element: Renderable): void {
    this.content.add(element)
  }

  setLoading(loading: boolean): void {
    this.isLoading = loading
    // Show/hide loading spinner
  }

  focus(): void {
    super.focus()
    this.borderColor = theme.colors.accent.cyan
  }

  blur(): void {
    super.blur()
    this.borderColor = theme.colors.text.dim
  }
}
```

**ScreenController (Multi-Screen Manager)**

File: `src/renderables/ScreenController.ts`

Pattern from `tab-controller.ts`:

```typescript
export class ScreenController extends Renderable {
  private screens: Map<string, Screen> = new Map()
  private currentScreenId: string | null = null
  private frameCallback: ((deltaMs: number) => void) | null = null

  constructor(id: string, renderer: CliRenderer) {
    super(renderer, { id, width: "100%", height: "100%" })
    this.frameCallback = (deltaMs) => this.update(deltaMs)
    renderer.setFrameCallback(this.frameCallback)
  }

  registerScreen(id: string, screen: Screen): void {
    this.screens.set(id, screen)
    this.add(screen.getContainer())
    screen.getContainer().visible = false
  }

  switchToScreen(id: string): void {
    if (this.currentScreenId) {
      const current = this.screens.get(this.currentScreenId)
      if (current) {
        current.getContainer().visible = false
        current.hide()
      }
    }

    this.currentScreenId = id
    const screen = this.screens.get(id)
    if (screen) {
      screen.init()
      screen.getContainer().visible = true
      screen.show()
    }
  }

  private update(deltaMs: number): void {
    if (this.currentScreenId) {
      const screen = this.screens.get(this.currentScreenId)
      if (screen) {
        screen.update(deltaMs)
      }
    }
  }

  destroy(): void {
    if (this.frameCallback) {
      this.renderer.removeFrameCallback(this.frameCallback)
    }
    for (const screen of this.screens.values()) {
      screen.destroy()
    }
    this.screens.clear()
  }
}
```

**Deliverables:**
- Screen base class with lifecycle hooks
- FormInput, FormSelect, Panel renderables
- ScreenController for multi-screen navigation
- All with proper focus management and event handling

### 1.3 Design System with OpenTUI Patterns

File: `src/design/theme.ts`

Expand theme based on opentui-demo patterns:

```typescript
export const theme = {
  colors: {
    bg: {
      dark: "#1a1b26",
      mid: "#1f2335",
      light: "#28293a",
    },
    accent: {
      cyan: "#00D9FF",
      purple: "#bb9af7",
    },
    status: {
      success: "#9ece6a",
      warning: "#e0af68",
      error: "#f7768e",
      info: "#7aa2f7",
    },
    text: {
      primary: "#7aa2f7",
      dim: "#565f89",
      veryDim: "#3b4261",
    },
    focus: {
      border: "#00D9FF",
      text: "#FFFFFF",
    },
  },
  
  animation: {
    durations: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
    easing: {
      linear: "linear",
      inOutQuad: "inOutQuad",
      inOutSine: "inOutSine",
      inExpo: "inExpo",
      outExpo: "outExpo",
    },
  },

  borders: {
    standard: {
      borderStyle: "single",
      borderColor: theme.colors.text.dim,
    },
    focused: {
      borderStyle: "single",
      borderColor: theme.colors.accent.cyan,
    },
  },
}
```

File: `src/design/animations.ts`

Timeline builder functions:

```typescript
export function createProgressAnimation(target: any, duration: number) {
  return {
    targets: [target],
    properties: { progress: 100 },
    duration,
    ease: "linear",
    onUpdate: (values: any) => {
      // Update progress bar
    }
  }
}

export function createSpinnerFrames() {
  return ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
}
```

**Deliverables:**
- Enhanced theme.ts with animation configs
- animations.ts with timeline builders
- Focus color, easing, and animation timing system

---

## Phase 2: Screen Implementations (3 weeks)

### 2.1 MainMenu Screen

File: `src/screens/MainMenuScreen.ts`

**Implements:**
- [ ] Config status dashboard (4 router config boxes)
- [ ] Each config shows: status icon, model ID, context window
- [ ] Action tiles for Quick Config, Deploy, Secrets
- [ ] Keyboard shortcuts footer
- [ ] Fade-in animation on first render

**Pattern:** Nested boxes with flexbox layout (from simple-layout-example.ts)

```typescript
export class MainMenuScreen extends Screen {
  private statusPanels: Panel[] = []
  private actionTiles: BoxRenderable[] = []

  init(): void {
    // Create header with title
    const header = new TextRenderable(...)
    this.container.add(header)

    // Create status dashboard (4 columns)
    const dashboard = new BoxRenderable(this.renderer, {
      flexDirection: "row",
      gap: 2,
    })
    
    // Each router config in a panel
    this.statusPanels = [
      this.createConfigPanel("Default"),
      this.createConfigPanel("Background"),
      this.createConfigPanel("Think"),
      this.createConfigPanel("Long Context"),
    ]
    
    this.statusPanels.forEach(panel => dashboard.add(panel))
    this.container.add(dashboard)

    // Create action tiles
    this.actionTiles = [
      this.createActionTile("⚡", "Quick Config"),
      this.createActionTile("🚀", "Deploy"),
      this.createActionTile("🔐", "Secrets"),
    ]
    
    // Add to container
  }

  update(deltaMs: number): void {
    // Update config status indicators
  }
}
```

### 2.2 QuickConfig Screen

File: `src/screens/QuickConfigScreen.ts`

**Implements:**
- [ ] Three-panel layout (Router Type | Filter | Models)
- [ ] Router Type panel showing current selections
- [ ] Filter panel with provider badges
- [ ] Models panel with context window info
- [ ] Rich pending changes display
- [ ] Model search/filter functionality
- [ ] Improved keyboard navigation

**Pattern:** Multi-panel layout with Tab focus switching

```typescript
export class QuickConfigScreen extends Screen {
  private routerTypePanel: Panel
  private filterPanel: Panel
  private modelsPanel: Panel
  private previewPanel: Panel
  private panels: Panel[]

  init(): void {
    // Create three panels
    const layout = new BoxRenderable(this.renderer, {
      flexDirection: "row",
      gap: 2,
    })

    this.routerTypePanel = this.createRouterTypePanel()
    this.filterPanel = this.createFilterPanel()
    this.modelsPanel = this.createModelsPanel()
    this.previewPanel = this.createPreviewPanel()

    this.panels = [
      this.routerTypePanel,
      this.filterPanel,
      this.modelsPanel,
    ]

    // Add keyboard navigation between panels
    this.setupTabNavigation()
  }

  private setupTabNavigation(): void {
    // Tab switches between panels
    // Up/Down navigates within panel
    // Enter selects item
  }
}
```

### 2.3 DeployManager Screen

File: `src/screens/DeployManagerScreen.ts`

**Implements:**
- [ ] Pre-flight checklist (Config ✓, Secrets ✓, etc.)
- [ ] Multi-stage progress visualization
- [ ] Real-time log output in scrollable area
- [ ] Deployment status indicator
- [ ] Animated progress bar with percentage
- [ ] Rollback UI showing previous deployments

### 2.4 SecretsManager Screen

File: `src/screens/SecretsManagerScreen.ts`

**Implements:**
- [ ] Secret list with masked values
- [ ] Last updated timestamps
- [ ] Add/Edit/Delete operations
- [ ] Validation feedback
- [ ] Confirmation dialogs
- [ ] Audit trail view

---

## Phase 3: Animations & Interactions (2 weeks)

### 3.1 Timeline-Based Animations

**File:** `src/renderables/animated/ProgressBar.ts`

Animated progress bar extending BoxRenderable:

```typescript
export class ProgressBar extends BoxRenderable {
  private progress = 0
  private targetProgress = 0
  private timeline: Timeline
  private label: TextRenderable

  constructor(id: string, renderer: CliRenderer) {
    super(renderer, { id, height: 3, border: true })
    this.timeline = createTimeline({ duration: 1000, autoplay: false })
  }

  setProgress(target: number): void {
    this.targetProgress = Math.min(100, Math.max(0, target))
    const progressObj = { value: this.progress }
    
    this.timeline.add(progressObj,
      {
        value: this.targetProgress,
        duration: 500,
        ease: "inOutQuad",
        onUpdate: (values: any) => {
          this.progress = values.targets[0].value
          this.updateDisplay()
        }
      },
      0
    )
  }

  private updateDisplay(): void {
    const filledWidth = Math.round((this.progress / 100) * this.width)
    // Update filled box width
    this.label.content = `${Math.round(this.progress)}%`
  }
}
```

**File:** `src/renderables/animated/Spinner.ts`

Loading spinner with frame animation:

```typescript
export class Spinner extends TextRenderable {
  private frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
  private currentFrame = 0
  private time = 0

  update(deltaMs: number): void {
    this.time += deltaMs
    const frameIndex = Math.floor((this.time % 1000) / 100)
    if (frameIndex !== this.currentFrame) {
      this.currentFrame = frameIndex
      this.content = this.frames[this.currentFrame]
    }
  }
}
```

### 3.2 Focus State Animations

- [ ] Smooth border color transition on focus (cyan glow)
- [ ] Text color change on focus (dim → bright)
- [ ] Highlight animation for selected items

### 3.3 Screen Transition Animations

- [ ] Fade-in when entering screen
- [ ] Slide effect when navigating
- [ ] Staggered element animations (header → content → footer)

---

## Phase 4: Keyboard & Accessibility (1 week)

### 4.1 Keyboard Navigation

From pattern analysis:
- [ ] Tab / Shift+Tab: Navigate between focused elements
- [ ] Arrow Keys: Navigate within element (select items, scroll)
- [ ] Enter: Select/Activate item
- [ ] Escape: Go back to previous screen
- [ ] Ctrl+S: Save configuration
- [ ] Ctrl+R: Refresh/Reset
- [ ] Ctrl+Z: Undo
- [ ] Ctrl+Shift+Z: Redo

### 4.2 Focus Management

- [ ] Always visible focus indicator (border color change)
- [ ] Logical tab order through all interactive elements
- [ ] Focus restoration on screen return
- [ ] Keyboard shortcut legend (press ? to show)

---

## Phase 5: Polish & Optimization (1 week)

### 5.1 Visual Polish

- [ ] Consistent spacing (use theme.spacing)
- [ ] Text hierarchy refinement
- [ ] Border and divider consistency
- [ ] Color contrast verification

### 5.2 Performance Optimization

- [ ] Profile component renders
- [ ] Optimize animation frame rates (target 60fps)
- [ ] Minimize timeline callback overhead
- [ ] Memory leak prevention

### 5.3 Testing & QA

- [ ] Test on macOS Terminal, iTerm2, other terminals
- [ ] Cross-terminal compatibility
- [ ] Edge case handling (no config, network errors, etc.)
- [ ] Manual user testing

---

## Updated File Structure

```
src/
├── renderables/
│   ├── base/
│   │   ├── Screen.ts              # Base screen class
│   │   ├── FormInput.ts           # Input with validation
│   │   ├── FormSelect.ts          # Select with filtering
│   │   └── Panel.ts               # Standard panel
│   ├── layouts/
│   │   ├── RowLayout.ts
│   │   ├── ColumnLayout.ts
│   │   └── MultiPanelLayout.ts
│   ├── animated/
│   │   ├── ProgressBar.ts
│   │   ├── Spinner.ts
│   │   └── AnimatedBorder.ts
│   └── ScreenController.ts        # Multi-screen manager
├── screens/
│   ├── MainMenuScreen.ts          # NEW
│   ├── QuickConfigScreen.ts       # REFACTORED
│   ├── DeployManagerScreen.ts     # REFACTORED
│   └── SecretsManagerScreen.ts    # REFACTORED
├── design/
│   ├── theme.ts                   # ENHANCED
│   └── animations.ts              # NEW
├── stores/
│   ├── configStore.ts             # ENHANCED
│   └── uiStore.ts
├── hooks/
│   ├── useConfigState.ts
│   └── useUIState.ts
├── utils/
│   ├── cache.ts
│   ├── config.ts
│   └── ... (existing)
└── index.ts                        # REFACTORED - uses ScreenController
```

---

## Implementation Timeline

| Week | Phase | Deliverables |
|------|-------|-------------|
| 1-2 | Foundation | Base renderables, ScreenController, theme, animations |
| 3-5 | Screens | MainMenu, QuickConfig, DeployManager, SecretsManager |
| 6-7 | Polish | Animations, focus states, keyboard shortcuts |
| 8 | QA | Testing, optimization, cross-terminal verification |

---

## Key Improvements vs Current

| Aspect | Current | Target | Benefit |
|--------|---------|--------|---------|
| **Architecture** | React JSX | Direct renderables | Better control, animations |
| **State Management** | Scattered hooks | Event-driven + Zustand | Clearer data flow |
| **Animations** | None | Timeline-based | Professional feel |
| **Layout** | React flexbox | OpenTUI flexbox | More responsive |
| **Focus Management** | Basic | Explicit tracking | Better UX |
| **Performance** | Good | Excellent | 60fps smooth animations |
| **Visual Polish** | Minimal | Professional | Better first impression |

---

## Success Criteria

- ✓ Smooth 60fps animations on M2 MacBook Air
- ✓ All screens implement consistent design language
- ✓ Focus management is intuitive and visible
- ✓ Keyboard navigation works seamlessly
- ✓ Error messages provide recovery suggestions
- ✓ Build time <2 seconds, bundle <10MB
- ✓ Works on macOS Terminal, iTerm2, etc.
- ✓ No memory leaks or visual glitches

---

## References Used

All patterns derived from OpenTUI core examples:

- `opentui-demo.ts` (1059 lines) - Borders, colors, text, basic animations
- `input-select-layout-demo.ts` (426 lines) - Form patterns, focus management, layout
- `simple-layout-example.ts` (592 lines) - Responsive flexbox layouts
- `timeline-example.ts` (673 lines) - Animation patterns, timelines, lifecycle
- `tab-controller.ts` (244 lines) - Multi-screen navigation
- `select-demo.ts` (238 lines) - Event-driven state management

---

## Next Steps

1. **Week 1:** Implement base renderables (Screen, FormInput, FormSelect, Panel)
2. **Week 1:** Create ScreenController for multi-screen navigation
3. **Week 1:** Enhance theme.ts and create animations.ts
4. **Week 2:** Implement MainMenuScreen as proof-of-concept
5. **Week 2:** Refactor QuickConfigScreen using new patterns
6. **Week 3-4:** Implement remaining screens (Deploy, Secrets)
7. **Week 5-6:** Add animations and focus state management
8. **Week 7-8:** Polish, optimize, and cross-platform test

**Start immediately with Phase 1.1-1.3 to establish foundation.**
