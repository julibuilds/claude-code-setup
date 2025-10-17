)
```

### Pattern 3: Focus Management
```typescript
focusableElements = [input1, select1, input2]
function updateFocus() {
  focusableElements.forEach(e => e.blur())
  focusableElements[currentIndex].focus() // Explicit focus tracking
}
```

### Pattern 4: Flexible Layouts
```typescript
// Switch between horizontal/vertical
contentArea.flexDirection = "row" // or "column"
sidebar.flexGrow = 0; sidebar.width = 20 // Fixed width
main.flexGrow = 1 // Takes remaining space
```

### Pattern 5: Screen Lifecycle
```typescript
class Screen {
  init() { /* One-time setup */ }
  update(deltaMs) { /* Per-frame */ }
  show() { /* When visible */ }
  hide() { /* When hidden */ }
}
```

---

## 🚀 Implementation Roadmap

### Immediate (Week 1): Foundation
**Hybrid approach**
- [ ] Create `hooks/useProgressAnimation.ts` - Timeline-based progress
- [ ] Create `hooks/useSpinnerAnimation.ts` - Loading spinner animation
- [ ] Create `hooks/useFocusManagement.ts` - Tab/arrow key navigation
- [ ] Add renderable refs to QuickConfigScreen
- [ ] Test animations in MainMenu

**Time:** 2-3 days  
**Files changed:** 4 new hooks + 1 modified component  
**Value:** Smooth animations, better focus management

### Short Term (Weeks 2-3): Enhanced Interactions
**Hybrid approach - Phase 2**
- [ ] Implement panel switching in QuickConfig with focus
- [ ] Add event listeners for SelectRenderableEvents
- [ ] Create custom validation display for inputs
- [ ] Add animation to pending changes display
- [ ] Smooth screen transitions

**Time:** 1 week  
**Files changed:** 3-4 components + utility functions  
**Value:** Professional UI feel, intuitive keyboard navigation

### Medium Term (Weeks 4-6): Polish
**Hybrid approach - Phase 3**
- [ ] Enhance DeployManager with progress animation
- [ ] Add loading spinners to all async operations
- [ ] Keyboard shortcut display (? to show help)
- [ ] Better error messaging with suggestions
- [ ] Cross-terminal testing (iTerm2, Terminal.app, etc.)

**Time:** 2 weeks  
**Files changed:** All screens + utilities  
**Value:** Production-ready UI

### Future (Optional): Full Core Migration
**If needed for performance or complexity**
- [ ] Migrate to ScreenController pattern
- [ ] Implement pure renderable architecture
- [ ] Remove React dependency (if beneficial)

**Time:** 3-4 weeks (only if needed)

---

## 💡 Recommendations for Your Case

### Why Hybrid is Best for Claude Code Router CLI

1. **Minimal Disruption** 
   - Keep existing React structure
   - Add new hooks incrementally
   - No breaking changes

2. **Fast Results**
   - Animations working in 1-2 days
   - Professional feel without full rewrite
   - Can ship improvements weekly

3. **Smooth Migration Path**
   - Can adopt pure Core later if needed
   - No commitment to full refactor
   - Reversible decisions

4. **Team Comfort**
   - React is familiar
   - Lower learning curve
   - Existing patterns work

### Getting Started This Week

**Step 1: Create animation hooks (2 hours)**
```bash
# New files
touch src/hooks/useProgressAnimation.ts
touch src/hooks/useSpinnerAnimation.ts
touch src/hooks/useFocusManagement.ts
```

**Step 2: Test in MainMenu (2 hours)**
- Add animated config status display
- Add smooth transitions between screens
- Verify 60fps on your M2 MacBook

**Step 3: Apply to QuickConfig (4 hours)**
- Tab switching between panels
- Pending changes animation
- Model selection feedback

**Step 4: Measure & Iterate (2 hours)**
- Performance profiling
- Visual refinement
- Cross-terminal testing

**Total Week 1:** 10 hours of focused work = professional animations

---

## 📊 Comparison: Hybrid vs Pure Core

| Aspect | Hybrid | Pure Core |
|--------|--------|-----------|
| **Setup Time** | 1 week | 3-4 weeks |
| **Learning Curve** | Minimal (React) | Steep (new patterns) |
| **Code Changes** | Additive (new hooks) | Rewrite (full migration) |
| **Risk** | Low (isolated changes) | High (full refactor) |
| **Animation Quality** | 60fps ✓ | 60fps ✓ |
| **Focus Management** | Excellent | Excellent |
| **Team Adoption** | Immediate | Gradual |
| **Performance** | Good | Excellent |
| **Reversibility** | Easy | Hard |

**Verdict:** Hybrid wins on velocity, maintainability, and risk. Pure Core wins on performance (marginal difference). **Hybrid recommended.**

---

## 📖 Documentation Structure

```
/Users/sean/code/claude-code-setup/apps/cli/
├── README_REFACTOR.md          # This file - quick start guide
├── PLAN.md                     # Full refactor plan (Pure Core)
├── HYBRID_STRATEGY.md          # Hybrid approach (Recommended)
├── src/
│   ├── hooks/
│   │   ├── useProgressAnimation.ts    # NEW (when implementing)
│   │   ├── useSpinnerAnimation.ts     # NEW (when implementing)
│   │   └── useFocusManagement.ts      # NEW (when implementing)
│   ├── renderables/              # NEW (if migrating to Pure Core)
│   │   ├── base/
│   │   └── animated/
│   └── ... (existing structure preserved)
```

---

## 🔗 References

### Core OpenTUI Examples Analyzed
- `/Users/sean/code/opentui/packages/core/src/examples/opentui-demo.ts` - Visual patterns
- `/Users/sean/code/opentui/packages/core/src/examples/input-select-layout-demo.ts` - Form patterns
- `/Users/sean/code/opentui/packages/core/src/examples/simple-layout-example.ts` - Layout patterns
- `/Users/sean/code/opentui/packages/core/src/examples/timeline-example.ts` - Animation patterns
- `/Users/sean/code/opentui/packages/core/src/examples/lib/tab-controller.ts` - Navigation pattern
- `/Users/sean/code/opentui/packages/core/src/examples/select-demo.ts` - Event patterns

### OpenTUI Packages
- `@opentui/core` - Low-level renderables, Timeline, renderer
- `@opentui/react` - React reconciler, hooks (useRenderer, useKeyboard, etc.)

### Your CLI App
- Current: `/Users/sean/code/claude-code-setup/apps/cli/src/`
- Dependencies: Already installed (`@opentui/core`, `@opentui/react`, `zustand`)

---

## ✅ Checklist: Get Started Today

- [ ] Read `HYBRID_STRATEGY.md` (20 minutes)
- [ ] Review animation hook examples (10 minutes)
- [ ] Create `useProgressAnimation.ts` hook (30 minutes)
- [ ] Test in MainMenu component (30 minutes)
- [ ] Commit and push (5 minutes)

**Total: ~1.5 hours to see first smooth animations working**

---

## 🎓 Learning Resources

**Understanding the Stack:**
1. OpenTUI Core concepts: See PLAN.md "OpenTUI Core Patterns Reference"
2. React Reconciler: See HYBRID_STRATEGY.md "How React Reconciler Works"
3. Timeline animations: See PLAN.md Phase 4 "Timeline-Based Animations"
4. Focus management: See HYBRID_STRATEGY.md "Use Case 2"

**Code Examples:**
- Animation hook: `HYBRID_STRATEGY.md` "Use Case 1: Complex Animations"
- Focus management: `HYBRID_STRATEGY.md` "Use Case 2: Focus Management"
- Event handling: `HYBRID_STRATEGY.md` "Use Case 3: Custom Event Handling"
- Validation: `HYBRID_STRATEGY.md` "Use Case 4: Controlled Component"

**Running Examples:**
```bash
cd /Users/sean/code/opentui/packages/core/src/examples
bun timeline-example.ts        # See Timeline in action
bun input-select-layout-demo.ts # See focus management
bun simple-layout-example.ts    # See responsive layouts
```

---

## 📞 Questions to Consider

1. **Performance:** Is 60fps animation important? (Hybrid: YES ✓)
2. **Maintainability:** How important is keeping React? (Hybrid: PRESERVES ✓)
3. **Timeline:** How urgent is this? (Hybrid: IMMEDIATE ✓)
4. **Team:** Does team know React? (Hybrid: YES ✓)
5. **Future:** Might need extreme performance? (Hybrid: CAN MIGRATE LATER)

**All answers point to Hybrid → Start there**

---

## 🎯 Success Metrics

After implementing Hybrid approach:

- ✓ Smooth 60fps animations on M2 MacBook
- ✓ Tab key switches between panels intuitively
- ✓ Focus state visually clear (border colors change)
- ✓ Config status shows animated checkmarks
- ✓ Pending changes display animates in/out
- ✓ Loading states show spinner animation
- ✓ No jank or stuttering
- ✓ Works on iTerm2 + Terminal.app
- ✓ < 2 second build time maintained
- ✓ All existing features still work

---

## 🚦 Next Action

**Start with Hybrid approach:**

1. **This week:** Create 3 animation hooks, test in MainMenu
2. **Next week:** Apply to QuickConfig, add focus management
3. **Week 3:** Polish and cross-platform testing
4. **Result:** Professional, modern UI without full rewrite

**Estimated total effort:** 2-3 weeks  
**Estimated value delivered:** Massive (smooth animations, professional feel)

---

## 📝 Notes

- Current CLI already has @opentui/core and @opentui/react installed
- useRenderer() hook already available for core access
- Timeline API ready to use
- No additional dependencies needed

Good luck! The hybrid approach will give you great results quickly.
