/**
 * Global error handlers for production TUI applications
 * Based on MCP Gateway example
 *
 * Sets up process-level error handlers to catch uncaught exceptions
 * and unhandled promise rejections.
 */

export interface ErrorHandlerOptions {
	/** Custom error handler function */
	onError?: (error: Error | unknown, type: "exception" | "rejection") => void;
	/** Whether to exit process on uncaught exception (default: true) */
	exitOnException?: boolean;
	/** Exit code for uncaught exceptions (default: 1) */
	exitCode?: number;
	/** Whether to log errors to console (default: true) */
	logToConsole?: boolean;
}

/**
 * Setup global error handlers for the process
 *
 * @example
 * ```tsx
 * import { setupErrorHandlers } from '@repo/tui';
 *
 * setupErrorHandlers({
 *   onError: (error, type) => {
 *     logger.error(`${type} error:`, error);
 *   },
 * });
 * ```
 */
export function setupErrorHandlers(options: ErrorHandlerOptions = {}): () => void {
	const { onError, exitOnException = true, exitCode = 1, logToConsole = true } = options;

	const handleUncaughtException = (error: Error) => {
		if (logToConsole) {
			console.error("Uncaught Exception:", {
				error: error.toString(),
				message: error.message,
				stack: error.stack,
				timestamp: new Date().toISOString(),
			});
		}

		onError?.(error, "exception");

		if (exitOnException) {
			process.exit(exitCode);
		}
	};

	const handleUnhandledRejection = (reason: unknown, promise: Promise<any>) => {
		if (logToConsole) {
			console.error("Unhandled Promise Rejection:", {
				reason: String(reason),
				promise: String(promise),
				timestamp: new Date().toISOString(),
			});
		}

		onError?.(reason, "rejection");
	};

	// Register handlers
	process.on("uncaughtException", handleUncaughtException);
	process.on("unhandledRejection", handleUnhandledRejection);

	// Return cleanup function
	return () => {
		process.off("uncaughtException", handleUncaughtException);
		process.off("unhandledRejection", handleUnhandledRejection);
	};
}

/**
 * Create a safe wrapper for async functions that catches errors
 *
 * @example
 * ```tsx
 * const safeHandler = wrapAsync(async () => {
 *   await somethingRisky();
 * }, (error) => {
 *   logger.error('Operation failed:', error);
 * });
 *
 * await safeHandler();
 * ```
 */
export function wrapAsync<T extends (...args: any[]) => Promise<any>>(
	fn: T,
	onError?: (error: Error) => void
): T {
	return (async (...args: Parameters<T>) => {
		try {
			return await fn(...args);
		} catch (error) {
			if (onError) {
				onError(error as Error);
			} else {
				console.error("Async error:", error);
			}
		}
	}) as T;
}

/**
 * Create a safe wrapper for sync functions that catches errors
 */
export function wrapSync<T extends (...args: any[]) => any>(
	fn: T,
	onError?: (error: Error) => void
): T {
	return ((...args: Parameters<T>) => {
		try {
			return fn(...args);
		} catch (error) {
			if (onError) {
				onError(error as Error);
			} else {
				console.error("Sync error:", error);
			}
		}
	}) as T;
}

/**
 * Error logger that formats errors consistently
 */
export class ErrorLogger {
	constructor(private prefix = "TUI") {}

	log(message: string, error: Error | unknown): void {
		const timestamp = new Date().toISOString();
		const errorDetails =
			error instanceof Error
				? {
						name: error.name,
						message: error.message,
						stack: error.stack,
					}
				: { value: String(error) };

		console.error(`[${this.prefix}] ${timestamp} - ${message}`, errorDetails);
	}

	exception(error: Error): void {
		this.log("Uncaught Exception", error);
	}

	rejection(reason: unknown): void {
		this.log("Unhandled Rejection", reason);
	}

	fatal(message: string, error: Error | unknown): never {
		this.log(`FATAL: ${message}`, error);
		process.exit(1);
	}
}

/**
 * Create a production-ready error handler setup
 *
 * @example
 * ```tsx
 * const cleanup = setupProductionErrorHandling({
 *   appName: 'my-tui-app',
 *   logFile: './errors.log',
 * });
 *
 * // Later, when shutting down:
 * cleanup();
 * ```
 */
export function setupProductionErrorHandling(config: {
	appName?: string;
	logFile?: string;
	onError?: (error: Error | unknown, type: "exception" | "rejection") => void;
}): () => void {
	const logger = new ErrorLogger(config.appName || "TUI");

	return setupErrorHandlers({
		onError: (error, type) => {
			if (type === "exception") {
				logger.exception(error as Error);
			} else {
				logger.rejection(error);
			}

			// Call custom handler if provided
			config.onError?.(error, type);

			// TODO: Write to log file if specified
			// This would require fs module and proper async handling
		},
		exitOnException: true,
		exitCode: 1,
		logToConsole: true,
	});
}
