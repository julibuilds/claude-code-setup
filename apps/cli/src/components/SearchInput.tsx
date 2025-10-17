import { useKeyboard } from "@opentui/react";
import { useThemeColors } from "@repo/tui";
import { useCallback, useState } from "react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  focused: boolean;
  onSubmit?: () => void;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  focused,
  onSubmit,
}: SearchInputProps) {
  const colors = useThemeColors();
  const [cursorPosition, setCursorPosition] = useState(value.length);

  useKeyboard((evt) => {
    if (!focused) return;

    if (evt.name === "return") {
      onSubmit?.();
    } else if (evt.name === "backspace") {
      if (value.length > 0) {
        const newValue = value.slice(0, -1);
        onChange(newValue);
        setCursorPosition(newValue.length);
      }
    } else if (evt.ctrl && evt.name === "a") {
      // Select all - move cursor to end
      setCursorPosition(value.length);
    } else if (evt.ctrl && evt.name === "u") {
      // Clear line
      onChange("");
      setCursorPosition(0);
    } else if (evt.name && evt.name.length === 1 && !evt.ctrl && !evt.meta) {
      // Regular character input
      const newValue = value + evt.name;
      onChange(newValue);
      setCursorPosition(newValue.length);
    }
  });

  const displayValue = value || placeholder;
  const isPlaceholder = !value;

  return (
    <box style={{ flexDirection: "row", alignItems: "center", flexGrow: 1 }}>
      <text
        fg={
          isPlaceholder
            ? colors.text.muted
            : focused
            ? colors.text.primary
            : colors.text.secondary
        }
      >
        {displayValue}
        {focused && !isPlaceholder && cursorPosition === value.length ? "|" : ""}
      </text>
    </box>
  );
}