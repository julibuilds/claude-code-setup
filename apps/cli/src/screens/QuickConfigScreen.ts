import type { CliRenderer, SelectOption } from "@opentui/core";
import { TextRenderable, TextAttributes, SelectRenderableEvents } from "@opentui/core";
import { Screen } from "../renderables/base/Screen";
import { Panel } from "../renderables/base/Panel";
import { FormSelect } from "../renderables/base/FormSelect";
import { FormInput } from "../renderables/base/FormInput";
import { theme } from "../design/theme";

/**
 * Quick configuration screen with three-panel layout
 * Router Type | Filter | Models with pending changes display
 */
export class QuickConfigScreen extends Screen {
	private routerTypePanel!: Panel;
	private filterPanel!: Panel;
	private modelsPanel!: Panel;
	private previewPanel!: Panel;
	private panels!: Panel[];
	private currentPanelIndex = 0;

	// Router type selection
	private routerTypeSelect!: FormSelect;
	private routerTypes = ["default", "background", "think", "longContext"];
	private currentRouterType = "default";

	// Filter controls
	private providerFilter!: FormSelect;
	private searchInput!: FormInput;

	// Model selection
	private modelSelect!: FormSelect;
	private models: SelectOption[] = [];

	// Preview and actions
	private pendingChangesText!: TextRenderable;
	private saveButton!: TextRenderable;

	constructor(renderer: CliRenderer) {
		super("quick-config", renderer);
	}

	init(): void {
		// Create header
		const header = new TextRenderable(this.renderer, {
			id: "quick-config-header",
			content: "⚡ Quick Configuration",
			fg: theme.colors.accent.cyan,
			attributes: TextAttributes.BOLD,
			marginBottom: 2,
		});
		this.container.add(header);

		// Create three-panel layout
  const layout = new Panel("config-layout", this.renderer, "Configuration Panels");
		layout.getContentArea().flexDirection = "row";
		layout.getContentArea().gap = 2;

		// Router Type Panel
		this.routerTypePanel = this.createRouterTypePanel();
		layout.addContent(this.routerTypePanel);

		// Filter Panel
		this.filterPanel = this.createFilterPanel();
		layout.addContent(this.filterPanel);

		// Models Panel
		this.modelsPanel = this.createModelsPanel();
		layout.addContent(this.modelsPanel);

		this.container.add(layout);

		// Preview Panel
		this.previewPanel = this.createPreviewPanel();
		this.container.add(this.previewPanel);

		// Footer
		const footer = new TextRenderable(this.renderer, {
			id: "quick-config-footer",
			content: "Tab Switch Panels • ↑↓ Navigate • Enter Select • Ctrl+S Save • Esc Back",
			fg: theme.colors.text.dim,
			attributes: TextAttributes.DIM,
			marginTop: 2,
		});
		this.container.add(footer);

		this.panels = [this.routerTypePanel, this.filterPanel, this.modelsPanel];

		// Set up keyboard navigation
		this.setupKeyboardNavigation();

		// Load initial data
		this.loadModels();
		this.updateFocus();
	}

	private createRouterTypePanel(): Panel {
  const panel = new Panel("router-type-panel", this.renderer, "Router Type");
		panel.getContentArea().width = 25;

		const routerTypeOptions: SelectOption[] = this.routerTypes.map(type => ({
			name: this.formatRouterTypeName(type),
			description: this.getRouterTypeDescription(type),
			value: type,
		}));

		this.routerTypeSelect = new FormSelect("router-type-select", this.renderer, routerTypeOptions);
		this.focusableElements.push(this.routerTypeSelect);
		panel.addContent(this.routerTypeSelect);

		// Current selection display
		const currentText = new TextRenderable(this.renderer, {
			id: "current-router-type",
			content: `Current: ${this.formatRouterTypeName(this.currentRouterType)}`,
			fg: theme.colors.text.dim,
			marginTop: 1,
		});
		panel.addContent(currentText);

		this.routerTypeSelect.on(SelectRenderableEvents.SELECTION_CHANGED, (index: number, option: SelectOption) => {
			this.currentRouterType = option.value as string;
			currentText.content = `Current: ${this.formatRouterTypeName(this.currentRouterType)}`;
			this.loadModels();
		});

		return panel;
	}

	private createFilterPanel(): Panel {
  const panel = new Panel("filter-panel", this.renderer, "Filter & Search");
		panel.getContentArea().width = 30;

		// Provider filter
		const providerOptions: SelectOption[] = [
			{ name: "All Providers", value: "all", description: "Show all available providers" },
			{ name: "Popular", value: "popular", description: "Show popular models only" },
			{ name: "Anthropic", value: "anthropic", description: "Show Anthropic models" },
			{ name: "OpenAI", value: "openai", description: "Show OpenAI models" },
			{ name: "Google", value: "google", description: "Show Google models" },
		];

		this.providerFilter = new FormSelect("provider-filter", this.renderer, providerOptions);
		this.focusableElements.push(this.providerFilter);
		panel.addContent(this.providerFilter);

		// Search input
		this.searchInput = new FormInput("model-search", this.renderer, {
			placeholder: "Search models...",
			marginTop: 1,
		});
		this.focusableElements.push(this.searchInput);
		panel.addContent(this.searchInput);

		// Set up filter events
		this.providerFilter.on(SelectRenderableEvents.SELECTION_CHANGED, () => {
			this.applyFilters();
		});

		this.searchInput.on("input", () => {
			this.applyFilters();
		});

		return panel;
	}

