import type { CliRenderer } from "@opentui/core";
import { Renderable } from "@opentui/core";
import type { Screen } from "./base/Screen";

/**
 * Multi-screen manager implementing the ScreenController pattern
 * Handles screen lifecycle, navigation, and frame updates
 */
export class ScreenController extends Renderable {
	private screens: Map<string, Screen> = new Map();
	private currentScreenId: string | null = null;
	private frameCallback: ((deltaMs: number) => Promise<void>) | null = null;

	constructor(id: string, renderer: CliRenderer) {
		super(renderer, { id, width: "100%", height: "100%" });
		this.frameCallback = async (deltaMs) => this.update(deltaMs);
		renderer.setFrameCallback(this.frameCallback);
	}

	/**
	 * Register a screen with the controller
	 */
	registerScreen(id: string, screen: Screen): void {
		this.screens.set(id, screen);
		this.add(screen.getContainer());
		screen.getContainer().visible = false;
	}

	/**
	 * Switch to a specific screen
	 */
	switchToScreen(id: string): void {
		// Hide current screen
		if (this.currentScreenId) {
			const current = this.screens.get(this.currentScreenId);
			if (current) {
				current.getContainer().visible = false;
				current.hide();
			}
		}

		// Show new screen
		this.currentScreenId = id;
		const screen = this.screens.get(id);
		if (screen) {
			screen.init();
			screen.getContainer().visible = true;
			screen.show();
		}
	}

	/**
	 * Get the current screen ID
	 */
	getCurrentScreenId(): string | null {
		return this.currentScreenId;
	}

	/**
	 * Get a screen by ID
	 */
	getScreen(id: string): Screen | undefined {
		return this.screens.get(id);
	}

	/**
	 * Get all registered screen IDs
	 */
	getScreenIds(): string[] {
		return Array.from(this.screens.keys());
	}

	/**
	 * Check if a screen is registered
	 */
	hasScreen(id: string): boolean {
		return this.screens.has(id);
	}

	/**
	 * Frame update handler - called by renderer
	 */
	private update(deltaMs: number): void {
		if (this.currentScreenId) {
			const screen = this.screens.get(this.currentScreenId);
			if (screen) {
				screen.update(deltaMs);
			}
		}
	}

	/**
	 * Clean up resources
	 */
	override destroy(): void {
		// Note: CliRenderer doesn't have removeFrameCallback, frame callbacks are cleared when renderer is destroyed
		
		for (const screen of this.screens.values()) {
			screen.destroy();
		}
		this.screens.clear();
		
		super.destroy();
	}
}
