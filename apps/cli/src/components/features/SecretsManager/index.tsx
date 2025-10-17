import { type SelectOption, TextAttributes } from "@opentui/core";
import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import { useCallback, useState } from "react";
import { KEYS } from "../../../constants";
import { theme } from "../../../design/theme";
import { useFocusManager } from "../../../hooks/useFocusManager";
import { listWorkerSecrets, setWorkerSecret } from "../../../utils/secrets";

interface SecretsManagerProps {
	onBack: () => void;
}

type FocusedField = "menu" | "key" | "value";

export function SecretsManager(_props: SecretsManagerProps) {
	const { width, height } = useTerminalDimensions();
	const [action, setAction] = useState<"menu" | "set" | "list">("menu");
	const [secretKey, setSecretKey] = useState("");
	const [secretValue, setSecretValue] = useState("");
	const [showSecret, setShowSecret] = useState(false);
	const [output, setOutput] = useState<Array<{ id: string; text: string }>>([]);
	const [error, setError] = useState<string | null>(null);
	const [processing, setProcessing] = useState(false);

	// Use unified focus manager for form fields
	const { isFocused } = useFocusManager<FocusedField>({
		initialFocus: "menu",
		items: ["key", "value"],
		enableTab: action === "set",
	});

	useKeyboard((key) => {
		if (key.name === KEYS.ESCAPE && action !== "menu") {
			setAction("menu");
			setSecretKey("");
			setSecretValue("");
			setShowSecret(false);
			setOutput([]);
			setError(null);
		}

		// Toggle secret visibility with Ctrl+H
		if (key.ctrl && key.name === "h" && action === "set") {
			setShowSecret((prev) => !prev);
		}
	});

	const handleSetSecret = useCallback(async () => {
		if (!secretKey || !secretValue) {
			setError("Both key and value are required");
			return;
		}

		setProcessing(true);
		setOutput([]);
		setError(null);

		try {
			setOutput((prev) => [
				...prev,
				{ id: `${Date.now()}-0`, text: `Setting secret: ${secretKey}...` },
			]);

			const result = await setWorkerSecret(secretKey, secretValue);

			if (result.success) {
				const messages = [
					{ id: `${Date.now()}-empty`, text: "" },
					{ id: `${Date.now()}-success`, text: "✓ Secret set successfully in Cloudflare Workers!" },
				];

				if (result.localFileUpdated) {
					messages.push({
						id: `${Date.now()}-local`,
						text: "✓ Local .dev.vars file updated",
					});
				}

				if (result.error) {
					messages.push({
						id: `${Date.now()}-warning`,
						text: `⚠ Warning: ${result.error}`,
					});
				}

				setOutput((prev) => [...prev, ...messages]);
				setSecretKey("");
				setSecretValue("");
			} else {
				setError(result.error || "Failed to set secret");
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to set secret");
		} finally {
			setProcessing(false);
		}
	}, [secretKey, secretValue]);

	const handleListSecrets = useCallback(async () => {
		setProcessing(true);
		setOutput([]);
		setError(null);

		try {
			setOutput((prev) => [...prev, { id: `${Date.now()}-fetch`, text: "Fetching secrets..." }]);

			const secrets = await listWorkerSecrets();
			const secretItems = [
				{ id: `${Date.now()}-empty`, text: "" },
				{ id: `${Date.now()}-header`, text: "Configured secrets:" },
				...secrets.map((s, i) => ({ id: `${Date.now()}-secret-${i}`, text: s })),
			];
			setOutput((prev) => [...prev, ...secretItems]);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to list secrets");
		} finally {
			setProcessing(false);
		}
	}, []);

	if (action === "list" || (action === "set" && (processing || output.length > 0))) {
		return (
			<box
				style={{
					flexDirection: "column",
					width: Math.min(100, width - 4),
					height: height - 4,
					padding: 2,
				}}
			>
				<box
					style={{
						marginBottom: 2,
						padding: 2,
						border: true,
						backgroundColor: theme.colors.bg.dark,
						borderColor: processing ? theme.colors.warning : theme.colors.success,
					}}
				>
					<text
						style={{
							attributes: TextAttributes.BOLD,
							fg: processing ? theme.colors.warning : theme.colors.success,
						}}
					>
						{processing ? "🔐 Processing Secrets..." : "✅ Secrets Result"}
					</text>
				</box>

				<scrollbox
					style={{
						rootOptions: { height: height - 12, border: true },
						wrapperOptions: { backgroundColor: theme.colors.bg.mid },
						viewportOptions: { backgroundColor: theme.colors.bg.dark },
						scrollbarOptions: { showArrows: true },
					}}
					focused
				>
					<box style={{ flexDirection: "column", padding: 2 }}>
						{output.map((item) => {
							const isSuccess = item.text.startsWith("✓");
							const isWarning = item.text.startsWith("⚠");
							const isEmpty = item.text.trim() === "";
							const color = isSuccess 
								? theme.colors.success 
								: isWarning 
								? theme.colors.warning 
								: theme.colors.text.primary;
							
							return (
								<text key={item.id} fg={color}>
									{isEmpty ? " " : item.text}
								</text>
							);
						})}
						{error && (
							<box style={{ marginTop: 1, padding: 1, border: true, backgroundColor: theme.colors.bg.dark }}>
								<text style={{ attributes: TextAttributes.BOLD, fg: theme.colors.error }}>
									❌ Error: {error}
								</text>
							</box>
						)}
					</box>
				</scrollbox>

				<box
					style={{
						marginTop: 2,
						padding: 2,
						border: true,
						flexDirection: "column",
						backgroundColor: theme.colors.bg.dark,
						borderColor: theme.colors.text.veryDim,
					}}
				>
					<text style={{ attributes: TextAttributes.BOLD, fg: theme.colors.accent.purple, marginBottom: 1 }}>
						⌨️  Keyboard Shortcuts
					</text>
					<text fg={theme.colors.text.primary}>{processing ? "Processing..." : "ESC Back to menu"}</text>
				</box>
			</box>
		);
	}

	if (action === "set") {
		return (
			<box
				style={{
					flexDirection: "column",
					width: Math.min(80, width - 4),
					height: height - 4,
					padding: 2,
				}}
			>
				<box
					style={{
						marginBottom: 2,
						padding: 2,
						border: true,
						flexDirection: "column",
						backgroundColor: theme.colors.bg.dark,
						borderColor: theme.colors.accent.cyan,
					}}
				>
					<text
						style={{
							attributes: TextAttributes.BOLD,
							fg: theme.colors.accent.cyan,
							marginBottom: 1,
						}}
					>
						🔐 Set Worker Secret
					</text>
					<text fg={theme.colors.text.primary}>Configure secrets for Cloudflare Workers</text>
				</box>

				<box style={{ flexDirection: "column", gap: 2 }}>
					<box
						title={isFocused("key") ? "▶ Secret Key" : "Secret Key"}
						style={{
							border: true,
							height: 3,
							backgroundColor: isFocused("key") ? theme.colors.bg.dark : theme.colors.bg.mid,
							borderColor: isFocused("key") ? theme.colors.accent.cyan : theme.colors.text.dim,
						}}
					>
						<input
							placeholder="e.g., OPENROUTER_API_KEY"
							onInput={setSecretKey}
							onSubmit={handleSetSecret}
							focused={isFocused("key")}
						/>
					</box>

					<box
						title={isFocused("value") ? "▶ Secret Value" : "Secret Value"}
						style={{
							border: true,
							height: 3,
							backgroundColor: isFocused("value") ? theme.colors.bg.dark : theme.colors.bg.mid,
							borderColor: isFocused("value") ? theme.colors.accent.cyan : theme.colors.text.dim,
						}}
					>
						<input
							placeholder={showSecret ? "Enter secret value..." : "••••••••"}
							onInput={setSecretValue}
							onSubmit={handleSetSecret}
							focused={isFocused("value")}
						/>
					</box>

					{/* Secret visibility hint */}
					<box
						style={{
							padding: 1,
							border: true,
							borderColor: theme.colors.text.veryDim,
							backgroundColor: theme.colors.bg.mid,
						}}
					>
						<text style={{ fg: theme.colors.text.dim }}>
							{showSecret ? "🔓 Secret visible" : "🔒 Secret hidden"} • Press Ctrl+H to toggle
						</text>
					</box>
				</box>

				{error && (
					<box
						style={{
							marginTop: 2,
							padding: 2,
							border: true,
							backgroundColor: theme.colors.bg.dark,
							borderColor: theme.colors.error,
						}}
					>
						<text style={{ attributes: TextAttributes.BOLD, fg: theme.colors.error }}>
							❌ Error: {error}
						</text>
					</box>
				)}

				<box
					style={{
						marginTop: 2,
						padding: 2,
						border: true,
						flexDirection: "column",
						backgroundColor: theme.colors.bg.dark,
						borderColor: theme.colors.text.veryDim,
					}}
				>
					<text style={{ attributes: TextAttributes.BOLD, fg: theme.colors.accent.purple, marginBottom: 1 }}>
						⌨️  Keyboard Shortcuts
					</text>
					<text fg={theme.colors.text.primary}>
						Tab Switch  •  Enter Submit  •  Ctrl+H Toggle Secret  •  ESC Back
					</text>
				</box>
			</box>
		);
	}

	// Menu
	const options: SelectOption[] = [
		{
			name: "🔑 Set Secret",
			description: "Set a new secret or update existing one",
			value: "set",
		},
		{
			name: "📋 List Secrets",
			description: "View all configured secrets",
			value: "list",
		},
	];

	return (
		<box
			style={{
				flexDirection: "column",
				width: Math.min(80, width - 4),
				height: height - 4,
				padding: 2,
			}}
		>
			<box
				style={{
					marginBottom: 2,
					padding: 2,
					border: true,
					flexDirection: "column",
					backgroundColor: theme.colors.bg.dark,
					borderColor: theme.colors.accent.cyan,
				}}
			>
				<text
					style={{
						attributes: TextAttributes.BOLD,
						fg: theme.colors.accent.cyan,
						marginBottom: 1,
					}}
				>
					🔐 Manage Cloudflare Workers Secrets
				</text>
				<text fg={theme.colors.text.primary}>Configure and view environment secrets</text>
			</box>

			<box style={{ border: true, height: height - 12, backgroundColor: theme.colors.bg.mid }}>
				<select
					style={{ height: height - 14 }}
					options={options}
					focused={true}
					onChange={(_, option) => {
						if (option) {
							if (option.value === "set") {
								setAction("set");
							} else if (option.value === "list") {
								setAction("list");
								handleListSecrets();
							}
						}
					}}
					showScrollIndicator
				/>
			</box>

			<box
				style={{
					marginTop: 2,
					padding: 2,
					border: true,
					flexDirection: "column",
					backgroundColor: theme.colors.bg.dark,
					borderColor: theme.colors.text.veryDim,
				}}
			>
				<text style={{ attributes: TextAttributes.BOLD, fg: theme.colors.accent.purple, marginBottom: 1 }}>
					⌨️  Keyboard Shortcuts
				</text>
				<text fg={theme.colors.text.primary}>↑↓ Navigate  •  Enter Select  •  ESC Back</text>
			</box>
		</box>
	);
}
