import { TextAttributes } from "@opentui/core";
import type { ReactNode } from "react";
import { theme } from "../../design/theme";

interface ErrorBoundaryProps {
	children: ReactNode;
	/** Screen name for better error context */
	screenName?: string;
}

/**
 * Error boundary component to catch and handle React errors gracefully
 * Prevents entire app from crashing when a component throws an error
 * 
 * Note: For now, this is a simple wrapper. Full error boundary functionality
 * requires class components which have compatibility issues with React 19 + OpenTUI.
 * 
 * @example
 * ```tsx
 * <ErrorBoundary screenName="QuickConfig">
 *   <QuickConfig />
 * </ErrorBoundary>
 * ```
 */
export function ErrorBoundary({ children, screenName }: ErrorBoundaryProps) {
	// For now, just render children
	// TODO: Implement proper error boundary when React 19 + OpenTUI compatibility is resolved
	// or use a third-party error boundary library
	
	// Log screen name for debugging
	if (screenName && process.env.NODE_ENV === "development") {
		// Screen context available for debugging
	}
	
	return <>{children}</>;
}

/**
 * Error display component for manual error handling
 * Use this when you catch errors manually and want to display them
 */
export function ErrorDisplay({ error, screenName }: { error: Error; screenName?: string }) {
	return (
		<box
			style={{
				flexDirection: "column",
				padding: 4,
				width: "100%",
				height: "100%",
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<box
				style={{
					...theme.components.statusBoxError,
					width: 80,
					padding: 3,
				}}
			>
				<text
					style={{
						attributes: TextAttributes.BOLD,
						fg: theme.colors.error,
						marginBottom: 2,
					}}
				>
					✗ Application Error
				</text>

				{screenName && (
					<text
						style={{
							fg: theme.colors.text.primary,
							marginBottom: 2,
						}}
					>
						Screen: {screenName}
					</text>
				)}

				<text
					style={{
						fg: theme.colors.text.dim,
						marginBottom: 2,
					}}
				>
					An unexpected error occurred. The application has been stopped to prevent
					further issues.
				</text>

				<box
					style={{
						border: true,
						borderColor: theme.colors.text.veryDim,
						padding: 2,
						marginBottom: 2,
						backgroundColor: theme.colors.bg.mid,
					}}
				>
					<text style={{ fg: theme.colors.error }}>
						{error.message || "Unknown error"}
					</text>
				</box>

				<text
					style={{
						fg: theme.colors.text.dim,
						marginTop: 1,
					}}
				>
					Press ESC to exit or restart the application.
				</text>
			</box>
		</box>
	);
}
