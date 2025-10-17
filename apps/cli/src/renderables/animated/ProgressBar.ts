import type { CliRenderer } from "@opentui/core";
import { BoxRenderable, TextRenderable, createTimeline } from "@opentui/core";
import { theme } from "../../design/theme";

/**
 * Animated progress bar renderable
 * Shows progress with smooth animation and percentage display
 */
export class ProgressBar extends BoxRenderable {
	private progress = 0;
	private targetProgress = 0;
	private timeline = createTimeline({ duration: 1000, autoplay: false });
	private label: TextRenderable;
	private filledBox: BoxRenderable;
	private progressObj: { progress: number };

	constructor(id: string, renderer: CliRenderer) {
		super(renderer, {
			id,
			height: 3,
			border: true,
			borderStyle: "single",
			borderColor: theme.colors.text.dim,
			backgroundColor: theme.colors.bg.dark,
			flexDirection: "row",
			alignItems: "center",
		});

		this.progressObj = { progress: 0 };

		// Create filled portion
		this.filledBox = new BoxRenderable(renderer, {
			id: `${id}-filled`,
			backgroundColor: theme.colors.accent.cyan,
			width: 0,
			height: 1,
		});
		this.add(this.filledBox);

		// Create percentage label
		this.label = new TextRenderable(renderer, {
			id: `${id}-label`,
			content: "0%",
			fg: theme.colors.text.primary,
			marginLeft: 2,
		});
		this.add(this.label);
	}

	setProgress(target: number): void {
		this.targetProgress = Math.min(100, Math.max(0, target));
		
		// Create new animation
		this.timeline.add(this.progressObj, {
			progress: this.targetProgress,
			duration: 500,
			ease: "inOutQuad",
			onUpdate: (values: { targets: Array<{ progress: number }> }) => {
				this.progress = values.targets[0]?.progress || 0;
				this.updateDisplay();
			}
		}, 0);
		
		this.timeline.play();
	}

	private updateDisplay(): void {
		const filledWidth = Math.round((this.progress / 100) * (this.width - 4)); // Account for borders
		this.filledBox.width = Math.max(0, filledWidth);
		this.label.content = `${Math.round(this.progress)}%`;
	}

	setLabel(text: string): void {
		this.label.content = text;
	}

	getProgress(): number {
		return this.progress;
	}

	getTargetProgress(): number {
		return this.targetProgress;
	}

	override destroy(): void {
		// Timeline cleanup is handled automatically
		super.destroy();
	}
}
