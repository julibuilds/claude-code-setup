import { useEffect } from "react";
import { useComponentStyles, useThemeColors } from "../styles/theme-system";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
	type: ToastType;
	message: string;
}

export interface ToastProps {
	toast: ToastMessage | null;
	onDismiss: () => void;
	/**
	 * Auto-dismiss timeout in milliseconds
	 * @default 2000
	 */
	timeout?: number;
	/**
	 * Position of the toast
	 * @default "top-right"
	 */
	position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center";
}

/**
 * Toast notification component with auto-dismiss
 *
 * Features:
 * - Auto-dismiss after timeout (default 2s)
 * - Type variants (success/error/info/warning)
 * - Absolute positioning
 * - Icons per type
 *
 * @example
 * ```tsx
 * const [toast, setToast] = useState<ToastMessage | null>(null);
 *
 * <Toast
 *   toast={toast}
 *   onDismiss={() => setToast(null)}
 * />
 *
 * // Show a toast
 * setToast({ type: 'success', message: 'Operation completed!' });
 * ```
 */
export function Toast({ toast, onDismiss, timeout = 2000, position = "top-right" }: ToastProps) {
	const colors = useThemeColors();
	const styles = useComponentStyles();

	// Auto-dismiss after timeout
	useEffect(() => {
		if (toast) {
			const timer = setTimeout(() => {
				onDismiss();
			}, timeout);
			return () => clearTimeout(timer);
		}
	}, [toast, onDismiss, timeout]);

	if (!toast) return null;

	const getIcon = () => {
		switch (toast.type) {
			case "success":
				return "✓";
			case "error":
				return "✗";
			case "warning":
				return "⚠";
			case "info":
				return "ℹ";
			default:
				return "";
		}
	};

	const getColor = () => {
		switch (toast.type) {
			case "success":
				return colors.status.success;
			case "error":
				return colors.status.error;
			case "warning":
				return colors.status.warning;
			case "info":
				return colors.status.info;
			default:
				return colors.text.primary;
		}
	};

	const getPosition = () => {
		switch (position) {
			case "top-left":
				return { top: 2, left: 2 };
			case "top-right":
				return { top: 2, right: 2 };
			case "bottom-left":
				return { bottom: 2, left: 2 };
			case "bottom-right":
				return { bottom: 2, right: 2 };
			case "top-center":
				return { top: 2, left: 2 }; // Simplified for OpenTUI compatibility
			default:
				return { top: 2, right: 2 };
		}
	};

	return (
		<box
			style={{
				position: "absolute",
				...getPosition(),
				padding: 1,
				border: true,
				borderColor: getColor(),
				backgroundColor: styles.panel.backgroundColor,
				minWidth: 30,
				maxWidth: 60,
			}}
		>
			<box style={{ flexDirection: "row", gap: 1 }}>
				<text fg={getColor()}>{getIcon()}</text>
				<text fg={colors.text.primary}>{toast.message}</text>
			</box>
		</box>
	);
}
