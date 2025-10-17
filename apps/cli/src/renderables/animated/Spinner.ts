import type { CliRenderer } from "@opentui/core";
import { TextRenderable } from "@opentui/core";
import { theme } from "../../design/theme";

/**
 * Loading spinner renderable with frame animation
 * Shows animated loading indicator
 */
export class Spinner extends TextRenderable {
	private frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
	private currentFrame = 0;
	private time = 0;
	private isAnimating = false;

	constructor(id: string, renderer: CliRenderer, _text: string = "Loading...") {
		super(renderer, {
			id,
			content: "⠋",
			fg: theme.colors.accent.cyan,
		});
	}

	start(): void {
		this.isAnimating = true;
		this.time = 0;
	}

	stop(): void {
		this.isAnimating = false;
		this.content = "⠋";
	}

	update(deltaMs: number): void {
		if (!this.isAnimating) return;
		
		this.time += deltaMs;
		const frameIndex = Math.floor((this.time % 1000) / 100);
		
		if (frameIndex !== this.currentFrame) {
			this.currentFrame = frameIndex;
			this.content = this.frames[this.currentFrame] || "⠋";
		}
	}

	setText(text: string): void {
		// Store the text but don't display it while animating
		if (!this.isAnimating) {
			this.content = text;
		}
	}

	isRunning(): boolean {
		return this.isAnimating;
	}

	override destroy(): void {
		this.stop();
		super.destroy();
	}
}
