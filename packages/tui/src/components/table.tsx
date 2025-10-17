import type { ReactNode } from "react";
import { useThemeColors } from "../styles/theme-system";

export interface ColumnStyle {
	/** Fixed width in characters (undefined = flexible) */
	width?: number;
	/** Text alignment (default: flex-start) */
	align?: "flex-start" | "flex-end" | "center";
	/** Truncate with … if too long (default: true) */
	truncate?: boolean;
	/** Text color (can be overridden by cell function) */
	fg?: string;
}

export interface Column<T> {
	/** Unique identifier for the column */
	id: string;
	/** Column header - can be string or function returning JSX */
	label?: string | (() => ReactNode);
	/** Column style */
	style?: ColumnStyle;
	/** Cell render function - returns JSX element for the cell */
	cell: (item: T, isSelected: boolean) => ReactNode;
}

/**
 * Truncate text to fit within width, adding … if needed
 */
export function truncateText(text: string, width?: number): string {
	if (!width || width === 0) return text; // Flexible column, don't truncate
	if (text.length <= width) return text;
	if (width < 3) return text.slice(0, width);
	return `${text.slice(0, width - 3)}…`;
}

export interface TableProps<T> {
	columns: Column<T>[];
	data: T[];
	selectedIndex?: number;
	renderSelectionIndicator?: (isSelected: boolean) => ReactNode;
	/** Optional virtualization - determines which rows to render */
	isItemVisible?: (index: number) => boolean;
	getItemKey: (item: T, index: number) => string;
	/** Header text color */
	headerForegroundColor?: string;
}

/**
 * Optimized table component with row-first rendering
 *
 * Features:
 * - Flexible/fixed column widths
 * - Custom cell rendering
 * - Optional virtualization support
 * - Selection indicators
 * - Responsive column hiding
 *
 * @example
 * ```tsx
 * const columns: Column<User>[] = [
 *   {
 *     id: 'name',
 *     label: 'Name',
 *     style: { width: 20 },
 *     cell: (user) => <text>{user.name}</text>
 *   },
 *   {
 *     id: 'email',
 *     label: 'Email',
 *     style: { width: 30 },
 *     cell: (user) => <text>{user.email}</text>
 *   }
 * ];
 *
 * <Table
 *   columns={columns}
 *   data={users}
 *   selectedIndex={selectedIndex}
 *   getItemKey={(user, i) => user.id}
 *   renderSelectionIndicator={(selected) => (
 *     <text>{selected ? '▶' : ' '}</text>
 *   )}
 * />
 * ```
 */
export function Table<T>({
	columns,
	data,
	selectedIndex,
	renderSelectionIndicator,
	isItemVisible,
	getItemKey,
	headerForegroundColor,
}: TableProps<T>): ReactNode {
	const colors = useThemeColors();
	const defaultHeaderColor = headerForegroundColor ?? colors.text.secondary;

	// If no isItemVisible provided, all items are visible
	const itemVisible = isItemVisible ?? (() => true);

	return (
		<scrollbox flexGrow={1} style={{ flexDirection: "column" }}>
			<box style={{ flexDirection: "column", gap: 0 }}>
				{/* Header row */}
				<box style={{ flexDirection: "row", gap: 0, paddingBottom: 1 }}>
					{/* Selection indicator header */}
					{renderSelectionIndicator && (
						<box style={{ width: 2, flexShrink: 0 }}>
							<text fg={defaultHeaderColor}>{"  "}</text>
						</box>
					)}

					{/* Column headers */}
					{columns.map((col) => (
						<box 
							key={`header-${col.id}`} 
							style={{ 
								width: col.style?.width, 
								flexShrink: col.style?.width ? 0 : 1,
								flexGrow: col.style?.width ? 0 : 1,
								paddingRight: 1
							}}
						>
							{typeof col.label === "string" && (
								<text
									fg={defaultHeaderColor}
									style={{
										justifyContent: col.style?.align || "flex-start",
									}}
								>
									{col.style?.width ? truncateText(col.label, col.style.width - 1) : col.label}
								</text>
							)}
							{typeof col.label === "function" && col.label()}
							{!col.label && <text> </text>}
						</box>
					))}
				</box>

				{/* Data rows - only render visible items */}
				{data.map((item, i) => {
					// Skip invisible items early - only check once per row
					if (!itemVisible(i)) return null;

					const isSelected = i === selectedIndex;
					const rowKey = getItemKey(item, i);

					return (
						<box key={rowKey} style={{ flexDirection: "row", gap: 0 }}>
							{/* Selection indicator */}
							{renderSelectionIndicator && (
								<box style={{ width: 2, flexShrink: 0 }}>
									{renderSelectionIndicator(isSelected)}
								</box>
							)}

							{/* Data cells */}
							{columns.map((col) => (
								<box 
									key={`${col.id}-${rowKey}`} 
									style={{ 
										width: col.style?.width,
										flexShrink: col.style?.width ? 0 : 1,
										flexGrow: col.style?.width ? 0 : 1,
										paddingRight: 1,
										justifyContent: col.style?.align || "flex-start"
									}}
								>
									{col.cell(item, isSelected)}
								</box>
							))}
						</box>
					);
				})}
			</box>
		</scrollbox>
	);
}
