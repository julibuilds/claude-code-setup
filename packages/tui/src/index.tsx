// ============================================================================
// Components
// ============================================================================

export {
	Accordion,
	AccordionItem,
	type AccordionItemProps,
	type AccordionProps,
} from "./components/accordion";
export { Badge, type BadgeProps, type BadgeVariant } from "./components/badge";
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
export { Dialog, DialogProvider, Overlay, type OverlayProps, useDialog } from "./components/dialog";
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
export { DraggableBox, type DraggableBoxProps } from "./components/draggable-box";
export { Dropdown } from "./components/dropdown";
export { ErrorBox, type ErrorBoxProps } from "./components/error-box";
export {
	type FileIcon,
	Image,
	ImageMask,
	type ImageProps,
	type ImageSource,
} from "./components/image";
export { Kbd, type KbdProps } from "./components/kbd";
export { List } from "./components/list";
export { LoadingBar, Progress, type ProgressProps } from "./components/loading-bar";
export { Modal, type ModalProps, type ModalSize } from "./components/modal";
export { ProgressBar, type ProgressBarProps } from "./components/progress-bar";
export { Select, type SelectOption, type SelectProps } from "./components/select";
export { Separator, type SeparatorProps } from "./components/separator";
export { Slider, type SliderProps } from "./components/slider";
export { Spinner, type SpinnerProps } from "./components/spinner";
export { StatusBox, type StatusBoxProps, type StatusType } from "./components/status-box";
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
export { Toast, type ToastMessage, type ToastProps, type ToastType } from "./components/toast";
export { Toggle, type ToggleProps } from "./components/toggle";

// ============================================================================
// Hooks
// ============================================================================

export {
	type ActivityLogScrollOptions,
	type ActivityLogScrollState,
	useActivityLogScroll,
} from "./hooks/use-activity-log-scroll";
export { useAnimationFrame } from "./hooks/use-animation-frame";
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
export { type FrameCallbackOptions, useFrameCallback } from "./hooks/use-frame-callback";
export { useId } from "./hooks/use-id";
// Experimental mouse support
export { useClickable, useMouse } from "./hooks/use-mouse";
export { useOverflowDetection } from "./hooks/use-overflow-detection";
export { useResponsive } from "./hooks/use-responsive";
export {
	type SelectionRange,
	TextSelectionProvider,
	useTextSelection,
} from "./hooks/use-text-selection";

// ============================================================================
// Utilities
// ============================================================================

// Animation utilities
export {
	Animation,
	type AnimationOptions,
	animateProperty,
	createAnimation,
	createSpring,
	createTimeline,
	type EasingFunction,
	easingFunctions,
	getEasingFunction,
	interpolate,
	interpolateColor,
	SpringAnimation,
	type SpringOptions,
	Timeline,
} from "./utils/animation";
export { debounce } from "./utils/debounce";
export { createDescendants, type DescendantContextType } from "./utils/descendants";
export {
	ErrorBoundary,
	type ErrorBoundaryProps,
} from "./utils/error-boundary";
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
// Styled text utilities
export {
	bg,
	bgBlack,
	bgBlue,
	bgCyan,
	bgGray,
	bgGreen,
	bgMagenta,
	bgRed,
	bgWhite,
	bgYellow,
	black,
	blink,
	blue,
	bold,
	box,
	boxText,
	combine,
	criticalText,
	cyan,
	dim,
	emphasisText,
	errorText,
	fg,
	gradient,
	gray,
	green,
	highlightText,
	ifElse,
	infoText,
	italic,
	linkText,
	magenta,
	mutedText,
	pad,
	pipe,
	rainbow,
	red,
	reverse,
	strikethrough,
	stripAnsi,
	subtleText,
	successText,
	type TextStyleFn,
	truncate,
	underline,
	visibleLength,
	warningText,
	when,
	white,
	yellow,
} from "./utils/styled-text";
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
export { darkTheme, lightTheme, neonTheme } from "./styles/themes";

// ============================================================================
// Types
// ============================================================================

export type { ThemeColors } from "./types";

// ============================================================================
// Re-export OpenTUI essentials for convenience
// ============================================================================

export { measureText, TextAttributes } from "@opentui/core";
export { render, useKeyboard, useRenderer, useTerminalDimensions } from "@opentui/react";
