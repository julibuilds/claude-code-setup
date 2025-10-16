/**
 * Cache Utilities
 *
 * Provides caching functionality for session usage tracking and other data.
 */

/**
 * Session usage data structure
 */
export interface SessionUsage {
	sessionId: string;
	totalInputTokens: number;
	totalOutputTokens: number;
	requestCount: number;
	firstRequestAt: Date;
	lastRequestAt: Date;
	providerUsage: Record<
		string,
		{
			inputTokens: number;
			outputTokens: number;
			requestCount: number;
		}
	>;
}

/**
 * Usage cache for tracking token usage per session
 */
export class UsageCache {
	private cache: Map<string, SessionUsage>;

	constructor() {
		this.cache = new Map();
	}

	/**
	 * Get session usage data
	 * @param sessionId - Session identifier
	 * @returns Session usage data or undefined if not found
	 */
	get(sessionId: string): SessionUsage | undefined {
		return this.cache.get(sessionId);
	}

	/**
	 * Track usage for a session
	 * @param sessionId - Session identifier
	 * @param provider - Provider name
	 * @param inputTokens - Number of input tokens used
	 * @param outputTokens - Number of output tokens used
	 */
	trackUsage(sessionId: string, provider: string, inputTokens: number, outputTokens: number): void {
		const existing = this.cache.get(sessionId);
		const now = new Date();

		if (existing) {
			// Update existing session
			existing.totalInputTokens += inputTokens;
			existing.totalOutputTokens += outputTokens;
			existing.requestCount += 1;
			existing.lastRequestAt = now;

			// Update provider-specific usage
			if (!existing.providerUsage[provider]) {
				existing.providerUsage[provider] = {
					inputTokens: 0,
					outputTokens: 0,
					requestCount: 0,
				};
			}
			existing.providerUsage[provider].inputTokens += inputTokens;
			existing.providerUsage[provider].outputTokens += outputTokens;
			existing.providerUsage[provider].requestCount += 1;
		} else {
			// Create new session
			this.cache.set(sessionId, {
				sessionId,
				totalInputTokens: inputTokens,
				totalOutputTokens: outputTokens,
				requestCount: 1,
				firstRequestAt: now,
				lastRequestAt: now,
				providerUsage: {
					[provider]: {
						inputTokens,
						outputTokens,
						requestCount: 1,
					},
				},
			});
		}
	}

	/**
	 * Get all session usage data
	 * @returns Array of all session usage data
	 */
	getAll(): SessionUsage[] {
		return Array.from(this.cache.values());
	}

	/**
	 * Delete session usage data
	 * @param sessionId - Session identifier
	 */
	delete(sessionId: string): void {
		this.cache.delete(sessionId);
	}

	/**
	 * Clear all session usage data
	 */
	clear(): void {
		this.cache.clear();
	}

	/**
	 * Get total usage across all sessions
	 * @returns Aggregated usage statistics
	 */
	getTotalUsage(): {
		totalInputTokens: number;
		totalOutputTokens: number;
		totalRequests: number;
		sessionCount: number;
	} {
		let totalInputTokens = 0;
		let totalOutputTokens = 0;
		let totalRequests = 0;

		for (const session of this.cache.values()) {
			totalInputTokens += session.totalInputTokens;
			totalOutputTokens += session.totalOutputTokens;
			totalRequests += session.requestCount;
		}

		return {
			totalInputTokens,
			totalOutputTokens,
			totalRequests,
			sessionCount: this.cache.size,
		};
	}
}
