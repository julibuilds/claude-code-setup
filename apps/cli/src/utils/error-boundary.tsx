import React from "react";

export interface ErrorBoundaryProps {
	children: React.ReactNode;
	onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
	fallback?: (error: Error, reset: () => void) => React.ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
	errorInfo: React.ErrorInfo | null;
}

/**
 * Production-ready error boundary for TUI applications
 * Catches React errors and displays them gracefully with clipboard integration
 *
 * @example
 * ```tsx
 * <ErrorBoundary onError={(error) => logger.error(error)}>
 *   <App />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null, errorInfo: null };

		// Bind methods
		this.componentDidCatch = this.componentDidCatch.bind(this);
		this.reset = this.reset.bind(this);
	}

	static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
		return { hasError: true, error };
	}

	override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
		// Store error info in state
		this.setState({ errorInfo });

		// Call custom error handler if provided
		this.props.onError?.(error, errorInfo);

		console.error("Error caught by boundary:", error);
		console.error("Component stack:", errorInfo.componentStack);

		// Copy formatted stack trace to clipboard
		const timestamp = new Date().toISOString();
		const stackTrace = [
			`Error: ${error.name}`,
			`Message: ${error.message}`,
			`Time: ${timestamp}`,
			"",
			"Stack trace:",
			error.stack || "(no stack trace available)",
			"",
			"Component stack:",
			errorInfo.componentStack || "(no component stack available)",
		].join("\n");

		try {
			const { execSync } = require("node:child_process");
			execSync("pbcopy", { input: stackTrace });
		} catch (copyError) {
			console.error("Failed to copy to clipboard:", copyError);
		}
	}

	reset(): void {
		this.setState({ hasError: false, error: null, errorInfo: null });
	}

	override render(): any {
		if (this.state.hasError && this.state.error) {
			// Use custom fallback if provided
			if (this.props.fallback) {
				return this.props.fallback(this.state.error, this.reset);
			}

			// Default error display
			return (
				<box
					style={{
						flexDirection: "column",
						padding: 2,
						gap: 1,
					}}
				>
					<box style={{ flexDirection: "column", gap: 0 }}>
						<text fg="red">
							<strong>⚠ Error Occurred</strong>
						</text>
						<text fg="white">{this.state.error.message}</text>
					</box>

					<box style={{ flexDirection: "column", gap: 0 }}>
						<text fg="brightBlack">Stack trace (copied to clipboard):</text>
						<text fg="brightBlack">
							{this.state.error.stack?.split("\n").slice(0, 5).join("\n")}
						</text>
					</box>

					{this.state.errorInfo?.componentStack && (
						<box style={{ flexDirection: "column", gap: 0 }}>
							<text fg="brightBlack">Component stack:</text>
							<text fg="brightBlack">
								{this.state.errorInfo.componentStack?.split("\n").slice(0, 3).join("\n")}
							</text>
						</box>
					)}

					<text fg="yellow">Press Ctrl+C to exit or check your clipboard for full details</text>
				</box>
			);
		}

		return this.props.children;
	}
}
