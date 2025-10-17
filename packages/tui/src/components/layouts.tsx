import { useTerminalDimensions } from "@opentui/react";
import type { ReactNode } from "react";

// ============================================================================
// Grid Layout
// ============================================================================

export interface GridProps {
	children: ReactNode;
	columns?: number;
	gap?: number;
	responsive?: boolean;
	minColumnWidth?: number;
}

/**
 * Grid component - Responsive grid layout.
 * Automatically adjusts columns based on terminal width when responsive is true.
 */
export function Grid({
	children,
	columns = 3,
	gap = 1,
	responsive = true,
	minColumnWidth = 20,
}: GridProps): ReactNode {
	const { width } = useTerminalDimensions();

	// Calculate actual columns based on available width
	const actualColumns = responsive
		? Math.max(1, Math.floor(width / (minColumnWidth + gap)))
		: columns;

	return (
		<box
			style={{
				flexDirection: "column",
				gap,
			}}
		>
			{Array.isArray(children) &&
				Array.from({ length: Math.ceil(children.length / actualColumns) }).map((_, rowIndex) => (
					<box
						key={rowIndex}
						style={{
							flexDirection: "row",
							gap,
						}}
					>
						{children
							.slice(rowIndex * actualColumns, (rowIndex + 1) * actualColumns)
							.map((child, colIndex) => (
								<box
									key={colIndex}
									style={{
										flexGrow: 1,
										flexBasis: 0,
									}}
								>
									{child}
								</box>
							))}
					</box>
				))}
		</box>
	);
}

// ============================================================================
// SplitView Layout
// ============================================================================

export interface SplitViewProps {
	left: ReactNode;
	right: ReactNode;
	orientation?: "horizontal" | "vertical";
	leftSize?: number;
	rightSize?: number;
	gap?: number;
	responsive?: boolean;
	breakpoint?: number;
}

/**
 * SplitView component - Two-pane layout with horizontal or vertical split.
 * Can automatically switch to vertical layout on narrow terminals.
 */
export function SplitView({
	left,
	right,
	orientation = "horizontal",
	leftSize = 1,
	rightSize = 1,
	gap = 0,
	responsive = true,
	breakpoint = 60,
}: SplitViewProps): ReactNode {
	const { width } = useTerminalDimensions();

	// Switch to vertical on narrow terminals if responsive
	const actualOrientation =
		responsive && width < breakpoint && orientation === "horizontal" ? "vertical" : orientation;

	const isVertical = actualOrientation === "vertical";

	return (
		<box
			style={{
				flexDirection: isVertical ? "column" : "row",
				gap,
				height: "100%",
				width: "100%",
			}}
		>
			<box
				style={{
					flexGrow: leftSize,
					flexShrink: 1,
					flexBasis: 0,
				}}
			>
				{left}
			</box>
			<box
				style={{
					flexGrow: rightSize,
					flexShrink: 1,
					flexBasis: 0,
				}}
			>
				{right}
			</box>
		</box>
	);
}

// ============================================================================
// BentoGrid Layout
// ============================================================================

export interface BentoGridItem {
	content: ReactNode;
	colSpan?: number;
	rowSpan?: number;
}

export interface BentoGridProps {
	items: BentoGridItem[];
	columns?: number;
	gap?: number;
}

/**
 * BentoGrid component - Grid layout with items that can span multiple columns/rows.
 * Inspired by modern bento-box style layouts.
 */
export function BentoGrid({ items, columns = 3, gap = 1 }: BentoGridProps): ReactNode {
	// This is a simplified bento grid that arranges items in a flow
	// Full grid spanning would require more complex layout logic

	return (
		<box
			style={{
				flexDirection: "column",
				gap,
			}}
		>
			{items.map((item, index) => {
				const colSpan = item.colSpan || 1;
				const rowSpan = item.rowSpan || 1;

				return (
					<box
						key={index}
						style={{
							flexGrow: colSpan,
							flexShrink: 1,
							flexBasis: 0,
							minHeight: rowSpan * 10, // Approximate row height
						}}
					>
						{item.content}
					</box>
				);
			})}
		</box>
	);
}

// ============================================================================
// Stack Layout
// ============================================================================

export interface StackProps {
	children: ReactNode;
	direction?: "horizontal" | "vertical";
	gap?: number;
	align?: "start" | "center" | "end" | "stretch";
	justify?: "start" | "center" | "end" | "space-between" | "space-around";
}

/**
 * Stack component - Flexible stack layout with alignment and spacing options.
 */
export function Stack({
	children,
	direction = "vertical",
	gap = 0,
	align = "stretch",
	justify = "start",
}: StackProps): ReactNode {
	const alignMap = {
		start: "flex-start" as const,
		center: "center" as const,
		end: "flex-end" as const,
		stretch: "stretch" as const,
	};

	const justifyMap = {
		start: "flex-start" as const,
		center: "center" as const,
		end: "flex-end" as const,
		"space-between": "space-between" as const,
		"space-around": "space-around" as const,
	};

	return (
		<box
			style={{
				flexDirection: direction === "horizontal" ? "row" : "column",
				gap,
				alignItems: alignMap[align],
				justifyContent: justifyMap[justify],
			}}
		>
			{children}
		</box>
	);
}

// ============================================================================
// Container Layout
// ============================================================================

export interface ContainerProps {
	children: ReactNode;
	maxWidth?: number;
	center?: boolean;
	padding?: number;
}

/**
 * Container component - Constrains content width and optionally centers it.
 */
export function Container({
	children,
	maxWidth,
	center = false,
	padding = 0,
}: ContainerProps): ReactNode {
	const { width } = useTerminalDimensions();
	const actualWidth = maxWidth ? Math.min(maxWidth, width) : width;

	return (
		<box
			style={{
				width: actualWidth,
				padding,
				...(center ? { marginLeft: "auto", marginRight: "auto" } : {}),
			}}
		>
			{children}
		</box>
	);
}
