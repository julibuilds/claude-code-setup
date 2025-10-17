import type { CliRenderer } from "@opentui/core";
import { TextRenderable, TextAttributes } from "@opentui/core";
import { Screen } from "../renderables/base/Screen";
import { Panel } from "../renderables/base/Panel";
import { ProgressBar } from "../renderables/animated/ProgressBar";
import { Spinner } from "../renderables/animated/Spinner";
import { theme } from "../design/theme";

/**
 * Deploy manager screen with pre-flight checklist and progress visualization
 * Shows deployment status, logs, and rollback options
 */
export class DeployManagerScreen extends Screen {
	private checklistPanel!: Panel;
	private progressPanel!: Panel;
	private logsPanel!: Panel;
	private statusPanel!: Panel;

	// Pre-flight checklist
	private checklistItems: Array<{
		name: string;
		status: "pending" | "checking" | "success" | "error";
		text: TextRenderable;
	}> = [];

	// Progress tracking
	private progressBar!: ProgressBar;
	private statusText!: TextRenderable;
	private spinner!: Spinner;

	// Deployment logs
	private logsText!: TextRenderable;
	private logs: string[] = [];

	// Status and actions
	private deployButton!: TextRenderable;
	private rollbackButton!: TextRenderable;

	constructor(renderer: CliRenderer) {
		super("deploy-manager", renderer);
	}

	init(): void {
		// Create header
		const header = new TextRenderable(this.renderer, {
			id: "deploy-header",
			content: "🚀 Deployment Manager",
			fg: theme.colors.accent.cyan,
			attributes: TextAttributes.BOLD,
			marginBottom: 2,
		});
		this.container.add(header);

		// Create main layout
  const layout = new Panel("deploy-layout", this.renderer, "Deployment Dashboard");
		layout.getContentArea().flexDirection = "row";
		layout.getContentArea().gap = 2;

		// Checklist Panel
		this.checklistPanel = this.createChecklistPanel();
		layout.addContent(this.checklistPanel);

		// Progress Panel
		this.progressPanel = this.createProgressPanel();
		layout.addContent(this.progressPanel);

		this.container.add(layout);

		// Logs Panel
		this.logsPanel = this.createLogsPanel();
		this.container.add(this.logsPanel);

		// Status Panel
		this.statusPanel = this.createStatusPanel();
		this.container.add(this.statusPanel);

		// Footer
		const footer = new TextRenderable(this.renderer, {
			id: "deploy-footer",
			content: "Enter Deploy • R Rollback • Esc Back",
			fg: theme.colors.text.dim,
			attributes: TextAttributes.DIM,
			marginTop: 2,
		});
		this.container.add(footer);

		// Initialize checklist
		this.initializeChecklist();

		// Set up keyboard handlers
		this.setupKeyboardHandlers();
	}

	private createChecklistPanel(): Panel {
  const panel = new Panel("checklist-panel", this.renderer, "Pre-flight Checklist");
		panel.getContentArea().width = 35;

		// Checklist items will be added dynamically
		return panel;
	}

	private createProgressPanel(): Panel {
  const panel = new Panel("progress-panel", this.renderer, "Deployment Progress");
		panel.getContentArea().width = 40;

		// Progress bar
		this.progressBar = new ProgressBar("deploy-progress", this.renderer);
		panel.addContent(this.progressBar);

		// Status text
		this.statusText = new TextRenderable(this.renderer, {
			id: "deploy-status",
			content: "Ready to deploy",
			fg: theme.colors.text.primary,
			marginTop: 1,
		});
		panel.addContent(this.statusText);

		// Spinner
		this.spinner = new Spinner("deploy-spinner", this.renderer);
		panel.addContent(this.spinner);

		return panel;
	}

	private createLogsPanel(): Panel {
  const panel = new Panel("logs-panel", this.renderer, "Deployment Logs");
		panel.getContentArea().height = 12;

		this.logsText = new TextRenderable(this.renderer, {
			id: "deploy-logs",
			content: "Deployment logs will appear here...",
			fg: theme.colors.text.dim,
		});
		panel.addContent(this.logsText);

		return panel;
	}

