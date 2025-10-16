/**
 * Logger Utilities
 *
 * Provides structured logging functionality using pino with rotating file streams.
 */

import type { AppConfig } from "@repo/core";
import pino from "pino";

/**
 * Creates a pino logger instance with optional file logging
 * @param config - Application configuration
 * @returns Configured pino logger
 */
export function createLogger(config: AppConfig) {
	const level = config.LOG_LEVEL || "info";
	const enableLogging = config.LOG !== false;

	// If logging is disabled, return a minimal logger
	if (!enableLogging) {
		return pino({
			level: "silent",
		});
	}

	// Configure logger with pretty printing for console
	const logger = pino({
		level,
		transport: {
			target: "pino-pretty",
			options: {
				colorize: true,
				translateTime: "HH:MM:ss Z",
				ignore: "pid,hostname",
			},
		},
	});

	return logger;
}

/**
 * Logger instance type
 */
export type Logger = ReturnType<typeof createLogger>;
