import type { CliRenderer } from "@opentui/core";
import { TextRenderable, TextAttributes } from "@opentui/core";
import { Screen } from "../renderables/base/Screen";
import { Panel } from "../renderables/base/Panel";
import { FormInput } from "../renderables/base/FormInput";
import { FormSelect } from "../renderables/base/FormSelect";
import { theme } from "../design/theme";

/**
 * Secrets manager screen for managing Cloudflare Workers secrets
 * Shows secret list, add/edit/delete operations, and audit trail
 */
export class SecretsManagerScreen extends Screen {
	private secretsPanel!: Panel;
	private actionsPanel!: Panel;
	private auditPanel!: Panel;

	// Secret management
	private secretsList!: FormSelect;
	private secretNameInput!: FormInput;
	private secretValueInput!: FormInput;
	private addButton!: TextRenderable;
	private editButton!: TextRenderable;
	private deleteButton!: TextRenderable;

	// Secret data
	private secrets: Array<{
		name: string;
		value: string;
		lastUpdated: Date;
		masked: boolean;
	}> = [];

	// Audit trail
	private auditText!: TextRenderable;
	private auditLogs: string[] = [];
	
	// Secret details
	private secretDetailsText!: TextRenderable;

	constructor(renderer: CliRenderer) {
		super("secrets-manager", renderer);
	}

	init(): void {
		// Create header
		const header = new TextRenderable(this.renderer, {
			id: "secrets-header",
			content: "🔐 Secrets Manager",
			fg: theme.colors.accent.cyan,
			attributes: TextAttributes.BOLD,
			marginBottom: 2,
		});
		this.container.add(header);

		// Create main layout
  const layout = new Panel("secrets-layout", this.renderer, "Secrets Dashboard");
		layout.getContentArea().flexDirection = "row";
		layout.getContentArea().gap = 2;

		// Secrets Panel
		this.secretsPanel = this.createSecretsPanel();
		layout.addContent(this.secretsPanel);

		// Actions Panel
		this.actionsPanel = this.createActionsPanel();
		layout.addContent(this.actionsPanel);

		this.container.add(layout);

		// Audit Panel
		this.auditPanel = this.createAuditPanel();
		this.container.add(this.auditPanel);

		// Footer
		const footer = new TextRenderable(this.renderer, {
			id: "secrets-footer",
			content: "↑↓ Navigate • Enter Select • A Add • E Edit • D Delete • Esc Back",
			fg: theme.colors.text.dim,
			attributes: TextAttributes.DIM,
			marginTop: 2,
		});
		this.container.add(footer);

		// Load secrets
		this.loadSecrets();

		// Set up keyboard handlers
		this.setupKeyboardHandlers();
	}

	private createSecretsPanel(): Panel {
  const panel = new Panel("secrets-panel", this.renderer, "Cloudflare Workers Secrets");
		panel.getContentArea().flexGrow = 1;

		// Secrets list
		this.secretsList = new FormSelect("secrets-list", this.renderer, []);
		this.focusableElements.push(this.secretsList);
		panel.addContent(this.secretsList);

		// Secret details
		this.secretDetailsText = new TextRenderable(this.renderer, {
			id: "secret-details",
			content: "Select a secret to view details",
			fg: theme.colors.text.dim,
			marginTop: 1,
		});
		panel.addContent(this.secretDetailsText);

		this.secretsList.on("selectionChanged", (index: number, option: any) => {
			this.showSecretDetails(option.value);
		});

		return panel;
	}

	private createActionsPanel(): Panel {
  const panel = new Panel("actions-panel", this.renderer, "Actions");
		panel.getContentArea().width = 30;

		// Secret name input
		const nameLabel = new TextRenderable(this.renderer, {
			id: "name-label",
			content: "Secret Name:",
			fg: theme.colors.text.primary,
			marginBottom: 1,
		});
		panel.addContent(nameLabel);

		this.secretNameInput = new FormInput("secret-name", this.renderer, {
			placeholder: "e.g., OPENROUTER_API_KEY",
		});
		this.focusableElements.push(this.secretNameInput);
		panel.addContent(this.secretNameInput);

		// Secret value input
		const valueLabel = new TextRenderable(this.renderer, {
			id: "value-label",
			content: "Secret Value:",
			fg: theme.colors.text.primary,
			marginTop: 1,
			marginBottom: 1,
		});
		panel.addContent(valueLabel);

		this.secretValueInput = new FormInput("secret-value", this.renderer, {
			placeholder: "Enter secret value...",
		});
		this.focusableElements.push(this.secretValueInput);
		panel.addContent(this.secretValueInput);

		// Action buttons
		this.addButton = new TextRenderable(this.renderer, {
			id: "add-button",
			content: "➕ Add Secret",
			fg: theme.colors.success,
			attributes: TextAttributes.BOLD,
			marginTop: 2,
		});
		panel.addContent(this.addButton);

		this.editButton = new TextRenderable(this.renderer, {
			id: "edit-button",
			content: "✏️ Edit Secret",
			fg: theme.colors.warning,
			attributes: TextAttributes.BOLD,
			marginTop: 1,
		});
		panel.addContent(this.editButton);

		this.deleteButton = new TextRenderable(this.renderer, {
			id: "delete-button",
			content: "🗑️ Delete Secret",
			fg: theme.colors.error,
			attributes: TextAttributes.BOLD,
			marginTop: 1,
		});
		panel.addContent(this.deleteButton);

		return panel;
	}

