import type { CliRenderer } from "@opentui/core";
import { BoxRenderable, type InputRenderable, type SelectRenderable } from "@opentui/core";
import { EventEmitter } from "events";

/**
 * Base screen class implementing lifecycle hooks and focus management
 * All screens should extend this class for consistent behavior
 */
export abstract class Screen extends EventEmitter {
	protected renderer: CliRenderer;
	protected container: BoxRenderable;
	protected focusableElements: (InputRenderable | SelectRenderable)[] = [];
	protected currentFocusIndex = 0;

	constructor(id: string, renderer: CliRenderer) {
		super();
		this.renderer = renderer;
		this.container = new BoxRenderable(renderer, {
			id,
			width: "auto",
			height: "auto",
			flexGrow: 1,
			flexShrink: 1,
		});
	}

	// Lifecycle hooks - override in subclasses
	abstract init(): void;
	update(_deltaMs: number): void {}
	show(): void {}
	hide(): void {}

	// Focus management
	protected updateFocus(): void {
		this.focusableElements.forEach(e => {
			e.blur();
		});
		const focusedElement = this.focusableElements[this.currentFocusIndex];
		if (focusedElement) {
			focusedElement.focus();
		}
	}

	protected nextFocus(): void {
		this.currentFocusIndex = 
			(this.currentFocusIndex + 1) % this.focusableElements.length;
		this.updateFocus();
	}

	protected previousFocus(): void {
		this.currentFocusIndex = 
			(this.currentFocusIndex - 1 + this.focusableElements.length) % this.focusableElements.length;
		this.updateFocus();
	}

	protected setFocus(index: number): void {
		if (index >= 0 && index < this.focusableElements.length) {
			this.currentFocusIndex = index;
			this.updateFocus();
		}
	}

	getContainer(): BoxRenderable {
		return this.container;
	}

	abstract destroy(): void;
}
