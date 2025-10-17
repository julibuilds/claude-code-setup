import { useTerminalDimensions } from "@opentui/react";
import type { ReactNode } from "react";
import { useOverflowDetection } from "../hooks/use-overflow-detection";
import { useComponentStyles, useThemeColors } from "../styles/theme-system";

export type ModalSize = "small" | "medium" | "large";

export interface ModalProps {
	title: string;
	children: ReactNode;
	onClose: () => void;
	/**
	 * Modal size variant
	 * @default "medium"
	 */
	size?: ModalSize;
	/**
	 * Enable smart overflow detection and scrolling
	 * @default true
	 */
	scrollable?: boolean;
	/**
	 * Custom footer text
	 * @default "Press ESC to close"
	 */
	footerText?: string;
}

const sizeConfig = {
	small: { width: "50%", maxWidth: 50 },
	medium: { width: "70%", maxWidth: 70 },
	large: { width: "90%", maxWidth: 120 },
} as const;

/**
 * Modal component with smart overflow detection
 *
 * Features:
 * - Size variants (small/medium/large)
 * - Automatic overflow detection
 * - Conditional scrollbox wrapper
 * - Semi-transparent backdrop
 *
 * @example
 * ```tsx
 * <Modal
 *   title="Settings"
 *   onClose={() => setShowModal(false)}
 *   size="medium"
 *   scrollable={true}
 * >
 *   <text>Modal content here</text>
 * </Modal>
 * ```
 */
export function Modal({
	title,
	children,
	onClose,
	size = "medium",
	scrollable = true,
	footerText,
}: ModalProps) {
	const maxContentHeight = useTerminalDimensions().height - 8;
	const colors = useThemeColors();
	const styles = useComponentStyles();
	const { width, maxWidth } = sizeConfig[size];
	const { hasOverflow, measured, measurementRef } = useOverflowDetection(maxContentHeight);

	// Prevent modal content clicks from closing the modal
	const handleContentClick = (event: { stopPropagation: () => void }) => {
		event.stopPropagation();
	};

	const defaultFooterText =
		footerText ?? `Press ESC to close${scrollable && hasOverflow ? " • ↑↓ to scroll" : ""}`;

	return (
		<box
			style={{
				position: "absolute",
				top: 0,
				left: 0,
				width: "100%",
				height: "100%",
				justifyContent: "center",
				alignItems: "center",
			}}
			backgroundColor={colors.special.transparent}
			onMouseDown={onClose}
		>
			{/* Modal content box */}
			<box
				onMouseDown={handleContentClick}
				style={{
					flexDirection: "column",
					width,
					maxWidth,
					maxHeight: "90%",
					minHeight: 10,
					margin: 2,
					padding: 2,
					paddingTop: 1,
					paddingBottom: 1,
				}}
				border={true}
				borderStyle="rounded"
				borderColor={colors.border.default}
				backgroundColor={styles.dialog.container.backgroundColor}
				title={` ${title} `}
				titleAlignment="center"
			>
				{/* Content area - conditionally use scrollbox only if content overflows */}
				{scrollable ? (
					<>
						{/* Hidden measurement box to determine natural content height */}
						{!measured && (
							<box
								ref={measurementRef}
								style={{
									position: "absolute",
									left: -9999,
									flexDirection: "column",
								}}
							>
								{children}
							</box>
						)}

						{/* Render actual content with scrollbox if overflow detected */}
						{measured && hasOverflow ? (
							<scrollbox
								style={{
									maxHeight: maxContentHeight,
									flexShrink: 1,
									minHeight: 0,
								}}
								scrollY={true}
								focused={true}
							>
								{children}
							</scrollbox>
						) : measured ? (
							<box style={{ flexDirection: "column" }}>{children}</box>
						) : null}
					</>
				) : (
					<box style={{ flexDirection: "column" }}>{children}</box>
				)}

				{/* Fixed footer */}
				<text fg={colors.text.muted} style={{ marginTop: 1, flexShrink: 0 }}>
					{defaultFooterText}
				</text>
			</box>
		</box>
	);
}