	private createStatusPanel(): Panel {
  const panel = new Panel("status-panel", this.renderer, "Actions & Status");
		panel.getContentArea().height = 8;

		// Deploy button
		this.deployButton = new TextRenderable(this.renderer, {
			id: "deploy-button",
			content: "🚀 Deploy to Cloudflare Workers",
			fg: theme.colors.accent.cyan,
			attributes: TextAttributes.BOLD,
			marginBottom: 1,
		});
		panel.addContent(this.deployButton);

		// Rollback button
		this.rollbackButton = new TextRenderable(this.renderer, {
			id: "rollback-button",
			content: "↩️ Rollback to Previous Version",
			fg: theme.colors.warning,
			attributes: TextAttributes.BOLD,
		});
		panel.addContent(this.rollbackButton);

		return panel;
	}

	private initializeChecklist(): void {
		const checklistItems = [
			{ name: "Configuration File", key: "config" },
			{ name: "API Keys Set", key: "secrets" },
			{ name: "Wrangler Config", key: "wrangler" },
			{ name: "Network Connectivity", key: "network" },
		];

		checklistItems.forEach((item, index) => {
			const text = new TextRenderable(this.renderer, {
				id: `checklist-${item.key}`,
				content: `⏳ ${item.name}`,
				fg: theme.colors.text.dim,
				marginBottom: 1,
			});

			this.checklistItems.push({
				name: item.name,
				status: "pending",
				text,
			});

			this.checklistPanel.addContent(text);
		});

		// Start checking items
		this.runPreflightChecks();
	}

	private async runPreflightChecks(): Promise<void> {
		for (let i = 0; i < this.checklistItems.length; i++) {
			const item = this.checklistItems[i];
			if (!item) continue;
			
			// Set checking status
			item.status = "checking";
			item.text.content = `🔄 ${item.name}`;
			item.text.fg = theme.colors.info;

			// Simulate check delay
			await new Promise(resolve => setTimeout(resolve, 500));

			// Set result (mock success for now)
			item.status = "success";
			item.text.content = `✅ ${item.name}`;
			item.text.fg = theme.colors.success;
		}

		// All checks complete
		this.statusText.content = "Pre-flight checks complete - Ready to deploy";
		this.statusText.fg = theme.colors.success;
	}

	private setupKeyboardHandlers(): void {
		// Enter key triggers deployment
		// R key triggers rollback
		// Esc key goes back
	}

	private async startDeployment(): Promise<void> {
		this.statusText.content = "Starting deployment...";
		this.statusText.fg = theme.colors.info;
		this.spinner.start();

		// Simulate deployment stages
		const stages = [
			{ name: "Building", progress: 25 },
			{ name: "Uploading", progress: 50 },
			{ name: "Deploying", progress: 75 },
			{ name: "Verifying", progress: 100 },
		];

		for (const stage of stages) {
			this.addLog(`Starting ${stage.name}...`);
			this.progressBar.setProgress(stage.progress);
			this.progressBar.setLabel(`${stage.name} (${stage.progress}%)`);
			
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			this.addLog(`✅ ${stage.name} completed`);
		}

		this.spinner.stop();
		this.statusText.content = "Deployment successful!";
		this.statusText.fg = theme.colors.success;
		this.addLog("🎉 Deployment completed successfully!");
	}

	private addLog(message: string): void {
		const timestamp = new Date().toLocaleTimeString();
		this.logs.push(`[${timestamp}] ${message}`);
		
		// Keep only last 50 logs
		if (this.logs.length > 50) {
			this.logs = this.logs.slice(-50);
		}

		// Update display
		this.logsText.content = this.logs.join("\n");
	}

  override update(deltaMs: number): void {
		this.spinner.update(deltaMs);
	}

  override show(): void {
		this.updateFocus();
	}

  override hide(): void {
		// Screen is now hidden
	}

	destroy(): void {
		this.progressBar.destroy();
		this.spinner.destroy();
		this.checklistItems.forEach(item => item.text.destroy());
		this.checklistPanel.destroy();
		this.progressPanel.destroy();
		this.logsPanel.destroy();
		this.statusPanel.destroy();
	}
}
