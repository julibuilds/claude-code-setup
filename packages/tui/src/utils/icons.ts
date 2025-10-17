/**
 * File and folder icons for TUI components
 */

export const FOLDER_ICONS = {
	open: "📂",
	closed: "📁",
	chevronOpen: "▼",
	chevronClosed: "▶",
} as const;

export const FILE_ICONS = {
	// Default
	default: "📄",

	// Programming languages
	typescript: "󰛦",
	javascript: "",
	jsx: "",
	tsx: "󰛦",
	python: "",
	go: "",
	rust: "",
	java: "",
	c: "",
	cpp: "",
	csharp: "󰌛",
	ruby: "",
	php: "",
	swift: "",
	kotlin: "",
	scala: "",

	// Web
	html: "",
	css: "",
	scss: "",
	sass: "",
	less: "",

	// Data/Config
	json: "",
	yaml: "",
	yml: "",
	toml: "",
	xml: "",
	csv: "",

	// Markdown/Docs
	markdown: "",
	md: "",
	txt: "󰈙",
	pdf: "",

	// Build/Config files
	dockerfile: "",
	docker: "",
	git: "",
	gitignore: "",
	env: "",
	license: "",
	npmignore: "",

	// Package managers
	package: "📦",
	lock: "",

	// Images
	image: "🖼️",
	png: "🖼️",
	jpg: "🖼️",
	jpeg: "🖼️",
	gif: "🖼️",
	svg: "🖼️",
	ico: "🖼️",

	// Archives
	zip: "🗜️",
	tar: "🗜️",
	gz: "🗜️",

	// Executables
	exe: "⚙️",
	sh: "⚙️",
	bash: "⚙️",
	zsh: "⚙️",
	fish: "⚙️",

	// Test files
	test: "🧪",
	spec: "🧪",
} as const;

/**
 * Get icon for a file based on its extension or name
 */
export function getFileIcon(fileName: string): string {
	const lowerFileName = fileName.toLowerCase();

	// Check for specific file names first
	if (lowerFileName === "dockerfile") return FILE_ICONS.dockerfile;
	if (lowerFileName === ".gitignore") return FILE_ICONS.gitignore;
	if (lowerFileName === ".env" || lowerFileName.startsWith(".env.")) return FILE_ICONS.env;
	if (lowerFileName === "license" || lowerFileName === "license.md") return FILE_ICONS.license;
	if (lowerFileName === "package.json") return FILE_ICONS.package;
	if (
		lowerFileName === "package-lock.json" ||
		lowerFileName === "yarn.lock" ||
		lowerFileName === "pnpm-lock.yaml" ||
		lowerFileName === "bun.lockb"
	)
		return FILE_ICONS.lock;

	// Check for test files
	if (
		lowerFileName.includes(".test.") ||
		lowerFileName.includes(".spec.") ||
		lowerFileName.endsWith("_test.go") ||
		lowerFileName.endsWith("_spec.rb")
	) {
		return FILE_ICONS.test;
	}

	// Get extension
	const parts = lowerFileName.split(".");
	if (parts.length < 2) return FILE_ICONS.default;

	const ext = parts[parts.length - 1];

	// Map extension to icon
	switch (ext) {
		// TypeScript/JavaScript
		case "ts":
			return FILE_ICONS.typescript;
		case "tsx":
			return FILE_ICONS.tsx;
		case "js":
			return FILE_ICONS.javascript;
		case "jsx":
			return FILE_ICONS.jsx;
		case "mjs":
		case "cjs":
			return FILE_ICONS.javascript;

		// Other languages
		case "py":
			return FILE_ICONS.python;
		case "go":
			return FILE_ICONS.go;
		case "rs":
			return FILE_ICONS.rust;
		case "java":
			return FILE_ICONS.java;
		case "c":
			return FILE_ICONS.c;
		case "cpp":
		case "cc":
		case "cxx":
			return FILE_ICONS.cpp;
		case "cs":
			return FILE_ICONS.csharp;
		case "rb":
			return FILE_ICONS.ruby;
		case "php":
			return FILE_ICONS.php;
		case "swift":
			return FILE_ICONS.swift;
		case "kt":
		case "kts":
			return FILE_ICONS.kotlin;
		case "scala":
			return FILE_ICONS.scala;

		// Web
		case "html":
		case "htm":
			return FILE_ICONS.html;
		case "css":
			return FILE_ICONS.css;
		case "scss":
			return FILE_ICONS.scss;
		case "sass":
			return FILE_ICONS.sass;
		case "less":
			return FILE_ICONS.less;

		// Data/Config
		case "json":
		case "jsonc":
			return FILE_ICONS.json;
		case "yaml":
		case "yml":
			return FILE_ICONS.yaml;
		case "toml":
			return FILE_ICONS.toml;
		case "xml":
			return FILE_ICONS.xml;
		case "csv":
			return FILE_ICONS.csv;

		// Markdown/Docs
		case "md":
		case "markdown":
			return FILE_ICONS.markdown;
		case "txt":
			return FILE_ICONS.txt;
		case "pdf":
			return FILE_ICONS.pdf;

		// Images
		case "png":
			return FILE_ICONS.png;
		case "jpg":
		case "jpeg":
			return FILE_ICONS.jpeg;
		case "gif":
			return FILE_ICONS.gif;
		case "svg":
			return FILE_ICONS.svg;
		case "ico":
			return FILE_ICONS.ico;

		// Archives
		case "zip":
			return FILE_ICONS.zip;
		case "tar":
		case "gz":
		case "tgz":
			return FILE_ICONS.tar;

		// Executables
		case "exe":
			return FILE_ICONS.exe;
		case "sh":
			return FILE_ICONS.sh;
		case "bash":
			return FILE_ICONS.bash;
		case "zsh":
			return FILE_ICONS.zsh;
		case "fish":
			return FILE_ICONS.fish;

		default:
			return FILE_ICONS.default;
	}
}

/**
 * Get icon for a folder
 */
export function getFolderIcon(isOpen: boolean, useChevron = false): string {
	if (useChevron) {
		return isOpen ? FOLDER_ICONS.chevronOpen : FOLDER_ICONS.chevronClosed;
	}
	return isOpen ? FOLDER_ICONS.open : FOLDER_ICONS.closed;
}

/**
 * Special folder icons based on folder name
 */
export const SPECIAL_FOLDER_ICONS: Record<string, string> = {
	src: "📦",
	dist: "📦",
	build: "🔨",
	test: "🧪",
	tests: "🧪",
	docs: "📚",
	doc: "📚",
	documentation: "📚",
	node_modules: "📦",
	".git": "",
	".github": "",
	public: "🌐",
	assets: "🖼️",
	images: "🖼️",
	img: "🖼️",
	styles: "🎨",
	css: "🎨",
	components: "🧩",
	utils: "🔧",
	helpers: "🔧",
	lib: "📚",
	config: "⚙️",
	scripts: "📜",
	bin: "⚙️",
};

/**
 * Get special icon for a folder based on its name
 */
export function getSpecialFolderIcon(folderName: string): string | null {
	return SPECIAL_FOLDER_ICONS[folderName.toLowerCase()] ?? null;
}
