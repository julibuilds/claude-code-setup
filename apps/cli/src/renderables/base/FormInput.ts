import type { CliRenderer, InputRenderableOptions } from "@opentui/core";
import { InputRenderable, InputRenderableEvents, BoxRenderable, TextRenderable, RenderableEvents } from "@opentui/core";
import { theme } from "../../design/theme";

/**
 * Enhanced input renderable with validation and error display
 * Extends InputRenderable with form-specific functionality
 */
export class FormInput extends InputRenderable {
	private errorBox: BoxRenderable | null = null;
	private errorText: TextRenderable | null = null;
	private validationState: "idle" | "valid" | "error" = "idle";

	constructor(id: string, private renderer: CliRenderer, opts: InputRenderableOptions) {
		super(renderer, { id, ...opts });
		
		// Set up focus/blur event handlers
		this.on(RenderableEvents.FOCUSED, () => {
			this.focusedBackgroundColor = theme.colors.accent.cyan;
		});
		
		this.on(RenderableEvents.BLURRED, () => {
			this.focusedBackgroundColor = theme.colors.bg.mid;
		});
	}

	setError(message: string): void {
		this.validationState = "error";
		this.backgroundColor = theme.colors.error;
		
		// Create error display if it doesn't exist
		if (!this.errorBox) {
			this.errorBox = new BoxRenderable(this.renderer, {
				id: `${this.id}-error`,
				border: true,
				borderStyle: "single",
				borderColor: theme.colors.error,
				backgroundColor: theme.colors.bg.dark,
				padding: 1,
				marginTop: 1,
			});
			
			this.errorText = new TextRenderable(this.renderer, {
				id: `${this.id}-error-text`,
				content: message,
				fg: theme.colors.error,
			});
			
			this.errorBox.add(this.errorText);
			// Note: We can't add to container directly, need parent to handle this
		} else {
			// Update existing error message
			if (this.errorText) {
				this.errorText.content = message;
			}
		}
	}

	setValid(): void {
		this.validationState = "valid";
		this.backgroundColor = theme.colors.success;
		
		// Remove error display
		if (this.errorBox) {
			this.errorBox.destroy();
			this.errorBox = null;
			this.errorText = null;
		}
	}

	setIdle(): void {
		this.validationState = "idle";
		this.backgroundColor = theme.colors.bg.dark;
		
		// Remove error display
		if (this.errorBox) {
			this.errorBox.destroy();
			this.errorBox = null;
			this.errorText = null;
		}
	}

	getValidationState(): "idle" | "valid" | "error" {
		return this.validationState;
	}

	getErrorBox(): BoxRenderable | null {
		return this.errorBox;
	}

	override destroy(): void {
		if (this.errorBox) {
			this.errorBox.destroy();
		}
		super.destroy();
	}
}
