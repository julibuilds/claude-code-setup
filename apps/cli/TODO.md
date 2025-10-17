# TODO

## Completed ✅

### Phase 1: Cleanup and Consolidation

- ✅ Removed duplicate components (Panel, Spinner, StatusBox, ProgressBar)
- ✅ Deleted empty/unused files (focus-context, error-boundary, navigation, use-mouse, use-event)
- ✅ Consolidated ui/ components into common/
- ✅ Updated ui/index.ts to re-export from common/

### Phase 2: Architecture Improvements

- ✅ Created unified focus management hook (`useFocusManager`)
- ✅ Created constants file for magic numbers and strings
- ✅ Created ErrorBoundary component (functional wrapper)
- ✅ Reorganized component structure (moved MainMenu, SecretsManager to features/)
- ✅ Updated all imports to use new structure

### Phase 3: Feature Enhancements

- ✅ Added secret masking in SecretsManager (Ctrl+H to toggle)
- ✅ Replaced hardcoded colors with theme references
- ✅ Updated keyboard shortcuts to use constants
- ✅ Improved focus management in SecretsManager
- ✅ Added visual feedback for secret visibility

### Phase 4: Documentation

- ✅ Created comprehensive README.md
- ✅ Documented architecture and project structure
- ✅ Added usage examples and troubleshooting guide

## In Progress 🚧

### Testing

- ⏳ Add unit tests for utils (config, cache, deploy, secrets)
- ⏳ Add integration tests for key workflows
- ⏳ Add snapshot tests for layout components

## Planned 📋

### High Priority

1. **Split Large Files** (if any exceed 450 lines)

   - Check QuickConfig/index.tsx
   - Check DeployManager/index.tsx
   - Split into smaller, focused components

2. **Performance Optimization**

   - Add useMemo for computed values in QuickConfig
   - Add useCallback for event handlers
   - Optimize re-renders in model lists

3. **Error Handling**
   - Implement proper error boundary (when React 19 + OpenTUI compatibility resolved)
   - Add error recovery mechanisms
   - Improve error messages with actionable suggestions

### Medium Priority

4. **Animation Implementation**

   - Use existing animation hooks or remove unused code
   - Add loading state animations
   - Add transition animations between screens
   - Add progress animations for deployments

5. **Accessibility**

   - Add screen reader support
   - Improve keyboard navigation hints
   - Add help/documentation screen

6. **Configuration**
   - Add config validation on load
   - Add config backup/restore
   - Add config export/import

### Low Priority

7. **UI Polish**

   - Add more visual feedback for actions
   - Improve color contrast
   - Add custom ASCII art branding
   - Add status indicators

8. **Developer Experience**

   - Add debug mode
   - Add verbose logging option
   - Add performance profiling

9. **Features**
   - Add deployment history
   - Add rollback functionality
   - Add multi-environment support
   - Add config diff viewer

## Technical Debt

### Code Quality

- Remove any remaining hardcoded colors
- Ensure all files are under 450 lines
- Add JSDoc comments to all public functions
- Standardize async/await patterns

### Architecture

- Consider state management library (if app grows)
- Consider routing library (if more screens added)
- Consider form library (for complex forms)

### Performance

- Implement virtual scrolling for large model lists
- Add request debouncing
- Add optimistic updates

## Notes

- Keep business logic separate from UI components
- Maintain backward compatibility for existing imports
- Follow the design system consistently
- Test on different terminal sizes
- Consider terminal color support variations
