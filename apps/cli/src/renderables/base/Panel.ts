import type { CliRenderer, Renderable } from "@opentui/core";
import { BoxRenderable, TextRenderable, TextAttributes } from "@opentui/core";
import { theme } from "../../design/theme";

/**
 * Standard panel renderable with header, content, and optional footer
 * Provides consistent styling and focus management for UI sections
 */
export class Panel extends BoxRenderable {
	private header: TextRenderable;
	private content: BoxRenderable;
	private footer: TextRenderable | null = null;
	private isLoading = false;
	private spinner: TextRenderable | null = null;
	private renderer: CliRenderer;

	constructor(id: string, renderer: CliRenderer, title: string) {
		super(renderer, {
			id,
			border: true,
			borderStyle: "single",
			borderColor: theme.colors.text.dim,
			backgroundColor: theme.colors.bg.dark,
			flexDirection: "column",
			padding: 2,
		});

		this.renderer = renderer;

		// Create header
		this.header = new TextRenderable(renderer, {
			id: `${id}-header`,
			content: title,
			fg: theme.colors.accent.cyan,
			attributes: TextAttributes.BOLD,
			marginBottom: 1,
		});
		this.add(this.header);

		// Create content area
		this.content = new BoxRenderable(renderer, {
			id: `${id}-content`,
			flexGrow: 1,
			flexShrink: 1,
			flexDirection: "column",
		});
		this.add(this.content);
	}

	addContent(element: Renderable): void {
		this.content.add(element);
	}

	removeContent(elementId: string): void {
		this.content.remove(elementId);
	}

	setFooter(text: string): void {
		if (this.footer) {
			this.footer.content = text;
		} else {
			this.footer = new TextRenderable(this.renderer, {
				id: `${this.id}-footer`,
				content: text,
				fg: theme.colors.text.dim,
				attributes: TextAttributes.DIM,
				marginTop: 1,
			});
			this.add(this.footer);
		}
	}

	removeFooter(): void {
		if (this.footer) {
			this.remove(this.footer.id);
			this.footer = null;
		}
	}

	setLoading(loading: boolean): void {
		this.isLoading = loading;
		
		if (loading && !this.spinner) {
			this.spinner = new TextRenderable(this.renderer, {
				id: `${this.id}-spinner`,
				content: "⠋",
				fg: theme.colors.accent.cyan,
			});
			this.content.add(this.spinner);
		} else if (!loading && this.spinner) {
			this.content.remove(this.spinner.id);
			this.spinner = null;
		}
	}

	updateSpinner(): void {
		if (this.spinner && this.isLoading) {
			const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
			const currentFrame = Math.floor(Date.now() / 100) % frames.length;
			this.spinner.content = frames[currentFrame] || "⠋";
		}
	}

	override focus(): void {
		super.focus();
		this.borderColor = theme.colors.accent.cyan;
		this.backgroundColor = theme.colors.bg.mid;
	}

	override blur(): void {
		super.blur();
		this.borderColor = theme.colors.text.dim;
		this.backgroundColor = theme.colors.bg.dark;
	}

	setTitle(title: string): void {
		this.header.content = title;
	}

	getContentArea(): BoxRenderable {
		return this.content;
	}

	override destroy(): void {
		if (this.spinner) {
			this.content.remove(this.spinner.id);
		}
		super.destroy();
	}
}
