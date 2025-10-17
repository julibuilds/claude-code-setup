import type { BoxRenderable } from "@opentui/core";
import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useComponentStyles } from "../styles/theme-system";

export interface ProgressProps {
	length?: number;
	char?: string;
	colors?: string[];
	animationSpeed?: number;
	isAnimating?: boolean;
	renderFrame?: (position: number, length: number, colors: string[], char: string) => ReactNode;
}

/**
 * A primitive progress/loading indicator. Just renders animated characters.
 * Compose with text/labels as needed.
 */
export function Progress({
	length = 20,
	char = "─",
	colors,
	animationSpeed = 10,
	isAnimating = false,
	renderFrame,
}: ProgressProps): ReactNode {
	const [position, setPosition] = useState(0);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const componentStyles = useComponentStyles();

	const defaultColors = componentStyles.loadingBar.wave;
	const waveColors = colors || defaultColors;

	useEffect(() => {
		if (isAnimating) {
			intervalRef.current = setInterval(() => {
				setPosition((prev) => (prev + 1) % (length + waveColors.length));
			}, animationSpeed);
		} else {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
			setPosition(0);
		}

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [isAnimating, length, waveColors.length, animationSpeed]);

	const defaultRenderFrame = (pos: number, len: number, cols: string[], ch: string) => {
		const characters = ch.repeat(len).split("");
		const waveWidth = cols.length;

		return (
			<box style={{ flexDirection: "row" }}>
				{characters.map((character, index) => {
					const distance = pos - index;
					let color = componentStyles.loadingBar.background;

					if (isAnimating && distance >= 0 && distance < waveWidth) {
						color = cols[distance] || color;
					}

					return (
						<text key={`char-${index}`} fg={color}>
							{character}
						</text>
					);
				})}
			</box>
		);
	};

	const renderFn = renderFrame || defaultRenderFrame;

	return <>{renderFn(position, length, waveColors, char)}</>;
}

// Legacy LoadingBar for backward compatibility
interface LoadingBarProps {
	title: string;
	isLoading?: boolean;
	barLength?: number;
}

/**
 * @deprecated Use Progress component with separate text label for more flexibility
 */
export function LoadingBar(props: LoadingBarProps): any {
	const { title, isLoading = false, barLength: propBarLength } = props;
	const [position, setPosition] = useState(0);
	const [calculatedBarLength, setCalculatedBarLength] = useState(propBarLength || 0);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const containerRef = useRef<BoxRenderable>(null);
	const componentStyles = useComponentStyles();

	// Calculate bar length based on container width
	useLayoutEffect(() => {
		if (containerRef.current) {
			// TODO i am using the full terminal width for now. it would be better to use the box width for real instead
			const containerWidth = containerRef.current.ctx.width - 4;

			// logger.log('LoadingBar container width:', containerWidth)
			if (!containerWidth) return;
			// Account for padding (1 on each side) and the title length + space
			const availableWidth = containerWidth - 2 - title.length - 1;

			const calculatedLength = Math.max(availableWidth, 10); // Minimum bar length of 10

			setCalculatedBarLength(calculatedLength);
		}
	}, [title]);

	// Create the full text including title and bar
	const barLength = propBarLength || calculatedBarLength;
	const bar = "─".repeat(barLength);
	const fullText = `${title} ${bar}`;
	const characters = fullText.split("");

	// Use theme colors for wave animation
	const waveColors = componentStyles.loadingBar.wave;

	const waveWidth = waveColors.length;

	useEffect(() => {
		if (isLoading) {
			intervalRef.current = setInterval(() => {
				setPosition((prev) => (prev + 1) % (characters.length + waveWidth));
			}, 10);
		} else {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
			setPosition(0);
		}

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [isLoading, characters.length, waveWidth]);

	// Calculate color for each character
	const getCharacterColor = (index: number): string => {
		if (!isLoading) {
			// When not loading, use default theme colors
			return index < title.length
				? componentStyles.loadingBar.title
				: componentStyles.loadingBar.background;
		}

		// Title text stays static when loading, only animate the bar
		if (index < title.length) {
			return componentStyles.loadingBar.title; // Keep title text muted during loading
		}

		// Only animate the bar part
		const barIndex = index - title.length - 1; // Adjust for space after title
		const distance = position - barIndex;

		// If character is within the wave (behind the current position)
		if (distance >= 0 && distance < waveWidth) {
			return waveColors[distance] || componentStyles.loadingBar.background;
		}

		// Default muted color for characters outside the wave
		return componentStyles.loadingBar.background;
	};

	return (
		<box
			ref={(el) => {
				containerRef.current = el;
			}}
			style={{
				flexDirection: "row",
				flexGrow: 1,
				paddingLeft: 1,
				paddingRight: 1,
			}}
		>
			{characters.map((char, index) => (
				<text key={`char-${index}-${char}`} fg={getCharacterColor(index)}>
					{char}
				</text>
			))}
		</box>
	);
}
