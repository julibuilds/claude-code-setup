# Claude Code Router CLI - UI/UX Renovation Plan

## Overview

This document outlines a comprehensive UI/UX renovation for the Claude Code Router CLI using OpenTUI React patterns and best practices from the reference examples in `_docs/opentui` and `_examples/opentui/react`.

**Current State**: Functional but basic - uses static layouts, limited visual hierarchy, and repetitive component patterns.

**Target State**: Modern, polished TUI with animations, better visual feedback, consistent design system, and improved information architecture.

---

## Phase 1: Design System & Component Foundation

### 1.1 Create `src/design/theme.ts`
**Purpose**: Centralized color and styling constants

**Scope**:
- Define color palette (backgrounds, accents, success/error/warning states)
- Create reusable spacing scale
- Define border styles and shadow effects
- Export TypeScript constants for theme usage

**Key Colors** (from current scheme, standardized):
- `bg.dark`: `#1a1b26` (darkest)
- `bg.mid`: `#1f2335` (medium)
- `accent.cyan`: `#00D9FF` (primary action)
- `accent.purple`: `#bb9af7` (secondary)
- `success`: `#9ece6a` (confirmations)
- `warning`: `#e0af68` (alerts)
- `error`: `#f7768e` (errors)
- `text.primary`: `#7aa2f7` (default text)
- `text.dim`: `#565f89` (supporting text)

**Implementation**:
```typescript
// src/design/theme.ts
export const theme = {
  colors: { /* ... */ },
  spacing: [0, 1, 2, 3, 4, 6, 8],
  borderStyles: { /* ... */ }
}
```

---

### 1.2 Create Reusable Layout Components
**Purpose**: Reduce duplication, standardize structure

**Components to Create**:

#### `src/components/layout/ScreenContainer.tsx`
- Wraps main screens with consistent padding/borders
- Props: `title`, `subtitle`, `children`, `variant`
- Auto-handles terminal dimension awareness

#### `src/components/layout/Header.tsx`
- Standardized header with title and description
- Props: `title`, `subtitle`, `icon`
- Consistent styling from current menus

#### `src/components/layout/Footer.tsx`
- Standardized keyboard shortcuts display
- Props: `shortcuts` array
- Auto-formats keyboard legend

#### `src/components/layout/Panel.tsx`
- Reusable bordered panel with optional focus state
- Props: `title`, `focused`, `children`, `height`
- Used in Quick Config multi-panel layout

---

### 1.3 Create Reusable Interactive Components
**Purpose**: Consistent input handling, visual feedback

**Components to Create**:

#### `src/components/common/SelectList.tsx`
- Wrapper around OpenTUI `<select>`
- Adds visual focus indicators, help text
- Props: `options`, `focused`, `onChange`, `showScrollIndicator`, `title`

#### `src/components/common/StatusBox.tsx`
- Reusable status/message display
- Props: `status` ("loading" | "success" | "error" | "warning"), `message`, `details`
- Uses theme colors for visual state

#### `src/components/common/ProgressBar.tsx`
- Visual progress indication for deployment/saves
- Props: `label`, `percent`
- Uses animation from `useTimeline` hook

#### `src/components/common/Badge.tsx`
- Display model tier, status, or tags
- Props: `text`, `variant` ("primary" | "success" | "warning" | "error")

---

## Phase 2: Component Refactoring

### 2.1 Refactor `MainMenu.tsx`
**Current Issues**: Large component, mixed concerns, repetitive styling

**Changes**:
1. Extract header into `<Header>` component
2. Extract config preview into `<ConfigPreview>` component
3. Extract footer shortcuts into `<Footer>` component
4. Reduce code by ~40%, improve readability
5. Add subtle animation to config status indicators using `useTimeline`

**New Structure**:
```
<ScreenContainer>
  <Header title="Claude Code Router CLI" subtitle="..." />
  <ConfigPreview config={config} />
  <SelectList options={options} focused={true} />
  <Footer shortcuts={[...]} />
</ScreenContainer>
```

---

### 2.2 Refactor `QuickConfig.tsx`
**Current Issues**: Most complex component, duplicated panel logic, inconsistent error handling

