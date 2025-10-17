import { type SelectOption, TextAttributes } from "@opentui/core";
import { useTerminalDimensions } from "@opentui/react";
import { useCallback, useState } from "react";
import { deployToWorkers, getDeploymentStatus } from "../../../utils/deploy";
import { Header } from "../../layout/Header";
import { Footer } from "../../layout/Footer";
import { DeploymentLog } from "./DeploymentLog";
import { Spinner } from "../../common/Spinner";
import { theme } from "../../../design/theme";
import { useScreenFocus } from "../../../hooks/useScreenFocus";

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

	// Use Core renderer for keyboard events
	useScreenFocus({
		// No custom handlers needed - select component handles Enter
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
						...theme.components.header,
						marginBottom: 2,
					}}
				>
					{deploying ? (
						<Spinner label="Deployment in Progress..." color={theme.colors.warning} />
					) : (
						<text
							style={{
								attributes: TextAttributes.BOLD,
								fg: theme.colors.success,
							}}
						>
							✅ Deployment Complete
						</text>
					)}
				</box>

				<DeploymentLog entries={output} error={error} height={height - 12} />

				<Footer
					shortcuts={[
						{
							keys: deploying ? "⏳" : "ESC",
							description: deploying ? "Deploying..." : "Back to menu",
						},
					]}
				/>
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

	const contentHeight = Math.max(8, height - 16);

	return (
		<box
			style={{
				flexDirection: "column",
				width: Math.min(80, width - 4),
				height: height - 4,
				padding: 2,
			}}
		>
			<Header
				icon="🚀"
				title="Deploy to Cloudflare Workers"
				subtitle="Deploy your router configuration to the edge"
			/>

			<box
				style={{
					...theme.components.selectContainer,
					height: contentHeight,
					marginBottom: 2,
				}}
			>
				<select
					style={{ height: "100%" }}
					options={options}
					focused={true}
					onChange={(_index, option) => {
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

			<Footer
				shortcuts={[
					{ keys: "↑↓", description: "Navigate" },
					{ keys: "Enter", description: "Select" },
					{ keys: "ESC", description: "Back" },
				]}
			/>
		</box>
	);
}
