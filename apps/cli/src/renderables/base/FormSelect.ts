import type { CliRenderer, SelectOption } from "@opentui/core";
import { SelectRenderable, SelectRenderableEvents, RenderableEvents } from "@opentui/core";
import { FormInput } from "./FormInput";
import { theme } from "../../design/theme";

/**
 * Enhanced select renderable with filtering capabilities
 * Extends SelectRenderable with search/filter functionality
 */
export class FormSelect extends SelectRenderable {
	private filterInput: FormInput | null = null;
	private filteredOptions: SelectOption[] = [];
	private allOptions: SelectOption[] = [];
	private showFilter = false;

	constructor(id: string, renderer: CliRenderer, options: SelectOption[]) {
		super(renderer, {
			id,
			options,
		});
		
		this.allOptions = [...options];
		this.filteredOptions = [...options];
		
		// Set up focus/blur event handlers
		this.on(RenderableEvents.FOCUSED, () => {
			this.focusedBackgroundColor = theme.colors.accent.cyan;
			this.showFilterInput();
		});
		
		this.on(RenderableEvents.BLURRED, () => {
			this.focusedBackgroundColor = theme.colors.bg.mid;
			this.hideFilterInput();
		});
	}

	private showFilterInput(): void {
		if (!this.showFilter && this.allOptions.length > 5) {
			this.showFilter = true;
			
			// Create filter input
			this.filterInput = new FormInput(
				`${this.id}-filter`,
				this.renderer,
				{
					placeholder: "Filter options...",
					backgroundColor: theme.colors.bg.dark,
					marginBottom: 1,
				}
			);
			
			// Set up filter event handler
			this.filterInput.on("input", (value: string) => {
				this.setFilter(value);
			});
		}
	}

	private hideFilterInput(): void {
		if (this.showFilter && this.filterInput) {
			this.showFilter = false;
			this.filterInput.destroy();
			this.filterInput = null;
			this.setFilter(""); // Reset filter
		}
	}

	setFilter(query: string): void {
		if (!query.trim()) {
			this.filteredOptions = [...this.allOptions];
		} else {
			const lowerQuery = query.toLowerCase();
			this.filteredOptions = this.allOptions.filter(option =>
				option.name.toLowerCase().includes(lowerQuery) ||
				option.description?.toLowerCase().includes(lowerQuery)
			);
		}
		
		// Update the select options
		this.options = this.filteredOptions;
	}

	getFilteredOptions(): SelectOption[] {
		return this.filteredOptions;
	}

	updateOptions(newOptions: SelectOption[]): void {
		this.allOptions = [...newOptions];
		this.setFilter(this.filterInput?.value || "");
	}

	getFilterInput(): FormInput | null {
		return this.filterInput;
	}

	override destroy(): void {
		if (this.filterInput) {
			this.filterInput.destroy();
		}
		super.destroy();
	}
}
