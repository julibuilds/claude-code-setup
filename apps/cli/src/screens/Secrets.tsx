import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { Button, ScrollBox, TextInput, useThemeColors } from "@repo/tui";
import { useCallback, useEffect, useState } from "react";
import {secrets";

interface SecretsP {
	onBack: () => void;
}

type FocusArea = "action;
type Action = "set" | "list";

s) {
	const colors = useThemeColors();
	const [focusArea, setFocusAr
");
	const [secretKey, setSecretKey] = useState("");
	const [secretValue, setSecretValu"");
	const [output, setOutput] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);
	const [maskSecrets, setMaskSecrets] = useState(te);

	const handleSetSecret = useCallback(async () => {
		if (!secretKey.trim() || !secretValue.trim()) {
			setOutput(["Error: Both key and value are required"]
n;
		}

		setLoading(true);
		setOutput([


			const result: Secr

ss) 
				setOutput([
					`✓ Secret '${secretKey}' set successfully`,
					result.localFted",
				]);
				setS"");
");else {
				setOutput([`✗ F
			}
		} catch (err) {
			setOutput([`✗ Error: ${err instanceof ;
		} finally {
			setLoadig(false);
		}
	}, [secretKey, secretValue]);

	const handleListSecrets = useCallback(async () => {
		setLo;
		setOutput(["Fetch;

		try {
			const ets();
			setOutput(se);
		} catch (err) {
			se]);
		} finally {
(false);
		}
	}, []);


		handleL();
	}, [handleListSecrets]);

	useKeyboard((evt) => {
		if (evt.name ==) {
			onBack();
		} else ab") {
			setFocusArea 
				if (prev === "action
				i";
				if (p;
tion";);
		} else if (evt.ct{
			setMaskSecrets((prev)prev);
		} else if (evt.name === ") {
n") {
				if (selectedAction =) {
					handleSetSecret();
				} else {
					handleListSecrets();
				}
			}
		}
	});

	const di

	return (
		<box flexGrow={1} flexDirection="colu>
			<box style={{ paddingBottom: 1 }
				<text fg={colors.accent.primary} atLD}>
					🔐 Secrets Manager
				</text>
			</box>

			<box }}>
				<on
					
"}
					onClick={() => {
						setSelectedAction("set");

					}}
					disabled={loading}
				>
					Set Secret
				</Button>
				<Button
					variant={sry"}
					focused"}
={() => {
						setSelectedAction("list");
						handleListSecrets();
					}}
					disabled={loading}
				>
					List Secrets
				</Button>
			</box>

			<box stylom: 1 }}>
				<box border title="Secre
					<Text
						value={setKey}
						placeholder="e.g., API_KEY"
						focused={focusArea === "key"}
						onChange={setSecretKey}
					/>
				</box>
				<box border title="Secret Va3 }}>
					<TextInput
						value={displayValue}
						plac"
						focuseue"}
Value}
					/>
				</box>
			</box>

			<box border title="Output"
				<ScrollBox focused={focusArea === "
					<box flexDirection="column">
						{output.map((line, idx) => (
							<text
								key=-${idx}`}
								fg={
									line.startsWith("✓")
										? colors.aary
										: line.startsWith("✗")
											? colors.accent.primary
											: line.startsWith("⚠")
												? colors.text.muted
												: colors.text.primary
								}
							>
								{lin}
>
						))}
					</box>
				</ScrollBox>
			</box>

			<box style={pa>
				<box style={{ gap: 2 }}>
					<text fg={color>
					<text fg={colors.text.muted}>Ente>
					<text fg={colors.text.muted}>Ctrl+H: {ma/text>
					<text fg={colors.text.muted}>ESC: Back</text>
				</box>
				{maskSecrets && (
					<box style={{ paddingTop: 1 }}>
						<text fg={colors.text.muted}>🔒 Sec
					</box>
				)}
			</box>
		</box>
	);
}
