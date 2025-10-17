import type { CliRenderer } from "@opentui/core";
import { BoxRenderable, createTimeline } from "@opentui/core";
import { theme } from "../../design/theme";

/**
 * Animated border renderable that transitions colors smoothly
 * Used for focus states and visual feedback
 */
export class AnimatedBorder extends BoxRenderable {
	private timeline = createTimeline({ duration: 1000, autoplay: false });
	private colorObj: { color: string };

	constructor(id: string, renderer: CliRenderer, initialColor: string = theme.colors.text.dim) {
		super(renderer, {
			id,
			border: true,
			borderStyle: "single",
			borderColor: initialColor,
			backgroundColor: theme.colors.bg.dark,
		});

		this.colorObj = { color: initialColor };
	}

	animateToColor(targetColor: string, duration: number = theme.animation.durations.normal): void {
		// Create color transition animation
		this.timeline.add(this.colorObj, {
			color: targetColor,
			duration,
			ease: "inOutQuad",
			onUpdate: (values: { targets: Array<{ color: string }> }) => {
				this.borderColor = values.targets[0]?.color || targetColor;
			}
		}, 0);
		
		this.timeline.play();
	}

	override focus(): void {
		this.animateToColor(theme.colors.accent.cyan);
	}

	override blur(): void {
		this.animateToColor(theme.colors.text.dim);
	}

	success(): void {
		this.animateToColor(theme.colors.success);
	}

	warning(): void {
		this.animateToColor(theme.colors.warning);
	}

	error(): void {
		this.animateToColor(theme.colors.error);
	}

	setColor(color: string): void {
		this.borderColor = color;
		this.colorObj.color = color;
	}

	override destroy(): void {
		// Timeline cleanup is handled automatically
		super.destroy();
	}
}
