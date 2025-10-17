import { useKeyboard } from "@opentui/react";
import { useThemeColors } from "@repo/tui";
import { useState } from "react";

export function FormsDemo() {
	const colors = useThemeColors();
	const [focused, setFocused] = useState<"username" | "email">("username");
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [submitted, setSubmitted] = useState(false);

	useKeyboard((key) => {
		if (key.name === "tab") {
			setFocused((prev) => (prev === "username" ? "email" : "username"));
		}
		if (key.name === "return" && focused === "email") {
			setSubmitted(true);
		}
	});

	return (
		<box flexGrow={1} alignItems="center" justifyContent="center">
			<box style={{ padding: 2, width: 60 }}>
				<ascii-font font="tiny" text="Forms & Inputs" />

				<box style={{ paddingTop: 2, paddingBottom: 1 }}>
					<text fg={colors.text.muted}>Tab to switch fields, Enter to submit</text>
				</box>

				<box style={{ flexDirection: "column", gap: 1, paddingTop: 2 }}>
					<box
						title="Username"
						border
						borderStyle={focused === "username" ? "double" : "single"}
						style={{ height: 3 }}
					>
						<input
							placeholder="Enter username..."
							onInput={setUsername}
							focused={focused === "username"}
						/>
					</box>

					<box
						title="Email"
						border
						borderStyle={focused === "email" ? "double" : "single"}
						style={{ height: 3 }}
					>
						<input placeholder="Enter email..." onInput={setEmail} focused={focused === "email"} />
					</box>
				</box>

				{submitted && (
					<box style={{ paddingTop: 2 }} border borderStyle="rounded">
						<box style={{ padding: 1 }}>
							<text fg={colors.accent.secondary}>✓ Form Submitted!</text>
							<text fg={colors.text.muted}>Username: {username}</text>
							<text fg={colors.text.muted}>Email: {email}</text>
						</box>
					</box>
				)}
			</box>
		</box>
	);
}
