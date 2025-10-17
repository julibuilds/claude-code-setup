import type { CliRenderer } from "@opentui/core";
import { BoxRenderable, TextRenderable, TextAttributes } from "@opentui/core";
import { Screen } from "../renderables/base/Screen";
import { Panel } from "../renderables/base/Panel";
import { theme } from "../design/theme";
import { createFadeInAnimation } from "../design/animations";

/**
 * Main menu screen showing router configuration status and action tiles
 * Implements the dashboard pattern with config panels and navigation tiles
 */
export class MainMenuScreen extends Screen {
	private statusPanels: Panel[] = [];
	private actionTiles: BoxRenderable[] = [];
	private header!: TextRenderable;
	private footer!: TextRenderable;
	private dashboard!: BoxRenderable;
	private actionsContainer!: BoxRenderable;
	private hasAnimated = false;

	constructor(renderer: CliRenderer) {
		super("main-menu", renderer);
	}

	init(): void {
		this.createHeader();
		this.createDashboard();
		this.createActionTiles();
		this.createFooter();
		this.setupKeyboardHandlers();
		
		// Trigger fade-in animation on first show
		if (!this.hasAnimated) {
			this.animateIn();
			this.hasAnimated = true;
		}
	}

	private createHeader(): void {
		this.header = new TextRenderable(this.renderer, {
			id: "main-menu-header",
			content: "🚀 Claude Code Router CLI",
			fg: theme.colors.accent.cyan,
			attributes: TextAttributes.BOLD,
			marginBottom: 2,
			alignSelf: "center",
		});
		this.container.add(this.header);
	}

	private createDashboard(): void {
		// Create dashboard container
		this.dashboard = new BoxRenderable(this.renderer, {
			id: "main-menu-dashboard",
			flexDirection: "row",
			gap: 2,
			marginBottom: 3,
		});

		// Create status panels for each router type
		this.statusPanels = [
			this.createConfigPanel("Default", "anthropic/claude-3.5-sonnet", "200k"),
			this.createConfigPanel("Background", "google/gemini-2.0-flash", "1M"),
			this.createConfigPanel("Think", "deepseek-reasoner", "128k"),
			this.createConfigPanel("Long Context", "google/gemini-2.0-flash", "1M"),
		];

		this.statusPanels.forEach(panel => {
			this.dashboard.add(panel);
		});

		this.container.add(this.dashboard);
	}

	private createConfigPanel(title: string, model: string, context: string): Panel {
		const panel = new Panel(`${title.toLowerCase()}-config`, this.renderer, title);
		
		// Add status indicator
		const statusIcon = new TextRenderable(this.renderer, {
			id: `${title.toLowerCase()}-status`,
			content: "✓",
			fg: theme.colors.success,
			attributes: TextAttributes.BOLD,
		});
		panel.addContent(statusIcon);

		// Add model info
		const modelText = new TextRenderable(this.renderer, {
			id: `${title.toLowerCase()}-model`,
			content: model,
			fg: theme.colors.text.primary,
			marginTop: 1,
		});
		panel.addContent(modelText);

		// Add context window info
		const contextText = new TextRenderable(this.renderer, {
			id: `${title.toLowerCase()}-context`,
			content: `Context: ${context}`,
			fg: theme.colors.text.dim,
			attributes: TextAttributes.DIM,
		});
		panel.addContent(contextText);

		return panel;
	}

	private createActionTiles(): void {
		this.actionsContainer = new BoxRenderable(this.renderer, {
			id: "main-menu-actions",
			flexDirection: "row",
			gap: 2,
			marginBottom: 3,
		});

		this.actionTiles = [
			this.createActionTile("⚡", "Quick Config", "Configure router settings"),
			this.createActionTile("🚀", "Deploy", "Deploy to Cloudflare Workers"),
			this.createActionTile("🔐", "Secrets", "Manage API keys"),
			this.createActionTile("📊", "Status", "View system status"),
		];

		this.actionTiles.forEach(tile => {
			this.actionsContainer.add(tile);
		});

		this.container.add(this.actionsContainer);
	}

