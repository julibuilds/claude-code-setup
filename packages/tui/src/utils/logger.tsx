import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

// Log levels with priorities
export enum LogLevel {
	DEBUG = 0,
	INFO = 1,
	WARN = 2,
	ERROR = 3,
	FATAL = 4,
}

export interface LogConfig {
	appName?: string; // If not provided, auto-detects from package.json
	minLevel?: LogLevel;
	logFile?: string; // If not provided, uses temp dir
	maxFileSize?: number; // in bytes, default 10MB
	enableConsole?: boolean;
	attachProcessHandlers?: boolean; // Default false for library usage
}

/**
 * Auto-detect app name by traversing up to find nearest package.json
 */
function detectAppName(): string {
	let currentDir = process.cwd();
	const root = path.parse(currentDir).root;

	while (currentDir !== root) {
		const pkgPath = path.join(currentDir, "package.json");
		if (fs.existsSync(pkgPath)) {
			try {
				const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
				if (pkg.name) {
					// Remove scope prefix if present (@scope/name -> name)
					return pkg.name.replace(/^@[^/]+\//, "");
				}
			} catch {
				// Continue searching if package.json is invalid
			}
		}
		currentDir = path.dirname(currentDir);
	}

	return "app"; // Fallback if no package.json found
}

class Logger {
	private config: Required<Omit<LogConfig, "appName" | "attachProcessHandlers">>;
	private appName: string;
	private logDir: string;
	private logFile: string;
	private sessionId: string;

	private timers = new Map<string, number>();
	private counters = new Map<string, number>();

	constructor(options: LogConfig = {}) {
		this.appName = options.appName || detectAppName();
		this.sessionId = new Date().toISOString().replace(/[:.]/g, "-");

		// Setup log directory and file
		this.logDir = path.join(os.tmpdir(), `${this.appName}-cli`);
		this.logFile = options.logFile || path.join(this.logDir, `${this.appName}.log`);

		const maxFileSize = options.maxFileSize ?? 10 * 1024 * 1024; // 10MB default

		this.config = {
			minLevel: options.minLevel ?? LogLevel.DEBUG,
			logFile: this.logFile,
			maxFileSize,
			enableConsole: options.enableConsole ?? false,
		};

		this.initializeLogFile();

		// Attach process handlers if requested
		if (options.attachProcessHandlers) {
			this.attachProcessHandlers();
		}
	}

	/**
	 * Initialize log file with rotation if needed
	 */
	private initializeLogFile(): void {
		// Ensure log directory exists
		if (!fs.existsSync(this.logDir)) {
			fs.mkdirSync(this.logDir, { recursive: true });
		}

		// Rotate log file if it gets too large
		if (fs.existsSync(this.logFile)) {
			const stats = fs.statSync(this.logFile);
			if (stats.size > this.config.maxFileSize) {
				const backupFile = path.join(this.logDir, `${this.appName}-${Date.now()}.log`);
				fs.renameSync(this.logFile, backupFile);

				// Keep only last 5 backup files
				const files = fs
					.readdirSync(this.logDir)
					.filter((f) => f.startsWith(`${this.appName}-`) && f.endsWith(".log"))
					.map((f) => ({
						name: f,
						path: path.join(this.logDir, f),
						time: fs.statSync(path.join(this.logDir, f)).mtime.getTime(),
					}))
					.sort((a, b) => b.time - a.time);

				for (const file of files.slice(5)) {
					fs.unlinkSync(file.path);
				}
			}
		}

		// Write session start marker
		const sessionStart = `\n${"=".repeat(80)}\nSESSION START: ${this.sessionId}\n${"=".repeat(80)}\n`;
		fs.appendFileSync(this.logFile, sessionStart);

		// Log session info on startup
		this.info("Application started");
		this.debug("Session ID:", this.sessionId);
		this.debug("App name:", this.appName);
		this.debug("Node version:", process.version);
		this.debug("Platform:", process.platform);
		this.debug("Architecture:", process.arch);
		this.debug("Working directory:", process.cwd());
		this.debug("Log file:", this.logFile);
	}

	/**
	 * Attach process-level error handlers (opt-in)
	 */
	private attachProcessHandlers(): void {
		process.on("uncaughtException", (error: Error) => {
			this.fatal("Uncaught Exception:", error);
			this.info(`Full logs available at: ${this.logFile}`);
			process.exit(1);
		});

		process.on("unhandledRejection", (reason: unknown, promise: Promise<unknown>) => {
			this.fatal("Unhandled Rejection:", reason);
			this.debug("Promise:", promise);
			this.info(`Full logs available at: ${this.logFile}`);
			process.exit(1);
		});
	}

	/**
	 * Configure logger settings
	 */
	configure(config: Partial<Omit<LogConfig, "appName" | "attachProcessHandlers">>): void {
		this.config = { ...this.config, ...config } as Required<
			Omit<LogConfig, "appName" | "attachProcessHandlers">
		>;
	}

	/**
	 * Get log file path for error messages
	 */
	getLogPath(): string {
		return this.logFile;
	}

	/**
	 * Serialize any value to string for logging
	 */
	private serialize(msg: unknown): string {
		if (msg instanceof Error) {
			return `${msg.name}: ${msg.message}\n${msg.stack || ""}`;
		}
		if (typeof msg === "string") {
			return msg;
		}
		if (msg === undefined) {
			return "undefined";
		}
		if (msg === null) {
			return "null";
		}
		try {
			return Bun.inspect(msg, { depth: 4, colors: false });
		} catch {
			return String(msg);
		}
	}

	/**
	 * Format log entry with metadata
	 */
	private format(level: LogLevel, messages: unknown[]): string {
		const timestamp = new Date().toISOString();
		const levelName = LogLevel[level].padEnd(5);
		const formattedMessages = messages.map((msg) => this.serialize(msg)).join(" ");
		return `[${timestamp}] [${levelName}] ${formattedMessages}`;
	}

	/**
	 * Write to log file
	 */
	private write(level: LogLevel, messages: unknown[]): void {
		if (level < this.config.minLevel) {
			return;
		}

		const logEntry = `${this.format(level, messages)}\n`;

		try {
			fs.appendFileSync(this.config.logFile, logEntry);

			if (this.config.enableConsole) {
				const output = level >= LogLevel.ERROR ? console.error : console.log;
				output(logEntry.trim());
			}
		} catch (err) {
			// If we can't write to log file, at least try console
			console.error("Failed to write to log file:", err);
			console.error("Original log:", logEntry);
		}
	}

	/**
	 * Debug level logging (verbose)
	 */
	debug(...messages: unknown[]): void {
		this.write(LogLevel.DEBUG, messages);
	}

	/**
	 * Info level logging (general information)
	 */
	info(...messages: unknown[]): void {
		this.write(LogLevel.INFO, messages);
	}

	/**
	 * Warn level logging (warnings)
	 */
	warn(...messages: unknown[]): void {
		this.write(LogLevel.WARN, messages);
	}

	/**
	 * Error level logging (recoverable errors)
	 */
	error(...messages: unknown[]): void {
		this.write(LogLevel.ERROR, messages);
	}

	/**
	 * Fatal level logging (unrecoverable errors)
	 */
	fatal(...messages: unknown[]): void {
		this.write(LogLevel.FATAL, messages);
	}

	/**
	 * Log with context information
	 */
	withContext(context: Record<string, unknown>, level: LogLevel, ...messages: unknown[]): void {
		const contextStr = Object.entries(context)
			.map(([key, value]) => `${key}=${this.serialize(value)}`)
			.join(", ");
		this.write(level, [`[${contextStr}]`, ...messages]);
	}

	/**
	 * Start a timer
	 */
	time(label: string): void {
		this.timers.set(label, Date.now());
		this.debug(`Timer started: ${label}`);
	}

	/**
	 * End a timer and log the duration
	 */
	timeEnd(label: string): void {
		const start = this.timers.get(label);
		if (start === undefined) {
			this.warn(`Timer "${label}" does not exist`);
			return;
		}
		const duration = Date.now() - start;
		this.timers.delete(label);
		this.info(`Timer "${label}" completed in ${duration}ms`);
	}

	/**
	 * Increment a counter
	 */
	count(label: string): void {
		const current = this.counters.get(label) || 0;
		this.counters.set(label, current + 1);
		this.debug(`Counter "${label}": ${current + 1}`);
	}

	/**
	 * Get counter value
	 */
	getCount(label: string): number {
		return this.counters.get(label) || 0;
	}

	/**
	 * Reset counter
	 */
	resetCount(label: string): void {
		this.counters.delete(label);
		this.debug(`Counter "${label}" reset`);
	}

	/**
	 * Log an async operation with automatic timing
	 */
	async logOperation<T>(
		label: string,
		operation: () => Promise<T>,
		context?: Record<string, unknown>
	): Promise<T> {
		const timerLabel = `operation:${label}`;
		this.time(timerLabel);

		if (context) {
			this.withContext(context, LogLevel.INFO, `Starting operation: ${label}`);
		} else {
			this.info(`Starting operation: ${label}`);
		}

		try {
			const result = await operation();
			this.timeEnd(timerLabel);
			this.info(`Operation completed successfully: ${label}`);
			return result;
		} catch (error) {
			this.timeEnd(timerLabel);
			this.error(`Operation failed: ${label}`, error);
			throw error;
		}
	}

	/**
	 * Create a new logger instance with a context prefix
	 */
	child(prefix: string): Logger {
		const childLogger = new Logger({
			appName: this.appName,
			minLevel: this.config.minLevel,
			logFile: this.logFile,
			maxFileSize: this.config.maxFileSize,
			enableConsole: this.config.enableConsole,
		});

		// Override write to add prefix
		const originalWrite = childLogger.write.bind(childLogger);
		childLogger.write = (level: LogLevel, messages: unknown[]) => {
			originalWrite(level, [`[${prefix}]`, ...messages]);
		};

		return childLogger;
	}
}

/**
 * Factory function to create a new logger instance
 *
 * @example
 * ```ts
 * // Auto-detect app name from package.json
 * const logger = createLogger()
 *
 * // Manual app name
 * const logger = createLogger({ appName: 'my-app' })
 *
 * // With process handlers for CLI apps
 * const logger = createLogger({ attachProcessHandlers: true })
 * ```
 */
export function createLogger(options?: LogConfig): Logger {
	return new Logger(options);
}

// Export the Logger class for advanced usage
export { Logger };
