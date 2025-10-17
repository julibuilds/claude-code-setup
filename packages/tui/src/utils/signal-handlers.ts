/**
 * Signal handler utilities for graceful shutdown
 * Based on MCP Gateway example
 *
 * Handles SIGINT, SIGTERM, and other process signals for clean exits
 */

export type Signal = "SIGINT" | "SIGTERM" | "SIGHUP" | "SIGQUIT";

export interface SignalHandlerOptions {
	/** Custom cleanup function to run before exit */
	onExit?: () => void | Promise<void>;
	/** Signals to handle (default: ["SIGINT", "SIGTERM"]) */
	signals?: Signal[];
	/** Exit code (default: 0) */
	exitCode?: number;
	/** Whether to log signal received (default: true) */
	logSignals?: boolean;
	/** Timeout in ms for async cleanup (default: 5000) */
	cleanupTimeout?: number;
}

/**
 * Setup signal handlers for graceful shutdown
 *
 * @example
 * ```tsx
 * import { setupSignalHandlers } from '@repo/tui';
 *
 * const cleanup = setupSignalHandlers({
 *   onExit: async () => {
 *     await database.close();
 *     await server.stop();
 *   },
 * });
 *
 * // Later, to remove handlers:
 * cleanup();
 * ```
 */
export function setupSignalHandlers(options: SignalHandlerOptions = {}): () => void {
	const {
		onExit,
		signals = ["SIGINT", "SIGTERM"],
		exitCode = 0,
		logSignals = true,
		cleanupTimeout = 5000,
	} = options;

	const handleSignal = async (signal: Signal) => {
		if (logSignals) {
			console.log(`\nReceived ${signal}, shutting down gracefully...`);
		}

		try {
			// Call cleanup function with timeout
			if (onExit) {
				const result = onExit();

				// If it returns a promise, await it with timeout
				if (result && typeof result === "object" && "then" in result) {
					const timeoutPromise = new Promise<void>((_, reject) => {
						setTimeout(() => {
							reject(new Error(`Cleanup timeout after ${cleanupTimeout}ms`));
						}, cleanupTimeout);
					});

					await Promise.race([result, timeoutPromise]);
				}
			}

			process.exit(exitCode);
		} catch (error) {
			console.error("Error during cleanup:", error);
			process.exit(1);
		}
	};

	// Register handlers for each signal
	const handlers = new Map<Signal, () => void>();

	for (const signal of signals) {
		const handler = () => handleSignal(signal);
		handlers.set(signal, handler);
		process.on(signal, handler);
	}

	// Return cleanup function to remove handlers
	return () => {
		for (const [signal, handler] of handlers.entries()) {
			process.off(signal, handler);
		}
		handlers.clear();
	};
}

/**
 * Create a graceful shutdown handler for TUI applications
 *
 * @example
 * ```tsx
 * const shutdown = createShutdownHandler({
 *   tasks: [
 *     async () => {
 *       console.log('Saving state...');
 *       await saveState();
 *     },
 *     async () => {
 *       console.log('Closing connections...');
 *       await closeConnections();
 *     },
 *   ],
 * });
 *
 * setupSignalHandlers({ onExit: shutdown });
 * ```
 */
export function createShutdownHandler(config: {
	tasks: Array<() => void | Promise<void>>;
	timeout?: number;
	logProgress?: boolean;
}): () => Promise<void> {
	const { tasks, timeout = 5000, logProgress = true } = config;

	return async () => {
		const startTime = Date.now();

		for (let i = 0; i < tasks.length; i++) {
			try {
				if (logProgress) {
					console.log(`Running cleanup task ${i + 1}/${tasks.length}...`);
				}

				const task = tasks[i];
				if (!task) continue;

				const result = task();

				// Handle async tasks
				if (result && typeof result === "object" && "then" in result) {
					await result;
				}
			} catch (error) {
				console.error(`Cleanup task ${i + 1} failed:`, error);
			}

			// Check timeout
			if (Date.now() - startTime > timeout) {
				console.warn("Cleanup timeout reached, forcing exit");
				break;
			}
		}

		if (logProgress) {
			console.log("Cleanup complete");
		}
	};
}

/**
 * Utility to make an exit handler available globally
 * Useful for keyboard handlers that need to trigger exit
 */
let globalExitHandler: (() => void | Promise<void>) | null = null;

export function setExitHandler(handler: () => void | Promise<void>): void {
	globalExitHandler = handler;
}

export function getExitHandler(): (() => void | Promise<void>) | null {
	return globalExitHandler;
}

export async function triggerExit(): Promise<void> {
	if (globalExitHandler) {
		const result = globalExitHandler();
		if (result && typeof result === "object" && "then" in result) {
			await result;
		}
	} else {
		process.exit(0);
	}
}

/**
 * Production-ready signal handler setup with all best practices
 *
 * @example
 * ```tsx
 * setupProductionSignalHandlers({
 *   appName: 'my-tui-app',
 *   onCleanup: async () => {
 *     await cleanup();
 *   },
 * });
 * ```
 */
export function setupProductionSignalHandlers(config: {
	appName?: string;
	onCleanup?: () => void | Promise<void>;
	cleanupTasks?: Array<() => void | Promise<void>>;
}): () => void {
	const appName = config.appName || "TUI";

	// Create shutdown handler if tasks provided
	const shutdownHandler = config.cleanupTasks
		? createShutdownHandler({
				tasks: config.cleanupTasks,
				logProgress: true,
			})
		: config.onCleanup;

	// Setup signal handlers
	const cleanup = setupSignalHandlers({
		onExit: shutdownHandler,
		signals: ["SIGINT", "SIGTERM"],
		exitCode: 0,
		logSignals: true,
		cleanupTimeout: 5000,
	});

	// Make exit handler globally available
	if (shutdownHandler) {
		setExitHandler(shutdownHandler);
	}

	console.log(`[${appName}] Signal handlers initialized`);

	return cleanup;
}
