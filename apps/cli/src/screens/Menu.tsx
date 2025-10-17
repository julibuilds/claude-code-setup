import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useThemeColors } from "@repo/tui";
import { useState } from "react";
import { SCREENS, type Screen } from "../constants";

interface MenuProps {
  onNavigate: (screen: Screen) => void;
}

interface MenuItem {
  key: string;
  screen: Screen;
  label: string;
  description: string;
  icon: string;
}

const menuItems: MenuItem[] = [
  {
    key: "1",
    screen: SCREENS.ADVANCED_CONFIG,
    label: "Advanced Config",
    description:
      "Configure models, providers, and router settings with advanced tools",
    icon: "⚙️",
  },
  {
    key: "2",
    screen: SCREENS.DEPLOY,
    label: "Deploy",
    description: "Deploy configuration to Cloudflare Workers",
    icon: "🚀",
  },
  {
    key: "3",
    screen: SCREENS.SECRETS,
    label: "Secrets Manager",
    description: "Manage Cloudflare Workers secrets",
    icon: "🔐",
  },
  {
    key: "4",
    screen: SCREENS.ZAI_PROVIDER,
    label: "ZAI Provider",
    description: "Configure ZAI provider settings",
    icon: "🤖",
  },
];

export function Menu({ onNavigate }: MenuProps) {
  const colors = useThemeColors();
  const [selectedIndex, setSelectedIndex] = useState(0);

  useKeyboard((evt) => {
    if (evt.name === "up") {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    } else if (evt.name === "down") {
      setSelectedIndex((prev) => Math.min(menuItems.length - 1, prev + 1));
    } else if (evt.name === "return") {
      const selectedItem = menuItems[selectedIndex];
      if (selectedItem) {
        onNavigate(selectedItem.screen);
      }
    } else if (evt.name === "escape" || evt.name === "q") {
      process.exit(0);
    } else {
      // Number key shortcuts
      const item = menuItems.find((m) => m.key === evt.name);
      if (item) {
        onNavigate(item.screen);
      }
    }
  });

  return (
    <box alignItems="center" justifyContent="center" flexGrow={1}>
      <box style={{ padding: 2, maxWidth: 80 }}>
        {/* Header */}
        <box alignItems="center">
          <ascii-font font="block" text="CCR" />
        </box>
        <box alignItems="center" style={{ paddingTop: 1 }}>
          <text fg={colors.accent.primary} attributes={TextAttributes.BOLD}>
            Claude Code Router CLI
          </text>
        </box>
        <box alignItems="center">
          <text fg={colors.text.muted}>
            Cloudflare Workers Configuration Manager
          </text>
        </box>

        {/* Menu items */}
        <box style={{ paddingTop: 2 }}>
          {menuItems.map((item, index) => {
            const isSelected = index === selectedIndex;
            return (
              <box key={item.key} style={{ paddingTop: index === 0 ? 0 : 1 }}>
                <box style={{ flexDirection: "row", gap: 1 }}>
                  <text
                    fg={isSelected ? colors.accent.primary : colors.text.muted}
                  >
                    {isSelected ? "▶" : " "}
                  </text>
                  <text
                    fg={
                      isSelected ? colors.accent.primary : colors.text.primary
                    }
                    attributes={isSelected ? TextAttributes.BOLD : 0}
                  >
                    [{item.key}]
                  </text>
                  <text fg={colors.text.primary}>{item.icon}</text>
                  <text
                    fg={
                      isSelected ? colors.accent.primary : colors.text.primary
                    }
                    attributes={isSelected ? TextAttributes.BOLD : 0}
                  >
                    {item.label}
                  </text>
                </box>
                <box style={{ paddingLeft: 4 }}>
                  <text fg={colors.text.muted}>{item.description}</text>
                </box>
              </box>
            );
          })}
        </box>

        {/* Footer */}
        <box style={{ paddingTop: 2 }} alignItems="center">
          <text fg={colors.text.muted}>
            Press 1-4 or ↑↓ + Enter to select • Press Q or ESC to exit
          </text>
        </box>
      </box>
    </box>
  );
}
