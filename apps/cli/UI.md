# Claude Code Router CLI - UX/Design Audit

## Overview

The Claude Code Router CLI has layout, responsiveness, and information architecture issues that make it difficult for users to navigate. The interface breaks when the terminal window is resized, text gets truncated without clear feedback, and the decision flow is unclear. This document outlines the problems and practical solutions.

---

## Critical Issues

### 1. **Responsiveness Breaks on Window Resize**

**Problem:** The layout completely fails when the terminal window is resized to smaller dimensions. Content that displays fine in a standard terminal becomes unusable in constrained widths.

**Current behavior:**
- Multiple panels are arranged side-by-side (Router Type, Filter Models, Available Models)
- These panels maintain fixed or proportional widths regardless of terminal size
- When terminal width shrinks, panels don't reflow—they either overlap, truncate aggressively, or create horizontal overflow
- No logic detects terminal size changes and reflows the layout

**Visual impact:**
- Text gets cut off mid-word
- Boxes don't stack vertically when space is limited
- Spacing rules break down, creating disconnected islands of content
- Users working in split terminals or smaller windows get an unusable interface

**Fix needed:** Detect terminal width and apply breakpoints:
- Wide (80+ columns): Keep side-by-side panels
- Medium (60-80 columns): Stack to 2 columns, reduce padding
- Narrow (<60 columns): Full vertical stack, full-width components

---

### 2. **Poor Information Architecture & Unclear Decision Flow**

**Problem:** The interface presents three panels horizontally with no clear indication of how they relate or what the user should do first.

**Current approach:**
- Router Type panel (left)
- Filter Models panel (middle)
- Available Models panel (right)
- No visual indication that "Available Models" is the *result* of filtering
- Users must scan left-to-right without guidance
- The workflow is implicit, requiring users to figure out the logic

**Why it's problematic:**
- Users can't quickly understand the task
- The relationship between panels is unclear (parent-child? parallel? sequential?)
- Horizontal scanning goes against how users naturally navigate CLI tools
- New users may click things in the wrong order

**Fix needed:** Reorganize as a vertical, sequential flow:
1. Router Type selection (displayed first)
2. Filter Models configuration (displayed second, after router type)
3. Model Selection/Display (displayed third, shows filtered results)

This matches how users actually make decisions and eliminates the need for problematic side-by-side layouts.

---

### 3. **Text Truncation Without Clear Feedback**

**Problem:** Long content gets cut off, and users don't know content exists beyond what's visible.

**Current behavior:**
- "Available Models (100)" indicates 100 models exist, but the list only shows 2-3 items
- No scrollbar indicator, no "more items below" message
- Truncated model names (like "2-ai/glm-4.6") are abbreviated without context
- Users may not realize they need to scroll to see more options

**Impact:**
- Users think they see all available options when they don't
- No affordance for discovering hidden content
- Frustration when needed options aren't visible

**Fix needed:**
- Add explicit scrolling indicators (e.g., "↓ 97 more models" or similar)
- Implement pagination: "Showing 1-3 of 100. Use arrow keys to navigate."
- Show keyboard instructions for scrolling (e.g., "↑/↓ to navigate")
- Consider lazy-loading to show items as user scrolls

---

### 4. **Inadequate Spacing & Padding**

**Problem:** Elements are cramped together, making the interface feel cluttered and harder to scan.

**Current issues:**
- Minimal padding inside boxes around text
- Tight spacing between panels reduces breathing room
- Labels and values sit too close to each other
- Nested items (like "2-ai/glm-4.6" under "Background") lack clear visual separation

**Visual impact:**
- Interface feels overwhelming and busy
- Hard to scan and parse information quickly
- Relationships between items are unclear due to proximity

**Fix needed:**
- Increase internal padding in boxes (add at least 1-2 character spaces on all sides)
- Add vertical spacing between related sections
- Use consistent indentation for nested items
- Separate headers from content with more whitespace

---

### 5. **Unclear State & Selection Feedback**

**Problem:** Users can't quickly tell what's selected, what's focused, or what's available to interact with.

**Current approach:**
- Cyan highlighting appears on selected items
- Same cyan appears in box borders, headers, and text
- No distinction between "currently selected," "currently focused," "available for selection," or "disabled"
- Keyboard shortcuts are buried in tiny text at the bottom

**Why it fails:**
- Too much cyan everywhere makes it noise, not signal
- Users can't visually distinguish between different states
- Critical keyboard hints are hard to discover

**Fix needed:**
- Use highlighting/color only for the *currently focused* or *primary action* item
- Show selected status differently (e.g., checkmark, different styling)
- Make disabled items visually distinct (dimmed, grayed out)
- Move keyboard shortcuts to inline hints near relevant actions or add a discoverable help menu (`?`)
- Add status feedback that's prominent (e.g., "Selected: GLM-4" or "Press Enter to confirm")

