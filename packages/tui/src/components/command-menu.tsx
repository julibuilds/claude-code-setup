import { useKeyboard } from "@opentui/react";
import { useState } from "react";
import { useThemeColors } from "../styles/theme-system";
import { Modal } from "./modal";

export interface CommandItem {
	id: string;
	label: string;
	shortcut?: string;
	statusInfo?: string;
	action: () => void;
	disabled?: boolean;
}

export interface CommandGroup {
	id: string;
	title?: string;
	commands: CommandItem[];
}

export interface CommandMenuProps {
	/**
	 * Command groups to display
	 */
	groups: CommandGroup[];
	/**
	 * Title of the command menu
	 * @default "Commands"
	 */
	title?: string;
	/**
	 * Callback when the menu is closed
	 */
	onClose: () => void;
	/**
	 * Size of the modal
	 * @default "medium"
	 */
	size?: "small" | "medium" | "large";
}

/**
 * Raycast-style command menu component
 *
 * Features:
 * - Grouped commands with optional section titles
 * - Keyboard navigation (up/down arrows, Enter to execute)
 * - Shortcut key display and activation
 * - Disabled state support
 * - Status info display
 *
 * @example
 * ```tsx
 * const groups: CommandGroup[] = [
 *   {
 *     id: 'file',
 *     title: 'File',
 *     commands: [
 *       {
 *         id: 'new',
 *         label: 'New File',
 *         shortcut: 'n',
 *         action: () => createNewFile()
 *       },
 *       {
 *         id: 'open',
 *         label: 'Open File',
 *         shortcut: 'o',
 *         action: () => openFile()
 *       }
 *     ]
 *   }
 * ];
 *
 * <CommandMenu
 *   groups={groups}
 *   onClose={() => setShowMenu(false)}
 * />
 * ```
 */
export function CommandMenu({
	groups,
	title = "Commands",
	onClose,
	size = "medium",
}: CommandMenuProps) {
	const colors = useThemeColors();

	// Flatten commands for keyboard navigation
	const allCommands = groups.flatMap((group) => group.commands);

	const [selectedIndex, setSelectedIndex] = useState(() => {
		// Find first non-disabled command
		const firstEnabledIndex = allCommands.findIndex((cmd) => !cmd.disabled);
		return firstEnabledIndex >= 0 ? firstEnabledIndex : 0;
	});

	// Keyboard navigation
	useKeyboard((key) => {
		if (key.name === "escape") {
			onClose();
			return;
		}

		if (key.name === "up") {
			setSelectedIndex((prev) => {
				// Find previous non-disabled item
				let newIndex = prev - 1;
				while (newIndex >= 0 && allCommands[newIndex]?.disabled) {
					newIndex--;
				}
				return newIndex >= 0 ? newIndex : prev;
			});
			return;
		}

		if (key.name === "down") {
			setSelectedIndex((prev) => {
				// Find next non-disabled item
				let newIndex = prev + 1;
				while (newIndex < allCommands.length && allCommands[newIndex]?.disabled) {
					newIndex++;
				}
				return newIndex < allCommands.length ? newIndex : prev;
			});
			return;
		}

		if (key.name === "return") {
			const command = allCommands[selectedIndex];
			if (command && !command.disabled) {
				command.action();
			}
			return;
		}

		// Shortcut key selection
		if (key.name) {
			const command = allCommands.find((cmd) => cmd.shortcut === key.name && !cmd.disabled);
			if (command) {
				command.action();
				return;
			}
		}
	});

	// Calculate global command index for selection
	let globalCommandIndex = 0;

	return (
		<Modal title={title} onClose={onClose} size={size} scrollable={false}>
			<box style={{ flexDirection: "column", gap: 1 }}>
				{groups.map((group, groupIndex) => (
					<box key={group.id} style={{ flexDirection: "column" }}>
						{/* Group header */}
						{group.title && (
							<text fg={colors.text.muted} style={{ marginTop: groupIndex > 0 ? 1 : 0 }}>
								{group.title}
							</text>
						)}

						{/* Group commands */}
						{group.commands.map((command) => {
							const commandIndex = globalCommandIndex++;
							const isSelected = commandIndex === selectedIndex;
							const isDisabled = command.disabled;

							return (
								<box
									key={command.id}
									style={{
										flexDirection: "row",
										justifyContent: "space-between",
										backgroundColor: isSelected ? colors.special.hover : undefined,
										paddingLeft: group.title ? 1 : 0,
									}}
								>
									{/* Left side: Shortcut + Label */}
									<box style={{ flexDirection: "row", gap: 1 }}>
										{command.shortcut && (
											<text
												fg={
													isDisabled
														? colors.text.muted
														: isSelected
															? colors.accent.primary
															: colors.text.primary
												}
											>
												[{command.shortcut}]
											</text>
										)}
										<text
											fg={
												isDisabled
													? colors.text.muted
													: isSelected
														? colors.accent.primary
														: colors.text.primary
											}
										>
											{command.label}
										</text>
									</box>

									{/* Right side: Status info */}
									{command.statusInfo && <text fg={colors.text.muted}>{command.statusInfo}</text>}
								</box>
							);
						})}
					</box>
				))}
			</box>
		</Modal>
	);
}