	private createAuditPanel(): Panel {
  const panel = new Panel("audit-panel", this.renderer, "Audit Trail");
		panel.getContentArea().height = 8;

		this.auditText = new TextRenderable(this.renderer, {
			id: "audit-logs",
			content: "Audit logs will appear here...",
			fg: theme.colors.text.dim,
		});
		panel.addContent(this.auditText);

		return panel;
	}

	private loadSecrets(): void {
		// Mock secrets data - in real implementation, this would load from Cloudflare Workers
		this.secrets = [
			{
				name: "OPENROUTER_API_KEY",
				value: "sk-or-v1-...",
				lastUpdated: new Date(Date.now() - 86400000), // 1 day ago
				masked: true,
			},
			{
				name: "DEEPSEEK_API_KEY",
				value: "sk-...",
				lastUpdated: new Date(Date.now() - 172800000), // 2 days ago
				masked: true,
			},
		];

		this.updateSecretsList();
		this.addAuditLog("Loaded secrets from Cloudflare Workers");
	}

	private updateSecretsList(): void {
		const options = this.secrets.map(secret => ({
			name: secret.name,
			description: `Updated: ${secret.lastUpdated.toLocaleDateString()}`,
			value: secret.name,
		}));

		this.secretsList.updateOptions(options);
	}

	private showSecretDetails(secretName: string): void {
		const secret = this.secrets.find(s => s.name === secretName);
		if (!secret) return;

		this.secretDetailsText.content = `Name: ${secret.name}\nLast Updated: ${secret.lastUpdated.toLocaleString()}\nMasked: ${secret.masked ? "Yes" : "No"}`;
		this.secretDetailsText.fg = theme.colors.text.primary;
	}

	private addAuditLog(message: string): void {
		const timestamp = new Date().toLocaleString();
		this.auditLogs.push(`[${timestamp}] ${message}`);
		
		// Keep only last 20 logs
		if (this.auditLogs.length > 20) {
			this.auditLogs = this.auditLogs.slice(-20);
		}

		// Update display
		this.auditText.content = this.auditLogs.join("\n");
	}

	private async addSecret(): Promise<void> {
		const name = this.secretNameInput.value.trim();
		const value = this.secretValueInput.value.trim();

		if (!name || !value) {
			this.addAuditLog("❌ Failed to add secret: Name and value required");
			return;
		}

		// Check if secret already exists
		if (this.secrets.some(s => s.name === name)) {
			this.addAuditLog(`❌ Failed to add secret: ${name} already exists`);
			return;
		}

		// Add secret
		this.secrets.push({
			name,
			value,
			lastUpdated: new Date(),
			masked: true,
		});

		this.updateSecretsList();
		this.clearInputs();
		this.addAuditLog(`✅ Added secret: ${name}`);
	}

	private async editSecret(): Promise<void> {
		const selectedSecret = this.secretsList.getSelectedOption();
		if (!selectedSecret) {
			this.addAuditLog("❌ No secret selected for editing");
			return;
		}

		const name = this.secretNameInput.value.trim();
		const value = this.secretValueInput.value.trim();

		if (!name || !value) {
			this.addAuditLog("❌ Failed to edit secret: Name and value required");
			return;
		}

		// Update secret
		const secret = this.secrets.find(s => s.name === selectedSecret.value);
		if (secret) {
			secret.name = name;
			secret.value = value;
			secret.lastUpdated = new Date();
		}

		this.updateSecretsList();
		this.clearInputs();
		this.addAuditLog(`✅ Edited secret: ${name}`);
	}

	private async deleteSecret(): Promise<void> {
		const selectedSecret = this.secretsList.getSelectedOption();
		if (!selectedSecret) {
			this.addAuditLog("❌ No secret selected for deletion");
			return;
		}

		// Remove secret
		this.secrets = this.secrets.filter(s => s.name !== selectedSecret.value);
		this.updateSecretsList();
		this.clearInputs();
		this.addAuditLog(`✅ Deleted secret: ${selectedSecret.value}`);
	}

	private clearInputs(): void {
		this.secretNameInput.value = "";
		this.secretValueInput.value = "";
	}

	private setupKeyboardHandlers(): void {
		// A key - Add secret
		// E key - Edit secret
		// D key - Delete secret
		// Esc key - Go back
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
		this.secretsList.destroy();
		this.secretNameInput.destroy();
		this.secretValueInput.destroy();
		this.secretsPanel.destroy();
		this.actionsPanel.destroy();
		this.auditPanel.destroy();
	}
}
