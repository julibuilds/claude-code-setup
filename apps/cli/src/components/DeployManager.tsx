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

	const handleDeploy = useCallback(async (env: "production" | "staging") => {
		setDeploying(true);
		setOutput([]);
		setError(null);

		try {
			setOutput((prev) => [...prev, { id: `${Date.now()}-0`, text: `Deploying to ${env}...` }]);

			const result = await deployToWorkers(env, (line) => {
				setOutput((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, text: line }]);
			});

			if (result.success) {
				setOutput((prev) => [
					...prev,
					{ id: `${Date.now()}-empty`, text: "" },
					{ id: `${Date.now()}-success`, text: "✓ Deployment successful!" },
				]);
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
				<box style={{ marginBottom: 2 }}>
					<text
						style={{
							attributes: TextAttributes.BOLD,
							fg: "#00D9FF",
						}}
					>
						Deployment {deploying ? "in Progress" : "Complete"}
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
					<text fg="#666">{deploying ? "Deploying..." : "ESC Back"}</text>
				</box>
			</box>
		);
	}

	const options: SelectOption[] = [
		{
			name: "Deploy to Production",
			description: "Deploy configuration to production environment",
			value: "production",
		},
		{
			name: "Deploy to Staging",
			description: "Deploy configuration to staging environment",
			value: "staging",
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
			<box style={{ marginBottom: 2 }}>
				<text
					style={{
						attributes: TextAttributes.BOLD,
						fg: "#00D9FF",
					}}
				>
					Deploy to Cloudflare Workers
				</text>
			</box>

			<box style={{ border: true, height: height - 10 }}>
				<select
					style={{ height: height - 12 }}
					options={options}
					focused={true}
					onChange={(_, option) => {
						if (option) {
							if (option.value === "status") {
								handleCheckStatus();
							} else {
								handleDeploy(option.value as "production" | "staging");
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