**Changes**:
1. Extract three-panel layout into `<MultiPanelLayout>` component
2. Create `<RouterTypePanel>`, `<FilterPanel>`, `<ModelListPanel>` subcomponents
3. Extract loading/saving states into `<StatusOverlay>` component
4. Simplify main component logic by ~50%
5. Add pending changes animation (status box slides in)

**New Structure**:
```
<ScreenContainer>
  <Header />
  {loading && <StatusOverlay type="loading" />}
  {saving && <StatusOverlay type="saving" />}
  <MultiPanelLayout
    panels={[
      <RouterTypePanel />,
      <FilterPanel />,
      <ModelListPanel />
    ]}
    focusedPanel={focusedPanel}
  />
  {hasChanges && <PendingChangesBox changes={pendingChanges} />}
  <Footer />
</ScreenContainer>
```

---

### 2.3 Refactor `DeployManager.tsx`
**Current Issues**: Deployment output not visually distinguished, no progress indication

**Changes**:
1. Extract deploy options into separate component
2. Replace scrollbox output with better-formatted log display
3. Add deployment progress animation using `useTimeline`
4. Create `<DeploymentLog>` component for better formatting
5. Color-code log lines by severity (success/error/warning/info)
6. Add timestamp to log entries

**New Structure**:
```
{deploying ? (
  <>
    <ProgressBar label="Deploying..." percent={progress} />
    <DeploymentLog entries={output} />
  </>
) : (
  <SelectList options={deployOptions} />
)}
```

---

### 2.4 Refactor `SecretsManager.tsx`
**Current Issues**: Currently basic, no visual feedback for secret operations

**Changes**:
1. Add status indication for each secret
2. Show sync status with `.dev.vars`
3. Add confirmation dialog pattern
4. Visual feedback when secret is successfully set

---

## Phase 3: Visual Enhancement & Animation

### 3.1 Add Loading States with Animation
**Pattern**: Use `useTimeline` from examples

**Implementation Locations**:
- Model fetching spinner
- Config saving animation
- Deployment progress bar

**Reference**: `_examples/opentui/react/animation.tsx` - System Monitor example

**Changes**:
```typescript
// Example: Deployment progress
const timeline = useTimeline({ duration: 3000, loop: false });

useEffect(() => {
  timeline.add(
    { progress: 0 },
    { progress: 100, onUpdate: (v) => setProgress(v.targets[0].progress) },
    0
  );
}, []);
```

---

### 3.2 Add Focus State Visual Feedback
**Purpose**: Better UX when navigating between panels

**Changes**:
1. Add subtle border glow to focused panels
2. Highlight active panel title
3. Use color transitions to indicate focus shift
4. Add arrow indicator (▶) to focused section

**Example**: Quick Config's three panels should have clear focus state

---

### 3.3 Status Indicators & Visual Hierarchy
**Purpose**: Quick understanding of application state at a glance

**Changes**:
1. Create icon system for status (✓ ✗ ⚠ ⏳ ℹ)
2. Standardize color usage across components
3. Add optional badges for model tier/provider
4. Use text attributes (BOLD, DIM) consistently

---

## Phase 4: Information Architecture Improvements

### 4.1 Streamline Model Display
**Current Issue**: Model info scattered, context length not prominent

**Changes**:
1. Show pricing inline: `claude-3.5-sonnet ($3/$15 per 1M tokens)`
2. Add context length badge: `[200K]`
3. Show provider icon: `Anthropic` vs `OpenAI` vs custom
4. Truncate long names intelligently

**Example**:
```
anthropic/claude-3-5-sonnet-20241022  [200K]  $3/$15  ⭐
```

---

### 4.2 Improve Config Preview
**Current Issue**: Config shown as plain list of routers with unclear status

**Changes**:
1. Show which routers are configured vs missing
2. Add visual bar showing config completeness (4/4 vs 2/4)
3. Show if any router is using deprecated model
4. Link to change specific router from preview

---

### 4.3 Better Error Messages
**Current Issue**: Errors shown in generic boxes, sometimes unclear

**Changes**:
1. Create `<ErrorBox>` with icon, title, message, suggestion
2. Show contextual help for common errors
3. Add recovery actions (e.g., "Try force refresh" for model load failure)

