import { type SelectOption, TextAttributes } from "@opentui/core";
import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import { useCallback, useState } from "react";
import { deployToWorkers, getDeploymentStatus } from "../utils/deploy";

interface DeployManagerProps {
	onBack: () => void;
}

export function DeployManager(_props: DeployManagerProps) {
	const { width, height } = useTerminalDimensions();
	const [deploying, setDeploying] = useState(false);
	const [output, setOutput] = useState<Array<{ id: string; text: string }>>([]);
	const [error, setError] = useState<string | null>(null);

	const handleDeploy = useCallback(async () => {
		setDeploying(true);
		setOutput([]);
		setError(null);

		try {
			setOutput((prev) => [
				...prev,
				{ id: `${Date.now()}-0`, text: "Deploying to Cloudflare Workers..." },
			]);

			const result = await deployToWorkers((line) => {
				setOutput((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, text: line }]);
			});

			if (result.success) {
				const messages = [
					{ id: `${Date.now()}-empty`, text: "" },
					{ id: `${Date.now()}-success`, text: "✓ Deployment successful!" },
				];

				if (result.filesVerified) {
					messages.push({
						id: `${Date.now()}-verified`,
						text: "✓ Local configuration files verified",
					});
				}

				if (result.verificationWarnings && result.verificationWarnings.length > 0) {
					messages.push({
						id: `${Date.now()}-warning-header`,
						text: "",
					});
					messages.push({
						id: `${Date.now()}-warning-title`,
						text: "⚠ Configuration warnings:",
					});
					result.verificationWarnings.forEach((warning, i) => {
						messages.push({
							id: `${Date.now()}-warning-${i}`,
							text: `  - ${warning}`,
						});
					});
				}

				setOutput((prev) => [...prev, ...messages]);
			} else {
				setError(result.error || "Deployment failed");
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Deployment failed");
		} finally {
			setDeploying(false);
		}
	}, []);

	const handleCheckStatus = useCallback(async () => {
		setOutput([]);
		setError(null);

		try {
			setOutput((prev) => [
				...prev,
				{ id: `${Date.now()}-check`, text: "Checking deployment status..." },
			]);

			const status = await getDeploymentStatus();
			setOutput((prev) => [
				...prev,
				{ id: `${Date.now()}-empty`, text: "" },
				{ id: `${Date.now()}-status`, text: status },
			]);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to check status");
		}
	}, []);

	useKeyboard((key) => {
		if (key.name === "return" && !deploying) {
			// Allow selection
		}
	});

	if (deploying || output.length > 0) {
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
						backgroundColor: "#1a1b26",
					}}
				>
					<text
						style={{
							attributes: TextAttributes.BOLD,
							fg: deploying ? "#e0af68" : "#9ece6a",
						}}
					>
						{deploying ? "🚀 Deployment in Progress..." : "✅ Deployment Complete"}
					</text>
				</box>

				<scrollbox
					style={{
						rootOptions: { height: height - 12, border: true },
						wrapperOptions: { backgroundColor: "#1f2335" },
						viewportOptions: { backgroundColor: "#1a1b26" },
						scrollbarOptions: { showArrows: true },
					}}
					focused
				>
					<box style={{ flexDirection: "column", padding: 2 }}>
						{output.map((item) => {
							const isSuccess = item.text.startsWith("✓");
							const isWarning = item.text.startsWith("⚠");
							const isError = item.text.toLowerCase().includes("error");
							const isEmpty = item.text.trim() === "";
							const color = isSuccess ? "#9ece6a" : isWarning ? "#e0af68" : isError ? "#f7768e" : "#7aa2f7";
							
							return (
								<text key={item.id} fg={color}>
									{isEmpty ? " " : item.text}
								</text>
							);
						})}
						{error && (
							<box style={{ marginTop: 1, padding: 1, border: true, backgroundColor: "#1a1b26" }}>
								<text style={{ attributes: TextAttributes.BOLD, fg: "#f7768e" }}>
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
						backgroundColor: "#1a1b26",
					}}
				>
					<text style={{ attributes: TextAttributes.BOLD, fg: "#bb9af7", marginBottom: 1 }}>
						⌨️  Keyboard Shortcuts
					</text>
					<text fg="#7aa2f7">{deploying ? "Deploying..." : "ESC Back to menu"}</text>
				</box>
			</box>
		);
	}

	const options: SelectOption[] = [
		{
			name: "Deploy Now",
			description: "Deploy configuration to Cloudflare Workers",
			value: "deploy",
		},
		{
			name: "Check Deployment Status",
			description: "View current deployment information",
			value: "status",
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
					backgroundColor: "#1a1b26",
				}}
			>
				<text
					style={{
						attributes: TextAttributes.BOLD,
						fg: "#00D9FF",
						marginBottom: 1,
					}}
				>
					🚀 Deploy to Cloudflare Workers
				</text>
				<text fg="#7aa2f7">Deploy your router configuration to the edge</text>
			</box>

			<box style={{ border: true, height: height - 12, backgroundColor: "#1f2335" }}>
				<select
					style={{ height: height - 14 }}
					options={options}
					focused={true}
					onChange={(_, option) => {
						if (option) {
							if (option.value === "status") {
								handleCheckStatus();
							} else if (option.value === "deploy") {
								handleDeploy();
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
					backgroundColor: "#1a1b26",
				}}
			>
				<text style={{ attributes: TextAttributes.BOLD, fg: "#bb9af7", marginBottom: 1 }}>
					⌨️  Keyboard Shortcuts
				</text>
				<text fg="#7aa2f7">↑↓ Navigate  •  Enter Select  •  ESC Back</text>
			</box>
		</box>
	);
}
