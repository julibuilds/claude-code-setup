/**
 * Keyboard Shortcut Registry
 *
 * Provides centralized management for keyboard shortcuts with:
 * - Context-aware shortcuts (global, modal, view-specific)
 * - Conflict detection
 * - Description and labels for documentation
 * - Single source of truth for all shortcuts
 */

export type ShortcutContext = "global" | "modal" | string;

export interface Shortcut {
	/** The key name (from useKeyboard) */
	key: string;
	/** Display label for the key (e.g., "ESC", "Ctrl+C") */
	label: string;
	/** Description of what the shortcut does */
	description: string;
	/** Which context(s) this shortcut is active in */
	context: ShortcutContext | ShortcutContext[];
}

export interface ShortcutRegistry {
	[id: string]: Shortcut;
}

/**
 * Shortcut registry class for managing keyboard shortcuts
 */
export class ShortcutManager {
	private registry: Map<string, Shortcut>;

	constructor() {
		this.registry = new Map();
	}

	/**
	 * Register a new shortcut
	 */
	register(id: string, shortcut: Shortcut): void {
		this.registry.set(id, shortcut);
	}

	/**
	 * Register multiple shortcuts at once
	 */
	registerMany(shortcuts: Record<string, Shortcut>): void {
		for (const [id, shortcut] of Object.entries(shortcuts)) {
			this.register(id, shortcut);
		}
	}

	/**
	 * Get a shortcut by ID
	 */
	get(id: string): Shortcut | undefined {
		return this.registry.get(id);
	}

	/**
	 * Get all shortcuts
	 */
	getAll(): Map<string, Shortcut> {
		return new Map(this.registry);
	}

	/**
	 * Get shortcuts by context
	 */
	getByContext(context: ShortcutContext): Array<[string, Shortcut]> {
		return Array.from(this.registry.entries()).filter(([_, shortcut]) => {
			if (Array.isArray(shortcut.context)) {
				return shortcut.context.includes(context);
			}
			return shortcut.context === context;
		});
	}

	/**
	 * Detect conflicts - shortcuts with the same key in the same context
	 */
	detectConflicts(): Array<{
		key: string;
		context: ShortcutContext;
		shortcuts: Array<[string, Shortcut]>;
	}> {
		const conflicts: Array<{
			key: string;
			context: ShortcutContext;
			shortcuts: Array<[string, Shortcut]>;
		}> = [];

		// Group shortcuts by context
		const contextMap = new Map<ShortcutContext, Map<string, Array<[string, Shortcut]>>>();

		for (const [id, shortcut] of this.registry.entries()) {
			const contexts = Array.isArray(shortcut.context) ? shortcut.context : [shortcut.context];

			for (const ctx of contexts) {
				if (!contextMap.has(ctx)) {
					contextMap.set(ctx, new Map());
				}

				const keyMap = contextMap.get(ctx)!;
				if (!keyMap.has(shortcut.key)) {
					keyMap.set(shortcut.key, []);
				}

				keyMap.get(shortcut.key)!.push([id, shortcut]);
			}
		}

		// Find conflicts (multiple shortcuts with same key in same context)
		for (const [context, keyMap] of contextMap.entries()) {
			for (const [key, shortcuts] of keyMap.entries()) {
				if (shortcuts.length > 1) {
					conflicts.push({ key, context, shortcuts });
				}
			}
		}

		return conflicts;
	}

	/**
	 * Format shortcut for display (e.g., "[m]" for key shortcuts)
	 */
	formatShortcut(key: string): string {
		return `[${key}]`;
	}

	/**
	 * Clear all shortcuts
	 */
	clear(): void {
		this.registry.clear();
	}

	/**
	 * Remove a shortcut by ID
	 */
	remove(id: string): boolean {
		return this.registry.delete(id);
	}
}

/**
 * Create a new shortcut manager instance
 */
export function createShortcutManager(): ShortcutManager {
	return new ShortcutManager();
}

/**
 * Common global shortcuts used across TUI applications
 */
export const COMMON_GLOBAL_SHORTCUTS: ShortcutRegistry = {
	quit: {
		key: "q",
		label: "q",
		description: "Quit application",
		context: "global",
	},
	escape: {
		key: "escape",
		label: "ESC",
		description: "Go back / Close modal",
		context: "global",
	},
	help: {
		key: "h",
		label: "h",
		description: "Show help",
		context: "global",
	},
	search: {
		key: "/",
		label: "/",
		description: "Search or open command menu",
		context: "global",
	},
	refresh: {
		key: "r",
		label: "r",
		description: "Refresh view",
		context: "global",
	},
} as const;

/**
 * Common modal shortcuts
 */
export const COMMON_MODAL_SHORTCUTS: ShortcutRegistry = {
	closeModal: {
		key: "escape",
		label: "ESC",
		description: "Close modal",
		context: "modal",
	},
	confirmModal: {
		key: "return",
		label: "Enter",
		description: "Confirm action",
		context: "modal",
	},
} as const;
