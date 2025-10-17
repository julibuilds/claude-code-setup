import { TextAttributes } from "@opentui/core";
import type { ReactNode } from "react";
import { useComponentStyles } from "../../styles/theme-system";

export function ListFooter(): ReactNode {
	const toast = null; // Removed Zustand store dependency
	const componentStyles = useComponentStyles();

	if (toast) {
		return (
			<box
				border={false}
				style={{
					paddingLeft: 1,
					paddingRight: 1,
					paddingTop: 1,
					marginTop: 1,
				}}
			>
				{toast}
			</box>
		);
	}

	return (
		<box
			border={false}
			style={{
				paddingLeft: 1,
				paddingRight: 1,
				paddingTop: 1,
				marginTop: 1,
				flexDirection: "row",
			}}
		>
			<text fg={componentStyles.list.footer.shortcutKeyColor} attributes={TextAttributes.BOLD}>
				↵
			</text>
			<text fg={componentStyles.list.footer.shortcutTextColor}> select</text>
			<text fg={componentStyles.list.footer.shortcutKeyColor} attributes={TextAttributes.BOLD}>
				{"   "}↑↓
			</text>
			<text fg={componentStyles.list.footer.shortcutTextColor}> navigate</text>
			<text fg={componentStyles.list.footer.shortcutKeyColor} attributes={TextAttributes.BOLD}>
				{"   "}^k
			</text>
			<text fg={componentStyles.list.footer.shortcutTextColor}> actions</text>
		</box>
	);
}
