// ============================================================================
// Components
// ============================================================================

export {
  Accordion,
  AccordionItem,
  type AccordionItemProps,
  type AccordionProps,
} from "./components/accordion";
export { Button, type ButtonProps } from "./components/button";
export { Card, type CardProps } from "./components/card";
export { Checkbox, type CheckboxProps } from "./components/checkbox";
export {
  CodeBlock,
  type CodeBlockProps,
  CodeHighlight,
  type CodeHighlightProps,
} from "./components/code-highlight";
export {
  type CommandGroup,
  type CommandItem,
  CommandMenu,
  type CommandMenuProps,
} from "./components/command-menu";
export {
  Dialog,
  DialogProvider,
  Overlay,
  type OverlayProps,
  useDialog,
} from "./components/dialog";
export { DiffView, type DiffViewProps } from "./components/diff-view";
export {
  areLinesRelated,
  calculateSimilarity,
  diffWords,
  findLinePairs,
  type LinePair,
  levenshteinDistance,
  type WordDiffPart,
} from "./components/diff-view/word-diff";
export { Dropdown } from "./components/dropdown";
export {
  type FileIcon,
  Image,
  ImageMask,
  type ImageProps,
  type ImageSource,
} from "./components/image";
export { Kbd, type KbdProps } from "./components/kbd";
export {
  BentoGrid,
  type BentoGridItem,
  type BentoGridProps,
  Container,
  type ContainerProps,
  Grid,
  type GridProps,
  SplitView,
  type SplitViewProps,
  Stack,
  type StackProps,
} from "./components/layouts";
export { List } from "./components/list";
export {
  LoadingBar,
  Progress,
  type ProgressProps,
} from "./components/loading-bar";
export { Modal, type ModalProps, type ModalSize } from "./components/modal";
// Note: ScrollBox is a simple wrapper, consumers can import from "@opentui/react" directly
// or use the scrollbox component if needed
export * from "./components/scrollbox";
export {
  Select,
  type SelectOption,
  type SelectProps,
} from "./components/select";
export { Separator, type SeparatorProps } from "./components/separator";
export { Slider, type SliderProps } from "./components/slider";
export { Switch, type SwitchProps } from "./components/switch";
export {
  type Column,
  type ColumnStyle,
  Table,
  type TableProps,
  truncateText,
} from "./components/table";
export { type Tab, Tabs, type TabsProps } from "./components/tabs";
export { TextInput, type TextInputProps } from "./components/text-input";
export {
  Toast,
  type ToastMessage,
  type ToastProps,
  type ToastType,
} from "./components/toast";
export { Toggle, type ToggleProps } from "./components/toggle";

// ============================================================================
// Hooks
// ============================================================================

export {
  type ActivityLogScrollOptions,
  type ActivityLogScrollState,
  useActivityLogScroll,
} from "./hooks/use-activity-log-scroll";
export { useDebugConsole } from "./hooks/use-debug-console";
export { useEvent } from "./hooks/use-event";
export {
  type Action,
  type ActionHandlerMap,
  type EventHandler,
  type EventSubscription,
  useActionEvents,
  useExternalEvent,
  useExternalEvents,
} from "./hooks/use-external-events";
export { useId } from "./hooks/use-id";
// Experimental mouse support
export { useClickable, useMouse } from "./hooks/use-mouse";
export { type PasteHandler, useOpentuiPaste } from "./hooks/use-opentui-paste";
export { useOverflowDetection } from "./hooks/use-overflow-detection";
export { useResponsive } from "./hooks/use-responsive";

// ============================================================================
// Utilities
// ============================================================================

export { debounce } from "./utils/debounce";
export {
  createDescendants,
  type DescendantContextType,
} from "./utils/descendants";
export { ErrorBoundary, type ErrorBoundaryProps } from "./utils/error-boundary";
export {
  type ErrorHandlerOptions,
  ErrorLogger,
  setupErrorHandlers,
  setupProductionErrorHandling,
  wrapAsync,
  wrapSync,
} from "./utils/error-handlers";
export { InFocus, useIsInFocus } from "./utils/focus-context";
export {
  FILE_ICONS,
  FOLDER_ICONS,
  getFileIcon,
  getFolderIcon,
  getSpecialFolderIcon,
  SPECIAL_FOLDER_ICONS,
} from "./utils/icons";
export { createLogger, type LogConfig, Logger, LogLevel } from "./utils/logger";
export {
  NavigationContainer,
  NavigationProvider,
  type NavigationStackItem,
  useNavigation,
  useNavigationPending,
} from "./utils/navigation";
export {
  COMMON_GLOBAL_SHORTCUTS,
  COMMON_MODAL_SHORTCUTS,
  createShortcutManager,
  type Shortcut,
  type ShortcutContext,
  ShortcutManager,
  type ShortcutRegistry,
} from "./utils/shortcuts";
export {
  createShutdownHandler,
  getExitHandler,
  type Signal,
  type SignalHandlerOptions,
  setExitHandler,
  setupProductionSignalHandlers,
  setupSignalHandlers,
  triggerExit,
} from "./utils/signal-handlers";
export {
  createDefaultHighlighter,
  DEFAULT_LANGUAGES,
  detectLanguage,
} from "./utils/syntax-highlight";
export {
  type BuildTreeOptions,
  buildTreeFromEdges,
  calculateTreeDepth,
  detectCycles,
  type Edge,
  filterTree,
  findLeafNodes,
  findRootNodes,
  flattenTree as flattenTreeNodes,
  mapTree,
  type TreeNode,
} from "./utils/tree-builder";

// ============================================================================
// Theme System
// ============================================================================

// Color scales for data visualization
export {
  adjustBrightness,
  colorSchemes,
  createCategoricalScale,
  createCustomScheme,
  createDivergingScale,
  createLayerColorScale,
  createSequentialScale,
  interpolateColor,
} from "./styles/color-scales";
export {
  type ColorPalette,
  type ComponentStyles,
  createCustomTheme,
  defaultThemes,
  mergeThemes,
  type ThemeContextValue,
  type ThemeInterface,
  ThemeProvider,
  useComponentStyles,
  useTheme,
  useThemeColors,
} from "./styles/theme-system";

// ============================================================================
// Types
// ============================================================================

export type { ThemeColors } from "./types";

// ============================================================================
// Re-export OpenTUI essentials for convenience
// ============================================================================

export { measureText, TextAttributes } from "@opentui/core";
export {
  render,
  useKeyboard,
  useRenderer,
  useTerminalDimensions,
} from "@opentui/react";
