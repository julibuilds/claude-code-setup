import { type SelectOption, TextAttributes } from "@opentui/core";
import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import { useCallback, useState } from "react";
import { listWorkerSecrets, setWorkerSecret } from "../utils/secrets";

interface SecretsManagerProps {
	onBack: () => void;
}

type FocusedField = "menu" | "key" | "value";

export function SecretsManager(_props: SecretsManagerProps) {
	const { width, height } = useTerminalDimensions();
	const [focused, setFocused] = useState<FocusedField>("menu");
	const [action, setAction] = useState<"menu" | "set" | "list">("menu");
	const [secretKey, setSecretKey] = useState("");
	const [secretValue, setSecretValue] = useState("");
	const [output, setOutput] = useState<Array<{ id: string; text: string }>>([]);
	const [error, setError] = useState<string | null>(null);
	const [processing, setProcessing] = useState(false);

	useKeyboard((key) => {
		if (key.name === "tab" && action === "set") {
			setFocused((prev) => {
				if (prev === "key") return "value";
				if (prev === "value") return "key";
				return prev;
			});
		}

		if (key.name === "escape" && action !== "menu") {
			setAction("menu");
			setFocused("menu");
			setSecretKey("");
			setSecretValue("");
			setOutput([]);
			setError(null);
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
				setOutput((prev) => [
					...prev,
					{ id: `${Date.now()}-empty`, text: "" },
					{ id: `${Date.now()}-success`, text: "✓ Secret set successfully!" },
				]);
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
				<box style={{ marginBottom: 2 }}>
					<text
						style={{
							attributes: TextAttributes.BOLD,
							fg: "#00D9FF",
						}}
					>
						Secrets {processing ? "Processing" : "Result"}
					</text>
				</box>

				<scrollbox
					style={{
						rootOptions: { height: height - 10, border: true },
						wrapperOptions: { backgroundColor: "#1f2335" },
						viewportOptions: { backgroundColor: "#1a1b26" },
						scrollbarOptions: { showArrows: true },
					}}
					focused
				>
					<box style={{ flexDirection: "column", padding: 1 }}>
						{output.map((item) => (
							<text key={item.id} fg={item.text.startsWith("✓") ? "#9ece6a" : "#888"}>
								{item.text}
							</text>
						))}
						{error && <text fg="red">Error: {error}</text>}
					</box>
				</scrollbox>

				<box style={{ marginTop: 1 }}>
					<text fg="#666">{processing ? "Processing..." : "ESC Back"}</text>
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
				<box style={{ marginBottom: 2 }}>
					<text
						style={{
							attributes: TextAttributes.BOLD,
							fg: "#00D9FF",
						}}
					>
						Set Worker Secret
					</text>
				</box>

				<box style={{ flexDirection: "column", gap: 1 }}>
					<box title="Secret Key" style={{ border: true, height: 3 }}>
						<input
							placeholder="e.g., OPENROUTER_API_KEY"
							onInput={setSecretKey}
							onSubmit={handleSetSecret}
							focused={focused === "key"}
						/>
					</box>

					<box title="Secret Value" style={{ border: true, height: 3 }}>
						<input
							placeholder="Enter secret value..."
							onInput={setSecretValue}
							onSubmit={handleSetSecret}
							focused={focused === "value"}
						/>
					</box>
				</box>

				<box style={{ marginTop: 2 }}>
					<text fg="#666">Tab Switch • Enter Submit • ESC Back</text>
				</box>

				{error && (
					<box style={{ marginTop: 1 }}>
						<text fg="red">Error: {error}</text>
					</box>
				)}
			</box>
		);
	}

	// Menu
	const options: SelectOption[] = [
		{
			name: "Set Secret",
			description: "Set a new secret or update existing one",
			value: "set",
		},
		{
			name: "List Secrets",
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
			<box style={{ marginBottom: 2 }}>
				<text
					style={{
						attributes: TextAttributes.BOLD,
						fg: "#00D9FF",
					}}
				>
					Manage Cloudflare Workers Secrets
				</text>
			</box>

			<box style={{ border: true, height: height - 10 }}>
				<select
					style={{ height: height - 12 }}
					options={options}
					focused={true}
					onChange={(_, option) => {
						if (option) {
							if (option.value === "set") {
								setAction("set");
								setFocused("key");
							} else if (option.value === "list") {
								setAction("list");
								handleListSecrets();
							}
						}
					}}
					showScrollIndicator
				/>
			</box>

			<box style={{ marginTop: 1 }}>
				<text fg="#666">↑↓ Navigate • Enter Select • ESC Back</text>
			</box>
		</box>
	);
}
