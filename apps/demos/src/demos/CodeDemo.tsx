import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { CodeBlock, createDefaultHighlighter, useThemeColors } from "@repo/tui";
import { useEffect, useState } from "react";
import type { Highlighter } from "shiki";

const codeExamples = {
	typescript: `interface User {
  id: string;
  name: string;
  email: string;
}

async function fetchUser(id: string): Promise<User> {
  const response = await fetch(\`/api/users/\${id}\`);
  return response.json();
}`,
	python: `def fibonacci(n: int) -> int:
    """Calculate the nth Fibonacci number."""
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

# Generate first 10 numbers
result = [fibonacci(i) for i in range(10)]
print(result)`,
	rust: `fn main() {
    let numbers = vec![1, 2, 3, 4, 5];
    
    let sum: i32 = numbers
        .iter()
        .filter(|&&x| x % 2 == 0)
        .sum();
    
    println!("Sum of even numbers: {}", sum);
}`,
	javascript: `// Before: Imperative style
function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}

// After: Functional style
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}`,
};

export function CodeDemo() {
	const colors = useThemeColors();
	const [highlighter, setHighlighter] = useState<Highlighter | null>(null);
	const [selectedExample, setSelectedExample] = useState<
		"typescript" | "python" | "rust" | "javascript"
	>("typescript");
	const [showComparison, setShowComparison] = useState(false);

	useEffect(() => {
		createDefaultHighlighter().then((h) => {
			if (h) setHighlighter(h);
		});
	}, []);

	useKeyboard((key) => {
		if (key.name === "1") setSelectedExample("typescript");
		if (key.name === "2") setSelectedExample("python");
		if (key.name === "3") setSelectedExample("rust");
		if (key.name === "4") setSelectedExample("javascript");
		if (key.name === "c") setShowComparison(!showComparison);
	});

	return (
		<box flexGrow={1} style={{ padding: 2, flexDirection: "column", gap: 1 }}>
			<box alignItems="center">
				<ascii-font font="tiny" text="Code Showcase" />
			</box>

			{!highlighter ? (
				<box key="loading" flexGrow={1} alignItems="center" justifyContent="center">
					<text fg={colors.accent.primary}>Loading syntax highlighter...</text>
				</box>
			) : (
				<box key="content" style={{ flexDirection: "row", gap: 2, flexGrow: 1 }}>
					{/* Left: Code Examples */}
					<box style={{ flexDirection: "column", gap: 1, flexGrow: 2 }}>
						{/* Language Selector */}
						<box border title="Select Language" style={{ padding: 1 }}>
							<box style={{ flexDirection: "row", gap: 2 }}>
								<text
									fg={selectedExample === "typescript" ? colors.accent.primary : colors.text.muted}
									attributes={selectedExample === "typescript" ? TextAttributes.BOLD : undefined}
								>
									[1] TypeScript
								</text>
								<text
									fg={selectedExample === "python" ? colors.accent.primary : colors.text.muted}
									attributes={selectedExample === "python" ? TextAttributes.BOLD : undefined}
								>
									[2] Python
								</text>
								<text
									fg={selectedExample === "rust" ? colors.accent.primary : colors.text.muted}
									attributes={selectedExample === "rust" ? TextAttributes.BOLD : undefined}
								>
									[3] Rust
								</text>
								<text
									fg={selectedExample === "javascript" ? colors.accent.primary : colors.text.muted}
									attributes={selectedExample === "javascript" ? TextAttributes.BOLD : undefined}
								>
									[4] JavaScript
								</text>
							</box>
						</box>

						{/* Code Display */}
						<box
							border
							title={`${selectedExample.charAt(0).toUpperCase() + selectedExample.slice(1)} Example`}
							style={{ flexGrow: 1 }}
						>
							<CodeBlock
								code={codeExamples[selectedExample]}
								highlighter={highlighter}
								lang={selectedExample as "typescript" | "python" | "rust" | "javascript"}
								theme="github-dark-default"
								showLineNumbers={true}
								padding={1}
							/>
						</box>
					</box>

					{/* Right: Comparison & Info */}
					<box style={{ flexDirection: "column", gap: 1, flexGrow: 1 }}>
						{/* Toggle Comparison */}
						<box border title="Code Comparison" style={{ padding: 1 }}>
							<box style={{ flexDirection: "row", gap: 1 }}>
								<text fg={colors.accent.secondary}>[C]</text>
								<text fg={colors.text.primary}>Toggle Comparison</text>
							</box>
							<box style={{ paddingTop: 1 }}>
								<text fg={colors.text.muted}>Status: {showComparison ? "Visible" : "Hidden"}</text>
							</box>
						</box>

						{/* Comparison Display */}
						{showComparison && highlighter && (
							<box border title="Before/After" style={{ flexGrow: 1, padding: 1 }}>
								<CodeBlock
									code={codeExamples.javascript}
									highlighter={highlighter}
									lang="javascript"
									theme="github-dark-default"
									showLineNumbers={true}
									padding={0}
								/>
							</box>
						)}

						{/* Features */}
						{!showComparison && (
							<box border title="Features" style={{ padding: 1, flexGrow: 1 }}>
								<box style={{ flexDirection: "column", gap: 1 }}>
									<box style={{ flexDirection: "column" }}>
										<text fg={colors.accent.primary} attributes={TextAttributes.BOLD}>
											✨ Syntax Highlighting
										</text>
										<text fg={colors.text.muted}>Powered by Shiki</text>
									</box>
									<box style={{ flexDirection: "column" }}>
										<text fg={colors.accent.secondary} attributes={TextAttributes.BOLD}>
											🔢 Line Numbers
										</text>
										<text fg={colors.text.muted}>Optional display</text>
									</box>
									<box style={{ flexDirection: "column" }}>
										<text fg={colors.status.success} attributes={TextAttributes.BOLD}>
											🎨 Multiple Themes
										</text>
										<text fg={colors.text.muted}>GitHub Dark default</text>
									</box>
									<box style={{ flexDirection: "column" }}>
										<text fg={colors.status.warning} attributes={TextAttributes.BOLD}>
											📝 Code Comparison
										</text>
										<text fg={colors.text.muted}>Before/after examples</text>
									</box>
									<box style={{ flexDirection: "column", paddingTop: 1 }}>
										<text fg={colors.text.secondary}>Supported Languages:</text>
										<text fg={colors.text.muted}>TypeScript, Python, Rust,</text>
										<text fg={colors.text.muted}>JavaScript, Go, and more!</text>
									</box>
								</box>
							</box>
						)}

						{/* Stats */}
						<box border title="Code Stats" style={{ padding: 1 }}>
							<box style={{ flexDirection: "column", gap: 0 }}>
								<box style={{ flexDirection: "row", justifyContent: "space-between" }}>
									<text fg={colors.text.muted}>Lines:</text>
									<text fg={colors.accent.primary}>
										{codeExamples[selectedExample].split("\n").length}
									</text>
								</box>
								<box style={{ flexDirection: "row", justifyContent: "space-between" }}>
									<text fg={colors.text.muted}>Characters:</text>
									<text fg={colors.accent.secondary}>{codeExamples[selectedExample].length}</text>
								</box>
								<box style={{ flexDirection: "row", justifyContent: "space-between" }}>
									<text fg={colors.text.muted}>Language:</text>
									<text fg={colors.status.info}>{selectedExample}</text>
								</box>
							</box>
						</box>
					</box>
				</box>
			)}

			{/* Footer instructions */}
			{highlighter && (
				<box alignItems="center">
					<text fg={colors.text.muted}>Press 1-4 to switch languages • C to toggle comparison</text>
				</box>
			)}
		</box>
	);
}