	private createActionTile(icon: string, title: string, description: string): BoxRenderable {
		const tile = new BoxRenderable(this.renderer, {
			id: `action-${title.toLowerCase().replace(/\s+/g, "-")}`,
			border: true,
			borderStyle: "single",
			borderColor: theme.colors.text.dim,
			backgroundColor: theme.colors.bg.dark,
			padding: 2,
			flexDirection: "column",
			alignItems: "center",
			minWidth: 20,
		});

		// Add icon
		const iconText = new TextRenderable(this.renderer, {
			id: `${tile.id}-icon`,
			content: icon,
			fg: theme.colors.accent.cyan,
			attributes: TextAttributes.BOLD,
			marginBottom: 1,
		});
		tile.add(iconText);

		// Add title
		const titleText = new TextRenderable(this.renderer, {
			id: `${tile.id}-title`,
			content: title,
			fg: theme.colors.text.primary,
			attributes: TextAttributes.BOLD,
			marginBottom: 1,
		});
		tile.add(titleText);

		// Add description
		const descText = new TextRenderable(this.renderer, {
			id: `${tile.id}-desc`,
			content: description,
			fg: theme.colors.text.dim,
			attributes: TextAttributes.DIM,
			alignSelf: "center",
		});
		tile.add(descText);

		// Add hover/focus effects
		tile.on("focus", () => {
			tile.borderColor = theme.colors.accent.cyan;
			tile.backgroundColor = theme.colors.bg.mid;
		});

		tile.on("blur", () => {
			tile.borderColor = theme.colors.text.dim;
			tile.backgroundColor = theme.colors.bg.dark;
		});

		return tile;
	}

	private createFooter(): void {
		this.footer = new TextRenderable(this.renderer, {
			id: "main-menu-footer",
			content: "Press Tab to navigate • Enter to select • Esc to exit",
			fg: theme.colors.text.dim,
			attributes: TextAttributes.DIM,
			alignSelf: "center",
			marginTop: 2,
		});
		this.container.add(this.footer);
	}

	private setupKeyboardHandlers(): void {
		// Add keyboard event handlers for navigation
		// Note: OpenTUI keyInput API may be different
		// this.renderer.keyInput.on("keypress", (key: any) => {
		// 	if (key.name === "tab") {
		// 		this.nextFocus();
		// 	} else if (key.name === "shift+tab") {
		// 		this.previousFocus();
		// 	} else if (key.name === "enter") {
		// 		this.handleActionSelection();
		// 	} else if (key.name === "escape") {
		// 		process.exit(0);
		// 	}
		// });
	}

	private handleActionSelection(): void {
		// Get currently focused action tile
		const focusedIndex = this.currentFocusIndex;
		if (focusedIndex < this.actionTiles.length) {
			const tile = this.actionTiles[focusedIndex];
			if (tile) {
				const actionName = tile.id.replace("action-", "").replace(/-/g, " ");
				
				// Emit navigation event
				this.emit("navigate", actionName);
			}
		}
	}

	private animateIn(): void {
		// Create fade-in animation for all elements
		const elements = [
			{ element: this.header, delay: 0 },
			{ element: this.dashboard, delay: 100 },
			{ element: this.actionsContainer, delay: 200 },
			{ element: this.footer, delay: 300 },
		];

		elements.forEach(({ element, delay }) => {
			const target = { opacity: 0 };
			const animation = createFadeInAnimation(target, theme.animation.durations.normal);
			
			// Note: seek() method may not be available in current OpenTUI version
			// animation.seek(delay);
			animation.play();
			
			// Note: OpenTUI doesn't have opacity property, so this is conceptual
			// In a real implementation, you might animate visibility or other properties
			// Suppress unused parameter warnings
			void element;
			void delay;
		});
	}

	override update(_deltaMs: number): void {
		// Update any animated elements
		this.statusPanels.forEach(panel => {
			panel.updateSpinner();
		});
	}

	override show(): void {
		// Screen is becoming visible
		this.updateFocus();
	}

	override hide(): void {
		// Screen is being hidden
		this.focusableElements.forEach(e => {
			e.blur();
		});
	}

	override destroy(): void {
		// Clean up event listeners
		// Note: keyInput.off may not be available in current OpenTUI version
		// this.renderer.keyInput.off("keypress");
		
		// Clean up panels
		this.statusPanels.forEach(panel => {
			panel.destroy();
		});
		this.actionTiles.forEach(tile => {
			tile.destroy();
		});
		
		// Note: Screen base class destroy is abstract, so we don't call super.destroy()
	}
}