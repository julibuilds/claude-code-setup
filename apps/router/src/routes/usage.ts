/**
 * Usage Statistics Routes
 */

import type { Context } from "hono";
import type { Logger } from "pino";
import type { UsageCache } from "../utils/cache";

/**
 * Setup usage statistics routes
 */
export function setupUsageRoutes(app: any, usageCache: UsageCache, logger: Logger) {
	// GET /api/usage - Get total usage statistics
	app.get("/api/usage", async (c: Context) => {
		const totalUsage = usageCache.getTotalUsage();
		return c.json(totalUsage);
	});

	// GET /api/usage/sessions - Get all session statistics
	app.get("/api/usage/sessions", async (c: Context) => {
		const sessions = usageCache.getAll();
		return c.json({ sessions });
	});

	// GET /api/usage/sessions/:sessionId - Get specific session statistics
	app.get("/api/usage/sessions/:sessionId", async (c: Context) => {
		const sessionId = c.req.param("sessionId");
		const session = usageCache.get(sessionId);

		if (!session) {
			return c.json(
				{
					error: {
						type: "not_found",
						message: `Session "${sessionId}" not found`,
					},
				},
				404
			);
		}

		return c.json(session);
	});

	// DELETE /api/usage/sessions/:sessionId - Delete session statistics
	app.delete("/api/usage/sessions/:sessionId", async (c: Context) => {
		const sessionId = c.req.param("sessionId");
		usageCache.delete(sessionId);

		logger.info({ sessionId }, "Session usage data deleted");

		return c.json({ success: true });
	});
}
