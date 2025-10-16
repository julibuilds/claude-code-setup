/**
 * Logger Utilities
 *
 * Provides structured logging functionality using pino.
 */

import pino from "pino";

export function createLogger(level: string = "info") {
	return pino({
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
}