	private createModelsPanel(): Panel {
  const panel = new Panel("models-panel", this.renderer, "Available Models");
		panel.getContentArea().flexGrow = 1;

		// Model selection
		this.modelSelect = new FormSelect("model-select", this.renderer, []);
		this.focusableElements.push(this.modelSelect);
		panel.addContent(this.modelSelect);

		// Model info display
		const modelInfo = new TextRenderable(this.renderer, {
			id: "model-info",
			content: "Select a model to see details",
			fg: theme.colors.text.dim,
			marginTop: 1,
		});
		panel.addContent(modelInfo);

		this.modelSelect.on(SelectRenderableEvents.SELECTION_CHANGED, (index: number, option: SelectOption) => {
			this.updateModelInfo(option);
			this.updatePendingChanges();
		});

		return panel;
	}

	private createPreviewPanel(): Panel {
  const panel = new Panel("preview-panel", this.renderer, "Pending Changes");
		panel.getContentArea().height = 8;

		this.pendingChangesText = new TextRenderable(this.renderer, {
			id: "pending-changes",
			content: "No pending changes",
			fg: theme.colors.text.dim,
		});
		panel.addContent(this.pendingChangesText);

		// Save button
		this.saveButton = new TextRenderable(this.renderer, {
			id: "save-button",
			content: "💾 Save Configuration (Ctrl+S)",
			fg: theme.colors.accent.cyan,
			attributes: TextAttributes.BOLD,
			marginTop: 2,
		});
		panel.addContent(this.saveButton);

		return panel;
	}

	private setupKeyboardNavigation(): void {
		// This method will be called from the parent Screen class
		// Keyboard navigation is handled by the renderer's key events
		// Focus management is done through focusableElements array
	}

	private formatRouterTypeName(type: string): string {
		const names: Record<string, string> = {
			default: "Default",
			background: "Background",
			think: "Think",
			longContext: "Long Context",
		};
		return names[type] || type;
	}

	private getRouterTypeDescription(type: string): string {
		const descriptions: Record<string, string> = {
			default: "Standard requests",
			background: "Background tasks",
			think: "Complex reasoning",
			longContext: "Large context (>60k tokens)",
		};
		return descriptions[type] || "";
	}

	private loadModels(): void {
		// Mock model data - in real implementation, this would load from OpenRouter API
		this.models = [
			{
				name: "anthropic/claude-3.5-sonnet",
				description: "Fast, intelligent responses",
				value: "anthropic/claude-3.5-sonnet",
			},
			{
				name: "google/gemini-2.0-flash",
				description: "Large context, fast processing",
				value: "google/gemini-2.0-flash",
			},
			{
				name: "deepseek-reasoner",
				description: "Advanced reasoning capabilities",
				value: "deepseek-reasoner",
			},
		];

		this.applyFilters();
	}

	private applyFilters(): void {
		let filteredModels = [...this.models];

		// Apply provider filter
		const selectedProvider = this.providerFilter.getSelectedOption()?.value as string;
		if (selectedProvider && selectedProvider !== "all") {
			filteredModels = filteredModels.filter(model => 
				model.name.toLowerCase().includes(selectedProvider.toLowerCase())
			);
		}

		// Apply search filter
		const searchQuery = this.searchInput.value.toLowerCase();
		if (searchQuery) {
			filteredModels = filteredModels.filter(model =>
				model.name.toLowerCase().includes(searchQuery) ||
				model.description?.toLowerCase().includes(searchQuery)
			);
		}

		this.modelSelect.updateOptions(filteredModels);
	}

	private updateModelInfo(option: SelectOption): void {
		// Update model info display
	}

	private updatePendingChanges(): void {
		// Update pending changes display
		this.pendingChangesText.content = "Pending changes detected";
		this.pendingChangesText.fg = theme.colors.warning;
	}

  override update(deltaMs: number): void {
		// Update any animated elements
	}

	override show(): void {
		this.updateFocus();
	}

	override hide(): void {
		// Screen is now hidden
	}

	destroy(): void {
		this.routerTypeSelect.destroy();
		this.providerFilter.destroy();
		this.searchInput.destroy();
		this.modelSelect.destroy();
		this.panels.forEach(panel => panel.destroy());
		this.previewPanel.destroy();
	}
}
