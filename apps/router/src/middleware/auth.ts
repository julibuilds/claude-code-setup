/**
 * Authentication Middleware
 *
 * Handles API key authentication for the router service.
 * Supports Bearer token and x-api-key header authentication.
 */

import type { MiddlewareHandler } from "hono";

/**
 * Creates authentication middleware that validates API keys
 * @param apiKey - The expected API key for authentication
 * @returns Hono middleware handler
 */
export function authMiddleware(apiKey: string): MiddlewareHandler {
	return async (c, next) => {
		const path = c.req.path;

		// Skip auth for proxy endpoints - they handle their own provider authentication
		// Only protect management/config endpoints
		if (path.startsWith("/v1/")) {
			await next();
			return;
		}

		// Extract API key from request headers for management endpoints
		// Support both Authorization: Bearer <token> and x-api-key: <token>
		const authHeader = c.req.header("Authorization");
		const apiKeyHeader = c.req.header("x-api-key");

		let providedKey: string | undefined;

		// Check Authorization header with Bearer scheme
		if (authHeader) {
			const match = authHeader.match(/^Bearer\s+(.+)$/i);
			if (match) {
				providedKey = match[1];
			}
		}

		// Check x-api-key header (takes precedence if both are provided)
		if (apiKeyHeader) {
			providedKey = apiKeyHeader;
		}

		// Validate the provided key
		if (!providedKey || providedKey !== apiKey) {
			return c.json(
				{
					error: {
						type: "authentication_error",
						message: "Invalid or missing API key",
					},
				},
				401
			);
		}

		// Authentication successful, proceed to next middleware
		await next();
	};
}
