import type React from "react";
import { useComponentStyles } from "../styles/theme-system";

interface ScrollBoxStyleOptions {
	rootOptions?: Record<string, unknown>;
	wrapperOptions?: Record<string, unknown>;
	viewportOptions?: Record<string, unknown>;
	contentOptions?: Record<string, unknown>;
	scrollbarOptions?: Record<string, unknown>;
}

interface ScrollBoxProps {
	children?: React.ReactNode;
	focused?: boolean;
	flexGrow?: number;
	flexShrink?: number;
	style?: ScrollBoxStyleOptions;
}

export function ScrollBox({
	children,
	focused = false,
	flexGrow,
	flexShrink,
	style,
	...props
}: ScrollBoxProps): React.ReactElement {
	const componentStyles = useComponentStyles();
	const scrollboxStyles = componentStyles.scrollbox;

	return (
		<scrollbox
			focused={focused}
			flexGrow={flexGrow}
			flexShrink={flexShrink}
			style={{
				rootOptions: {
					backgroundColor: scrollboxStyles.root.backgroundColor,
					...(style?.rootOptions || {}),
				},
				wrapperOptions: {
					...(style?.wrapperOptions || {}),
				},
				viewportOptions: {
					flexGrow: 1,
					flexShrink: 1,
					...(style?.viewportOptions || {}),
				},
				contentOptions: {
					flexShrink: 0,
					...(style?.contentOptions || {}),
				},
				scrollbarOptions: {
					visible: true,
					showArrows: true,
					trackOptions: {
						foregroundColor: scrollboxStyles.scrollbar.track.foregroundColor,
						backgroundColor: scrollboxStyles.scrollbar.track.backgroundColor,
					},
					...(style?.scrollbarOptions || {}),
				},
			}}
			{...props}
		>
			{children}
		</scrollbox>
	) as React.ReactElement;
}
