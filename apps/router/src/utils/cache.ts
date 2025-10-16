/**
 * Cache Utilities
 *
 * Provides caching functionality for session usage tracking and other data.
 */

export class UsageCache {
	private cache: Map<string, any>;

	constructor() {
		this.cache = new Map();
	}

	get(key: string): any {
		return this.cache.get(key);
	}

	set(key: string, value: any): void {
		this.cache.set(key, value);
	}

	delete(key: string): void {
		this.cache.delete(key);
	}

	clear(): void {
		this.cache.clear();
	}
}