**Example**:
```
❌ Failed to Load Models

The API request failed. This usually means:
- Your OpenRouter API key is invalid
- You don't have internet connection

Try force refreshing with Ctrl+F
```

---

## Phase 5: Polish & Refinement

### 5.1 Keyboard Navigation Improvements
**Current Issue**: Tab navigation logic duplicated per component

**Changes**:
1. Create `useNavigation` hook for consistent tab/arrow handling
2. Add visual feedback for keyboard shortcuts
3. Create help system accessible from any screen (? key)
4. Add command palette (Ctrl+K) for advanced users

---

### 5.2 Responsive Layout Handling
**Current Issue**: Some components may overflow on small terminals

**Changes**:
1. Create `useTerminalDimensions` wrapper with breakpoints
2. Add responsive grid system
3. Show warning if terminal too small
4. Gracefully degrade layouts for narrow terminals

---

### 5.3 ASCII Art Header Enhancement
**Purpose**: Visual branding improvement

**Changes**:
1. Use OpenTUI's `<ascii-font>` component for logo
2. Create ASCII art banner for each screen
3. Add optional animations on startup

**Reference**: `_examples/opentui/react/ascii.tsx`

---

## Phase 6: Documentation & Developer Experience

### 6.1 Create Component Library
**File**: `src/components/README.md`

**Content**:
- Component inventory
- Usage patterns for each component
- Props documentation
- Examples

---

### 6.2 Create Design Guidelines
**File**: `src/design/GUIDELINES.md`

**Content**:
- Color usage patterns
- Typography guidelines
- Spacing rules
- Animation guidelines
- When to use which component

---

## Implementation Priority

### Must Have (Phase 1-2):
1. ✅ Theme system creation
2. ✅ Layout component extraction
3. ✅ Component refactoring (MainMenu, QuickConfig)
4. ✅ Status box improvements

### Should Have (Phase 3-4):
5. 🔄 Animation additions
6. 🔄 Visual hierarchy improvements
7. 🔄 Model display enhancement
8. 🔄 Better error messages

### Nice to Have (Phase 5-6):
9. ⭐ Navigation improvements
10. ⭐ Responsive design
11. ⭐ ASCII art branding
12. ⭐ Component documentation

---

## File Structure After Renovation

```
src/
├── components/
│   ├── common/                    # Reusable components
│   │   ├── SelectList.tsx
│   │   ├── StatusBox.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── Badge.tsx
│   │   └── ErrorBox.tsx
│   ├── layout/                    # Layout components
│   │   ├── ScreenContainer.tsx
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Panel.tsx
│   │   ├── MultiPanelLayout.tsx
│   │   └── StatusOverlay.tsx
│   ├── features/                  # Feature-specific screens
│   │   ├── MainMenu.tsx (refactored)
│   │   ├── QuickConfig.tsx (refactored)
│   │   │   ├── RouterTypePanel.tsx
│   │   │   ├── FilterPanel.tsx
│   │   │   └── ModelListPanel.tsx
│   │   ├── DeployManager.tsx (refactored)
│   │   │   ├── DeploymentLog.tsx
│   │   │   └── DeployOptions.tsx
│   │   └── SecretsManager.tsx (enhanced)
│   └── README.md
├── design/
│   ├── theme.ts
│   └── GUIDELINES.md
├── (existing utils, context, types, hooks)
└── index.tsx
```

---

## Success Metrics

1. **Code Quality**: 40-50% reduction in duplicated styling code
2. **Maintainability**: New developers can understand component structure in <30 minutes
3. **Visual Consistency**: All components follow design system
4. **Performance**: No additional latency to startup or interaction
5. **User Experience**: Improved visual feedback and error handling

---

## References

- `_docs/opentui/react/README.md` - Component API and patterns
- `_examples/opentui/react/animation.tsx` - Animation patterns
- Current `src/components/` - Existing component style to maintain consistency
- OpenTUI core documentation for advanced rendering

---

## Notes

- Maintain all existing functionality during refactoring
- Use TypeScript strict mode for new components
- Add unit tests for new utility components (design system)
- Keep component files under 300 lines (split if needed)
- Document breaking changes to existing props
- Test on small terminals (80x24) to ensure robustness
