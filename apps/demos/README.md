# 🚀 TUI Playground

An epic interactive terminal UI playground showcasing the power of the `@repo/tui` library built with OpenTUI.

## ✨ Features

The playground includes **10 interactive demos** organized into categories:

### 🎯 Showcase Demos

1. **Data Display** - Advanced table with live data, tabs, and interactive cards

   - Faker.js integration for realistic data
   - Multi-column sortable tables with selection indicators
   - Tab navigation with keyboard controls
   - Real-time statistics and progress bars

2. **Interactive Elements** - Command menus, dialogs, toasts, and accordions

   - Raycast-style command palette (Ctrl+C)
   - Modal dialogs with keyboard navigation
   - Toast notifications (success, error, warning, info)
   - Collapsible accordion panels with J/K navigation

3. **Code Highlighting** - Syntax highlighting with Shiki

   - Multi-language support (TypeScript, Python, Rust, JavaScript)
   - Line numbers and code statistics
   - Before/after code comparison
   - GitHub Dark theme

4. **Animations** - Timeline API and loading indicators
   - Progress bars with easing functions (inOutQuad, outElastic)
   - Elastic width animations
   - Pulse effects
   - Multiple spinner styles (8 variants)
   - Wave patterns and marquee text

### 📦 Component Demos

5. **Navigation & Buttons** - Button variants, focus management, keyboard navigation
6. **Forms & Inputs** - TextInput, Select, Checkbox, Switch, Slider with Tab navigation
7. **Layout Components** - Stack, Grid, SplitView, BentoGrid, Container examples
8. **Theme System** - Live theme switching between Dark, Light, and Neon themes

### ⚙️ Primitive Demos

9. **Overlay Primitive** - Low-level overlay for dialogs and modals
10. **Progress Primitive** - Animated loading indicators and spinners

## 🎮 Usage

### Development

```bash
# Build the playground
bun run build

# Run the playground
bun run dev
```

### Install Globally

```bash
bun run setup
```

Then run from anywhere:

```bash
pg
```

## ⌨️ Keyboard Controls

### Global

- **0-9** - Select a demo from the menu
- **Q / ESC** - Return to main menu or exit
- **Arrow Keys** - Navigate within demos

### Demo-Specific

- **Ctrl+C** - Open command menu (Interactive demo)
- **Space** - Toggle dialogs/actions (varies by demo)
- **Tab** - Switch focus between inputs (Forms demo)
- **J/K** - Navigate accordion items (Interactive demo)
- **1-4** - Switch languages (Code demo)
- **C** - Toggle code comparison (Code demo)
- **R** - Restart animations (Animation demo)

## 🛠️ Development

```bash
# Install dependencies
bun install

# Build
bun run build

# Link globally (optional)
bun run link

# Clean and rebuild
bun run fresh

# Type checking
bun run check-types

# Linting
bun run lint
```

## 📚 Tech Stack

- **OpenTUI** (v0.1.27) - Terminal UI framework
- **Shiki** - Syntax highlighting engine
- **Faker.js** - Realistic fake data generation
- **Bun** - Fast JavaScript runtime and bundler
- **TypeScript** - Type safety and better DX
- **React** (v19.2.0) - Component architecture

## 🎨 Highlights

- 🔥 **10 interactive demos** showcasing different aspects of TUI development
- ⚡ **Real-time animations** using the Timeline API with easing functions
- 🎯 **Keyboard-first navigation** for maximum efficiency
- 🌈 **Theme system** with Dark, Light, and Neon variants
- 📊 **Advanced data visualization** with tables, tabs, and cards
- 💻 **Syntax highlighting** for TypeScript, Python, Rust, JavaScript, and more
- 🎬 **Timeline-based animations** with elastic, bounce, and custom easing
- 🚀 **Compiled binary** for instant startup (no Node.js required)
- 📱 **Responsive layouts** that adapt to terminal size
- 🎨 **Component library** with 20+ reusable components

## 🏗️ Architecture

The playground is structured as a menu-driven application:

```
Menu (index.tsx)
├── Showcase Demos
│   ├── DataDemo - Tables, Tabs, Cards
│   ├── InteractiveDemo - Dialogs, Toasts, Accordions
│   ├── CodeDemo - Syntax highlighting
│   └── AnimationDemo - Timeline animations
├── Component Demos
│   ├── NavigationDemo
│   ├── FormsDemo
│   ├── LayoutsDemo
│   └── ThemeDemo
└── Primitive Demos
    ├── OverlayDemo
    └── ProgressDemo
```

Each demo is self-contained and demonstrates specific features of the TUI library.

## 📦 Building

```bash
bun run build
```

This compiles the app into a standalone executable at `dist/playground` that includes:

- All dependencies bundled
- Bun runtime embedded
- No external dependencies required
- Fast startup time (~100ms)

## 🎯 What's New

This mega upgrade includes:

- ✅ **2 new showcase demos** (Code & Animation)
- ✅ **Enhanced DataDemo** with faker.js and advanced tables
- ✅ **Upgraded InteractiveDemo** with command menu, toasts, and accordions
- ✅ **Improved menu** with categories and icons
- ✅ **Better keyboard navigation** throughout all demos
- ✅ **Real-time statistics** and progress indicators
- ✅ **Professional documentation** with detailed usage instructions

## 🤝 Contributing

This playground serves as both a demo and a testing ground for the TUI library. Feel free to:

- Add new demos
- Enhance existing demos
- Report bugs or suggest improvements
- Use as a reference for your own TUI applications

## 📄 License

Part of the turborepo-starter monorepo.
