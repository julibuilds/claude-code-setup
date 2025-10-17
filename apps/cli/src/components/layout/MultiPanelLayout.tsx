import type { ReactNode } from "react";

interface MultiPanelLayoutProps {
	panels: ReactNode[];
	height: number;
	gap?: number;
}

/**
 * Layout component for displaying multiple panels side-by-side
 * Automatically distributes width evenly among panels
 */
export function MultiPanelLayout({
	panels,
	height,
	gap = 2,
}: MultiPanelLayoutProps) {
	return (
		<box
			style={{
				flexDirection: "row",
				gap,
				height,
			}}
		>
			{panels.map((panel, index) => (
				<box
					key={`panel-${index}`}
					style={{
						flexGrow: 1,
						flexDirection: "column",
					}}
				>
					{panel}
				</box>
			))}
		</box>
	);
}