---

### 6. **Disconnected Visual Hierarchy Between Panels**

**Problem:** All three panels use identical styling, making them feel unrelated despite being part of one workflow.

**Current approach:**
- Each panel has identical border thickness and style
- No visual indication of importance or sequence
- No distinction between "input panels" (Router Type, Filter) and "output panel" (Available Models)

**Impact:**
- Users treat panels as independent rather than connected
- No sense of workflow progression
- Interface feels arbitrary rather than intentional

**Fix needed:**
- Visually group related elements (Router Type and Filter Models together, Available Models separately below)
- Use slightly different styling or positioning to indicate "this is where you configure" vs. "this is your results"
- Add labels or headers that explain purpose ("Configuration" vs. "Available Models")
- Subtle visual separation (extra space or line breaks) between sections

---

### 7. **Status & Success Feedback is Invisible**

**Problem:** Important status messages (like "All changes saved") are displayed in muted coloring at the bottom and are easy to miss.

**Current behavior:**
- Status text appears in dim coloring
- Located at screen bottom where users don't naturally look
- Users may not know if their actions were successful

**Fix needed:**
- Make status messages more prominent (brighter coloring, higher on screen)
- Add clear messaging: "✓ Configuration saved" with confirmation visual
- Show errors prominently and distinctly
- Consider adding a status line at the top of the interface, below the title

---

## Recommended Improvements

### Step 1: Fix Layout Architecture (Highest Priority)

Replace the current 3-panel horizontal layout with a vertical, sequential approach:

```
┌─────────────────────────┐
│ Claude Code Router CLI  │
│                         │
│ 1. SELECT ROUTER TYPE   │
│ ┌─────────────────────┐ │
│ │ > Default           │ │
│ │   Background        │ │
│ └─────────────────────┘ │
│                         │
│ 2. FILTER MODELS        │
│ ┌─────────────────────┐ │
│ │ > Popular           │ │
│ │   Anthropic         │ │
│ └─────────────────────┘ │
│                         │
│ 3. SELECT MODEL         │
│ ┌─────────────────────┐ │
│ │ > x-ai/grok-4-fast │ │
│ │   google/gemini-2.5 │ │
│ │ ↓ 97 more...        │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

Each section stacks vertically and takes full width. Users complete one step before seeing the next (or all can be visible but clearly separated).

### Step 2: Implement Responsive Breakpoints

Add terminal width detection:
- **Wide (80+ cols):** Current layout acceptable if spacing is fixed
- **Medium (60-80 cols):** Stack to full-width vertical
- **Narrow (<60 cols):** Reduce padding, simplify layout

Test the interface at multiple terminal sizes and ensure it's usable at all of them.

### Step 3: Improve Spacing & Padding

- Add at least 1 character of padding on all sides inside boxes
- Add blank lines between major sections
- Increase vertical spacing between related items
- Use consistent indentation for nested content

### Step 4: Clarify Selection & Navigation

- Show only one item highlighted per section (the currently focused one)
- Use a clear marker (e.g., `>`) to show what's selected
- Display keyboard shortcuts inline: "Use ↑/↓ to navigate, Enter to select"
- Show current selection status: "Selected: Default" or similar
- Add a progress indicator if applicable: "Step 1 of 3"

### Step 5: Handle Large Lists Better

For the Available Models list with 100+ items:
- Don't display all at once
- Show 3-5 visible items with indication of total: "Showing 1-5 of 100"
- Add scrolling instructions: "↑/↓ to navigate, Enter to select"
- Implement filtering or search if the list grows

### Step 6: Make Status Feedback Visible

- Move status messages higher on screen (below title area)
- Use clear, positive language: "✓ Configuration applied" instead of "~-all-changes-saved"
- Keep status visible for at least 2-3 seconds after user action
- Use different messaging for errors vs. success

---

## Implementation Priorities

1. **Fix responsiveness** (redesign to vertical stack)
2. **Improve padding and spacing** (make interface less cramped)
3. **Clarify selection state** (show focused/selected items clearly)
4. **Handle large lists** (indicate more content exists, provide navigation)
5. **Make status prominent** (users know when actions succeed)
6. **Add keyboard hints** (discoverable navigation instructions)

---

## Summary

The main problems are:
- Horizontal panel layout breaks when terminal is resized
- No clear sequential workflow (panels should stack vertically)
- Cramped spacing makes interface hard to scan
- Text gets truncated without feedback about hidden content
- Status messages are invisible to users
- Selection state is ambiguous

The core fix is redesigning from a horizontal, multi-panel layout to a vertical, sequential one. This solves responsiveness, clarity, and workflow issues simultaneously. Then, improve spacing, scrolling feedback, and status visibility.