import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import type { ReactNode } from "react";
import { useState } from "react";
import { useComponentStyles } from "../styles/theme-system";

export interface AccordionItemProps {
	/**
	 * Unique identifier for the accordion item
	 */
	id: string;
	/**
	 * Title/header of the accordion item
	 */
	title: string | ReactNode;
	/**
	 * Content to display when expanded
	 */
	children: ReactNode;
	/**
	 * Whether this item is initially open
	 * @default false
	 */
	defaultOpen?: boolean;
	/**
	 * Controlled open state
	 */
	isOpen?: boolean;
	/**
	 * Callback when open state changes
	 */
	onOpenChange?: (isOpen: boolean) => void;
	/**
	 * Whether this accordion item is focused
	 * @default false
	 */
	focused?: boolean;
	/**
	 * Custom icon when expanded
	 * @default "▼"
	 */
	expandedIcon?: string;
	/**
	 * Custom icon when collapsed
	 * @default "▶"
	 */
	collapsedIcon?: string;
	/**
	 * Indent level for nested accordions
	 * @default 0
	 */
	indentLevel?: number;
	/**
	 * Disable interaction
	 * @default false
	 */
	disabled?: boolean;
}

/**
 * AccordionItem component - Single collapsible section.
 * Can be controlled or uncontrolled.
 */
export function AccordionItem({
	id,
	title,
	children,
	defaultOpen = false,
	isOpen: controlledIsOpen,
	onOpenChange,
	focused = false,
	expandedIcon = "▼",
	collapsedIcon = "▶",
	indentLevel = 0,
	disabled = false,
}: AccordionItemProps): ReactNode {
	const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
	const componentStyles = useComponentStyles();

	const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

	const handleToggle = () => {
		if (disabled) return;
		const newState = !isOpen;
		if (controlledIsOpen === undefined) {
			setInternalIsOpen(newState);
		}
		onOpenChange?.(newState);
	};

	useKeyboard((evt) => {
		if (!focused || disabled) return;
		if (evt.name === "return" || evt.name === "space") {
			handleToggle();
		}
	});

	const icon = isOpen ? expandedIcon : collapsedIcon;
	const indent = indentLevel * 2;

	const headerBgColor = focused
		? componentStyles.accordion.header.focusBackgroundColor
		: componentStyles.accordion.header.backgroundColor;

	const headerTextColor = focused
		? componentStyles.accordion.header.focusTextColor
		: componentStyles.accordion.header.textColor;

	return (
		<box
			style={{
				flexDirection: "column",
			}}
		>
			{/* Header */}
			<box
				style={{
					flexDirection: "row",
					alignItems: "center",
					backgroundColor: headerBgColor,
					paddingLeft: indent + 1,
					paddingRight: 1,
					gap: 1,
				}}
				onMouseDown={handleToggle}
			>
				<text
					fg={componentStyles.accordion.icon.color}
					attributes={TextAttributes.BOLD}
					selectable={false}
				>
					{icon}
				</text>
				{typeof title === "string" ? (
					<text
						fg={headerTextColor}
						attributes={disabled ? TextAttributes.DIM : undefined}
						selectable={false}
					>
						{title}
					</text>
				) : (
					title
				)}
			</box>

			{/* Content */}
			{isOpen && (
				<box
					style={{
						flexDirection: "column",
						paddingLeft: indent + componentStyles.accordion.content.paddingLeft,
						backgroundColor: componentStyles.accordion.content.backgroundColor,
					}}
				>
					{children}
				</box>
			)}
		</box>
	);
}

export interface AccordionProps {
	/**
	 * Accordion items
	 */
	children: ReactNode;
	/**
	 * Allow multiple items to be open at once
	 * @default false
	 */
	multiple?: boolean;
	/**
	 * Default open item IDs
	 */
	defaultOpenIds?: string[];
	/**
	 * Controlled open item IDs
	 */
	openIds?: string[];
	/**
	 * Callback when open items change
	 */
	onOpenChange?: (openIds: string[]) => void;
}

/**
 * Accordion component - Container for multiple collapsible sections.
 * Supports single or multiple open items.
 */
export function Accordion({
	children,
	multiple = false,
	defaultOpenIds = [],
	openIds: controlledOpenIds,
	onOpenChange,
}: AccordionProps): ReactNode {
	const [internalOpenIds, setInternalOpenIds] = useState<string[]>(defaultOpenIds);

	const openIds = controlledOpenIds !== undefined ? controlledOpenIds : internalOpenIds;

	const handleItemOpenChange = (itemId: string, isOpen: boolean) => {
		let newOpenIds: string[];

		if (multiple) {
			newOpenIds = isOpen ? [...openIds, itemId] : openIds.filter((id) => id !== itemId);
		} else {
			newOpenIds = isOpen ? [itemId] : [];
		}

		if (controlledOpenIds === undefined) {
			setInternalOpenIds(newOpenIds);
		}
		onOpenChange?.(newOpenIds);
	};

	return (
		<box
			style={{
				flexDirection: "column",
			}}
		>
			{children}
		</box>
	);
}
