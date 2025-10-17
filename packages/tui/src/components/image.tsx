import type { ReactNode } from "react";

/**
 * Image component for TUI applications
 * Displays emoji icons, file icons, or text representations
 * Based on termcast example
 */

export enum ImageMask {
	Circle = "circle",
	RoundedRectangle = "rounded-rectangle",
}

export interface FileIcon {
	fileIcon: string;
}

export type ImageSource = string | { light: string; dark: string } | FileIcon | ImageLike;

export type ImageLike = string | FileIcon | ImageProps;

export interface ImageProps {
	source: ImageSource;
	mask?: ImageMask;
	tintColor?: string;
	fallback?: string;
}

/**
 * Get emoji representation for common file types
 */
function getFileIconEmoji(filePath: string): string {
	const ext = filePath.split(".").pop()?.toLowerCase();

	const iconMap: Record<string, string> = {
		// Code files
		ts: "📘",
		tsx: "⚛️",
		js: "📜",
		jsx: "⚛️",
		json: "📋",
		// Web files
		html: "🌐",
		css: "🎨",
		scss: "💅",
		// Documents
		md: "📝",
		txt: "📄",
		pdf: "📕",
		// Images
		png: "🖼️",
		jpg: "🖼️",
		jpeg: "🖼️",
		gif: "🖼️",
		svg: "🎨",
		// Data
		csv: "📊",
		xml: "📄",
		yaml: "⚙️",
		yml: "⚙️",
		toml: "⚙️",
		// Archives
		zip: "📦",
		tar: "📦",
		gz: "📦",
		// Shell/Config
		sh: "🔧",
		bash: "🔧",
		zsh: "🔧",
		// Build/Package
		dockerfile: "🐳",
		lock: "🔒",
		// Default
		folder: "📁",
		file: "📄",
	};

	return iconMap[ext || "file"] || "📄";
}

/**
 * Image component that displays emoji or text representation
 * For TUI applications, we convert images to emoji/text
 *
 * @example
 * ```tsx
 * <Image source="folder-16" />
 * <Image source={{ fileIcon: "example.ts" }} />
 * <Image source="✨" mask={ImageMask.Circle} />
 * ```
 */
export function Image({ source, fallback = "🖼️" }: ImageProps): ReactNode {
	if (typeof source === "string") {
		// Check if it's a Raycast-style icon ID (ending with size)
		if (source.match(/-\d+$/)) {
			// Extract icon name and return emoji representation
			const iconName = source.replace(/-\d+$/, "");
			return getIconEmoji(iconName);
		}

		// Check if it's already an emoji (typically 1-4 characters)
		if (source.length <= 4) {
			return source;
		}

		// Otherwise treat as a file path
		return getFileIconEmoji(source);
	}

	if (typeof source === "object" && source !== null) {
		// Theme-aware images
		if ("light" in source && "dark" in source) {
			// For now, just use light version
			// TODO: Integrate with theme context to pick correct variant
			return <Image source={source.light} fallback={fallback} />;
		}

		// File icon
		if ("fileIcon" in source) {
			return getFileIconEmoji(source.fileIcon);
		}
	}

	// Fallback
	return fallback;
}

/**
 * Get emoji for common icon names (Raycast-style icons)
 */
function getIconEmoji(iconName: string): string {
	const iconMap: Record<string, string> = {
		// Common icons
		folder: "📁",
		"folder-open": "📂",
		file: "📄",
		document: "📄",
		// Actions
		plus: "➕",
		minus: "➖",
		star: "⭐",
		"star-filled": "⭐",
		"star-empty": "☆",
		checkmark: "✓",
		"checkmark-circle": "✅",
		xmark: "✗",
		"xmark-circle": "❌",
		// Arrows
		"arrow-right": "→",
		"arrow-left": "←",
		"arrow-up": "↑",
		"arrow-down": "↓",
		"chevron-right": "›",
		"chevron-left": "‹",
		"chevron-up": "^",
		"chevron-down": "v",
		// Status
		info: "ℹ️",
		warning: "⚠️",
		error: "❌",
		success: "✅",
		// Tools
		settings: "⚙️",
		gear: "⚙️",
		wrench: "🔧",
		hammer: "🔨",
		// Communication
		bell: "🔔",
		message: "💬",
		mail: "✉️",
		// Media
		play: "▶️",
		pause: "⏸️",
		stop: "⏹️",
		music: "🎵",
		video: "🎥",
		camera: "📷",
		// Misc
		calendar: "📅",
		clock: "🕐",
		search: "🔍",
		filter: "🔽",
		bookmark: "🔖",
		trash: "🗑️",
		download: "⬇️",
		upload: "⬆️",
		link: "🔗",
		lock: "🔒",
		unlock: "🔓",
		eye: "👁️",
		"eye-slash": "🙈",
		heart: "❤️",
		home: "🏠",
		person: "👤",
		people: "👥",
		globe: "🌐",
		terminal: "💻",
		code: "💻",
		bug: "🐛",
		"light-bulb": "💡",
		rocket: "🚀",
		fire: "🔥",
		sparkle: "✨",
	};

	return iconMap[iconName] || "⬜";
}
