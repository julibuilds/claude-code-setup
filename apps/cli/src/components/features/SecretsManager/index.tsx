import { type SelectOption, TextAttributes } from "@opentui/core";
import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import { useComponentStyles, useThemeColors } from "@repo/tui";
import { useCallback, useState } from "react";
import { KEYS } from "../../../constants";
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
	const colors = useThemeColors();
	const componentStyles = useComponentStyles();

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
						borderStyle: componentStyles.panel.borderStyle,
						backgroundColor: componentStyles.panel.backgroundColor,
						borderColor: processing ? colors.status.warning : colors.status.success,
					}}
				>
					<text
						style={{
							attributes: TextAttributes.BOLD,
							fg: processing ? colors.status.warning : colors.status.success,
						}}
					>
						{processing ? "🔐 Processing Secrets..." : "✅ Secrets Result"}
					</text>
				</box>

				<scrollbox
					style={{
						rootOptions: { height: height - 12, border: true },
						wrapperOptions: { backgroundColor: componentStyles.elevated.backgroundColor },
						viewportOptions: { backgroundColor: componentStyles.panel.backgroundColor },
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
								? colors.status.success
								: isWarning
									? colors.status.warning
									: colors.text.primary;

							return (
								<text key={item.id} fg={color}>
									{isEmpty ? " " : item.text}
								</text>
							);
						})}
						{error && (
							<box
								style={{
									marginTop: 1,
									padding: 1,
									border: true,
									backgroundColor: componentStyles.panel.backgroundColor,
								}}
							>
								<text style={{ attributes: TextAttributes.BOLD, fg: colors.status.error }}>
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
						borderStyle: componentStyles.panel.borderStyle,
						flexDirection: "column",
						backgroundColor: componentStyles.panel.backgroundColor,
						borderColor: colors.border.muted,
					}}
				>
					<text
						style={{
							attributes: TextAttributes.BOLD,
							fg: colors.accent.secondary,
							marginBottom: 1,
						}}
					>
						⌨️ Keyboard Shortcuts
					</text>
					<text fg={colors.text.primary}>
						{processing ? "Processing..." : "ESC Back to menu"}
					</text>
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
						borderStyle: componentStyles.panel.borderStyle,
						flexDirection: "column",
						backgroundColor: componentStyles.panel.backgroundColor,
						borderColor: colors.accent.primary,
					}}
				>
					<text
						style={{
							attributes: TextAttributes.BOLD,
							fg: colors.accent.primary,
							marginBottom: 1,
						}}
					>
						🔐 Set Worker Secret
					</text>
					<text fg={colors.text.primary}>Configure secrets for Cloudflare Workers</text>
				</box>

				<box style={{ flexDirection: "column", gap: 2 }}>
					<box
						title={isFocused("key") ? "▶ Secret Key" : "Secret Key"}
						style={{
							border: true,
							borderStyle: componentStyles.input.borderStyle,
							height: 3,
							backgroundColor: isFocused("key")
								? componentStyles.panel.backgroundColor
								: componentStyles.elevated.backgroundColor,
							borderColor: isFocused("key") ? colors.border.focus : colors.text.muted,
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
							borderStyle: componentStyles.input.borderStyle,
							height: 3,
							backgroundColor: isFocused("value")
								? componentStyles.panel.backgroundColor
								: componentStyles.elevated.backgroundColor,
							borderColor: isFocused("value") ? colors.border.focus : colors.text.muted,
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
							borderStyle: componentStyles.panel.borderStyle,
							borderColor: colors.border.muted,
							backgroundColor: componentStyles.elevated.backgroundColor,
						}}
					>
						<text style={{ fg: colors.text.muted }}>
							{showSecret ? "🔓 Secret visible" : "🔒 Secret hidden"} • Press Ctrl+H to
							toggle
						</text>
					</box>
				</box>

				{error && (
					<box
						style={{
							marginTop: 2,
							padding: 2,
							border: true,
							borderStyle: componentStyles.panel.borderStyle,
							backgroundColor: componentStyles.panel.backgroundColor,
							borderColor: colors.status.error,
						}}
					>
						<text style={{ attributes: TextAttributes.BOLD, fg: colors.status.error }}>
							❌ Error: {error}
						</text>
					</box>
				)}

				<box
					style={{
						marginTop: 2,
						padding: 2,
						border: true,
						borderStyle: componentStyles.panel.borderStyle,
						flexDirection: "column",
						backgroundColor: componentStyles.panel.backgroundColor,
						borderColor: colors.border.muted,
					}}
				>
					<text
						style={{
							attributes: TextAttributes.BOLD,
							fg: colors.accent.secondary,
							marginBottom: 1,
						}}
					>
						⌨️ Keyboard Shortcuts
					</text>
					<text fg={colors.text.primary}>
						Tab Switch • Enter Submit • Ctrl+H Toggle Secret • ESC Back
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
					borderStyle: componentStyles.panel.borderStyle,
					flexDirection: "column",
					backgroundColor: componentStyles.panel.backgroundColor,
					borderColor: colors.accent.primary,
				}}
			>
				<text
					style={{
						attributes: TextAttributes.BOLD,
						fg: colors.accent.primary,
						marginBottom: 1,
					}}
				>
					🔐 Manage Cloudflare Workers Secrets
				</text>
				<text fg={colors.text.primary}>Configure and view environment secrets</text>
			</box>

			<box
				style={{
					border: true,
					borderStyle: componentStyles.panel.borderStyle,
					height: height - 12,
					backgroundColor: componentStyles.elevated.backgroundColor,
				}}
			>
				<select
					style={{
						height: height - 14,
						backgroundColor: componentStyles.elevated.backgroundColor,
						focusedBackgroundColor: componentStyles.list.item.hoverBackgroundColor,
						textColor: colors.text.primary,
						focusedTextColor: colors.accent.primary,
						selectedBackgroundColor: colors.accent.primary,
						selectedTextColor: colors.background.main,
						descriptionColor: colors.text.muted,
						selectedDescriptionColor: colors.text.primary,
					}}
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
					borderStyle: componentStyles.panel.borderStyle,
					flexDirection: "column",
					backgroundColor: componentStyles.panel.backgroundColor,
					borderColor: colors.border.muted,
				}}
			>
				<text
					style={{
						attributes: TextAttributes.BOLD,
						fg: colors.accent.secondary,
						marginBottom: 1,
					}}
				>
					⌨️ Keyboard Shortcuts
				</text>
				<text fg={colors.text.primary}>↑↓ Navigate • Enter Select • ESC Back</text>
			</box>
		</box>
	);
}
