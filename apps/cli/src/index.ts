import { createCliRenderer, type CliRenderer } from "@opentui/core";
import { ScreenController } from "./renderables/ScreenController";
import { MainMenuScreen } from "./screens/MainMenuScreen";
import { loadEnv } from "./utils/env";

/**
 * Main application entry point using OpenTUI Core Edition
 * Implements ScreenController pattern for multi-screen navigation
 */
class App {
	private renderer: CliRenderer;
	private screenController: ScreenController;
	private mainMenuScreen: MainMenuScreen;

	constructor() {
		// Note: createCliRenderer is async, so we'll initialize in init()
		this.renderer = null as any;
		this.screenController = null as any;
		this.mainMenuScreen = null as any;
	}

	async init(): Promise<void> {
		// Load environment variables
		await loadEnv();

		// Create renderer
		this.renderer = await createCliRenderer();

		// Initialize components
		this.screenController = new ScreenController("app-controller", this.renderer);
		this.mainMenuScreen = new MainMenuScreen(this.renderer);

		// Register screens
		this.screenController.registerScreen("main-menu", this.mainMenuScreen);

		// Set up navigation handlers
		this.setupNavigationHandlers();

		// Start with main menu
		this.screenController.switchToScreen("main-menu");

		// Start the renderer
		this.renderer.start();
	}

	private setupNavigationHandlers(): void {
		// Handle navigation events from screens
		this.mainMenuScreen.on("navigate", (screenName: string) => {
			this.handleNavigation(screenName);
		});

		// Global keyboard handlers
		// Note: OpenTUI keyInput API may be different
		// this.renderer.keyInput.on("keypress", (key) => {
		// 	if (key.name === "escape") {
		// 		this.handleEscape();
		// 	}
		// });
	}

	private handleNavigation(screenName: string): void {
		switch (screenName) {
			case "quick config":
				console.log("Navigating to Quick Config screen");
				// TODO: Implement QuickConfigScreen
				break;
			case "deploy":
				console.log("Navigating to Deploy screen");
				// TODO: Implement DeployManagerScreen
				break;
			case "secrets":
				console.log("Navigating to Secrets screen");
				// TODO: Implement SecretsManagerScreen
				break;
			case "status":
				console.log("Navigating to Status screen");
				// TODO: Implement StatusScreen
				break;
			default:
				console.log(`Unknown navigation target: ${screenName}`);
		}
	}

	private handleEscape(): void {
		const currentScreen = this.screenController.getCurrentScreenId();
		if (currentScreen === "main-menu") {
			this.exit();
		} else {
			// Return to main menu
			this.screenController.switchToScreen("main-menu");
		}
	}

	private exit(): void {
		console.log("Exiting Claude Code Router CLI...");
		this.cleanup();
		process.exit(0);
	}

	private cleanup(): void {
		// Clean up resources
		this.screenController.destroy();
		this.renderer.destroy();
	}

	// Handle process signals for graceful shutdown
	setupSignalHandlers(): void {
		process.on("SIGINT", () => {
			console.log("\nReceived SIGINT, shutting down gracefully...");
			this.exit();
		});

		process.on("SIGTERM", () => {
			console.log("\nReceived SIGTERM, shutting down gracefully...");
			this.exit();
		});

		process.on("SIGHUP", () => {
			console.log("\nReceived SIGHUP, shutting down gracefully...");
			this.exit();
		});
	}
}

// Create and start the application
const app = new App();

// Set up signal handlers
app.setupSignalHandlers();

// Initialize and start the app
app.init().catch((error) => {
	console.error("Failed to initialize application:", error);
	process.exit(1);
});