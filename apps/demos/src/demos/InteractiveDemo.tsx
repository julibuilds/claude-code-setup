import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import {
	AccordionItem,
	type CommandGroup,
	CommandMenu,
	Modal,
	Toast,
	type ToastMessage,
	useThemeColors,
} from "@repo/tui";
import { useState } from "react";

export function InteractiveDemo() {
	const colors = useThemeColors();
	const [showDialog, setShowDialog] = useState(false);
	const [showCommandMenu, setShowCommandMenu] = useState(false);
	const [counter, setCounter] = useState(0);
	const [toast, setToast] = useState<ToastMessage | null>(null);
	const [focusedAccordion, setFocusedAccordion] = useState<number>(0);

	const commandGroups: CommandGroup[] = [
		{
			id: "actions",
			title: "Actions",
			commands: [
				{
					id: "increment",
					label: "Increment Counter",
					shortcut: "i",
					action: () => {
						setCounter((prev) => prev + 1);
						setShowCommandMenu(false);
						setToast({ type: "success", message: "Counter incremented!" });
					},
				},
				{
					id: "reset",
					label: "Reset Counter",
					shortcut: "r",
					action: () => {
						setCounter(0);
						setShowCommandMenu(false);
						setToast({ type: "info", message: "Counter reset to 0" });
					},
				},
				{
					id: "dialog",
					label: "Show Dialog",
					shortcut: "d",
					action: () => {
						setShowDialog(true);
						setShowCommandMenu(false);
					},
				},
			],
		},
		{
			id: "notifications",
			title: "Notifications",
			commands: [
				{
					id: "success",
					label: "Success Toast",
					shortcut: "s",
					action: () => {
						setToast({ type: "success", message: "Operation successful!" });
						setShowCommandMenu(false);
					},
				},
				{
					id: "error",
					label: "Error Toast",
					shortcut: "e",
					action: () => {
						setToast({ type: "error", message: "Something went wrong!" });
						setShowCommandMenu(false);
					},
				},
				{
					id: "warning",
					label: "Warning Toast",
					shortcut: "w",
					action: () => {
						setToast({ type: "warning", message: "Proceed with caution!" });
						setShowCommandMenu(false);
					},
				},
			],
		},
	];

	useKeyboard((key) => {
		if (showDialog || showCommandMenu) return;

		if (key.name === "space") {
			setShowDialog(true);
		}
		if (key.name === "up") {
			setCounter((prev) => prev + 1);
		}
		if (key.name === "down") {
			setCounter((prev) => Math.max(0, prev - 1));
		}
		if (key.name === "c" && key.ctrl) {
			setShowCommandMenu(true);
		}
		if (key.name === "j") {
			setFocusedAccordion((prev) => Math.min(2, prev + 1));
		}
		if (key.name === "k") {
			setFocusedAccordion((prev) => Math.max(0, prev - 1));
		}
	});

	return (
		<box flexGrow={1} style={{ padding: 2, flexDirection: "column", gap: 1 }}>
			<box alignItems="center">
				<ascii-font font="tiny" text="Interactive Elements" />
			</box>

			<box style={{ flexDirection: "row", gap: 2, flexGrow: 1 }}>
				{/* Left Column */}
				<box style={{ flexDirection: "column", gap: 1, flexGrow: 1 }}>
					{/* Counter Card */}
					<box border borderStyle="rounded" title="Counter Widget">
						<box style={{ padding: 2 }}>
							<box alignItems="center" justifyContent="center">
								<text fg={colors.accent.primary} attributes={TextAttributes.BOLD}>
									{counter}
								</text>
							</box>
							<box style={{ paddingTop: 1 }} alignItems="center">
								<text fg={colors.text.muted}>↑ Increment • ↓ Decrement</text>
							</box>
						</box>
					</box>

					{/* Action Buttons */}
					<box border title="Actions" style={{ padding: 1 }}>
						<box style={{ flexDirection: "column", gap: 0 }}>
							<box style={{ flexDirection: "row", gap: 1 }}>
								<text fg={colors.accent.secondary}>[Space]</text>
								<text fg={colors.text.primary}>Show Dialog</text>
							</box>
							<box style={{ flexDirection: "row", gap: 1 }}>
								<text fg={colors.accent.secondary}>[Ctrl+C]</text>
								<text fg={colors.text.primary}>Command Menu</text>
							</box>
							<box style={{ flexDirection: "row", gap: 1 }}>
								<text fg={colors.accent.secondary}>[J/K]</text>
								<text fg={colors.text.primary}>Navigate Accordion</text>
							</box>
						</box>
					</box>

					{/* Stats */}
					<box border title="Statistics" style={{ padding: 1 }}>
						<box style={{ flexDirection: "column", gap: 0 }}>
							<box style={{ flexDirection: "row", justifyContent: "space-between" }}>
								<text fg={colors.text.muted}>Current Value:</text>
								<text fg={colors.accent.primary} attributes={TextAttributes.BOLD}>
									{counter}
								</text>
							</box>
							<box style={{ flexDirection: "row", justifyContent: "space-between" }}>
								<text fg={colors.text.muted}>Max Reached:</text>
								<text fg={colors.status.success}>{Math.max(counter, 0)}</text>
							</box>
							<box style={{ flexDirection: "row", justifyContent: "space-between" }}>
								<text fg={colors.text.muted}>Status:</text>
								<text
									fg={
										counter > 10
											? colors.status.success
											: counter > 5
												? colors.status.warning
												: colors.text.muted
									}
								>
									{counter > 10 ? "High" : counter > 5 ? "Medium" : "Low"}
								</text>
							</box>
						</box>
					</box>
				</box>

				{/* Right Column - Accordion */}
				<box style={{ flexDirection: "column", flexGrow: 1 }}>
					<box border title="Collapsible Sections" style={{ padding: 1 }}>
						<AccordionItem
							id="features"
							title="✨ Features"
							defaultOpen={true}
							focused={focusedAccordion === 0}
						>
							<box style={{ flexDirection: "column", gap: 0, padding: 1 }}>
								<text fg={colors.text.primary}>• Command Menu (Ctrl+C)</text>
								<text fg={colors.text.primary}>• Toast Notifications</text>
								<text fg={colors.text.primary}>• Modal Dialogs</text>
								<text fg={colors.text.primary}>• Accordion Panels</text>
								<text fg={colors.text.primary}>• Keyboard Navigation</text>
							</box>
						</AccordionItem>

						<AccordionItem
							id="shortcuts"
							title="⌨️  Keyboard Shortcuts"
							focused={focusedAccordion === 1}
						>
							<box style={{ flexDirection: "column", gap: 0, padding: 1 }}>
								<text fg={colors.text.muted}>Space - Toggle Dialog</text>
								<text fg={colors.text.muted}>↑/↓ - Adjust Counter</text>
								<text fg={colors.text.muted}>Ctrl+C - Command Menu</text>
								<text fg={colors.text.muted}>J/K - Navigate Accordion</text>
								<text fg={colors.text.muted}>Q/Esc - Back to Menu</text>
							</box>
						</AccordionItem>

						<AccordionItem id="info" title="ℹ️  Information" focused={focusedAccordion === 2}>
							<box style={{ flexDirection: "column", gap: 0, padding: 1 }}>
								<text fg={colors.text.primary}>This demo showcases:</text>
								<text fg={colors.text.muted}>• Interactive components</text>
								<text fg={colors.text.muted}>• State management</text>
								<text fg={colors.text.muted}>• Keyboard controls</text>
								<text fg={colors.text.muted}>• Visual feedback</text>
							</box>
						</AccordionItem>
					</box>
				</box>
			</box>

			{/* Modal */}
			{showDialog && (
				<Modal title="🎉 Interactive Dialog" onClose={() => setShowDialog(false)} size="medium">
					<box style={{ flexDirection: "column", gap: 1 }}>
						<text fg={colors.text.primary}>This is a modal dialog component!</text>
						<text fg={colors.text.muted}>It overlays the content and captures keyboard focus.</text>
						<box style={{ paddingTop: 1 }}>
							<text fg={colors.accent.primary}>Current counter value: {counter}</text>
						</box>
						<box style={{ paddingTop: 1 }}>
							<text fg={colors.text.muted}>Press ESC or Q to close</text>
						</box>
					</box>
				</Modal>
			)}

			{/* Command Menu */}
			{showCommandMenu && (
				<CommandMenu
					groups={commandGroups}
					title="⚡ Command Palette"
					onClose={() => setShowCommandMenu(false)}
					size="medium"
				/>
			)}

			{/* Toast Notifications */}
			<Toast toast={toast} onDismiss={() => setToast(null)} timeout={2000} position="top-right" />
		</box>
	);
}
