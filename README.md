# Omarchy Quattro Marketplace

A static marketplace site for discovering and installing themes for Omarchy 4. Built with Astro, Tailwind CSS, and Pagefind for search.

## Quick Install

```bash
curl -fsSL https://raw.githubusercontent.com/markbus-ai/omarchy-quattro-marketplace/main/scripts/install.sh | bash
```

Or install a specific theme directly:

```bash
curl -fsSL https://raw.githubusercontent.com/markbus-ai/omarchy-quattro-marketplace/main/scripts/install.sh | bash -s -- --theme catppuccin-mocha
```

## Local Development

```bash
npm install
npm run dev        # Start dev server at localhost:4321
npm run build      # Build for production
npm run preview    # Preview production build
```

## Contributing a Theme

### 1. Create your theme directory

```bash
mkdir -p themes/my-theme
```

### 2. Create `theme.yaml`

```yaml
name: My Theme                          # 2-50 chars, unique
slug: my-theme                          # kebab-case, unique
author: Your Name                       # non-empty
version: 1.0.0                          # semver
description: "A short description of the theme"  # 10-200 chars
mood:
  - dark        # one or more: dark, light, warm, cool, neon, pastel, earthy, monochrome
color_family: blue  # one of: red, orange, yellow, green, cyan, blue, purple, pink, neutral
tags:
  - minimal     # 1-10 kebab-case tags (max 24 chars each)
hyprland_version: "4.x"
license: MIT       # SPDX license identifier
preview: preview.png
```

### 3. Create `colors.toml`

The palette requires exactly **24 keys** — 6 UI chrome colors, 16 ANSI colors, and 1 accent:

```toml
# UI chrome
background = "#1a1b26"       # Main background
foreground = "#c0caf5"       # Main text
cursor = "#c0caf5"           # Cursor color
selection_foreground = "#1a1b26"  # Selected text
selection_background = "#c0caf5"  # Selection highlight
border = "#3b4261"           # Border color

# ANSI colors (dark variants)
color0 = "#15161e"           # Black
color1 = "#f7768e"           # Red
color2 = "#9ece6a"           # Green
color3 = "#e0af68"           # Yellow
color4 = "#7aa2f7"           # Blue
color5 = "#bb9af7"           # Magenta
color6 = "#7dcfff"           # Cyan
color7 = "#a9b1d6"           # White

# ANSI colors (bright variants)
color8 = "#414868"           # Bright Black
color9 = "#f7768e"           # Bright Red
color10 = "#9ece6a"          # Bright Green
color11 = "#e0af68"          # Bright Yellow
color12 = "#7aa2f7"          # Bright Blue
color13 = "#bb9af7"          # Bright Magenta
color14 = "#7dcfff"          # Bright Cyan
color15 = "#c0caf5"          # Bright White

# Accent
accent = "#7aa2f7"           # Primary accent color
```

All colors must be valid `#RRGGBB` hex values.

### 4. Add a preview screenshot

Save a `preview.png` (recommended: 640x400 or 16:10 ratio) showing your theme applied to a terminal.

### 5. Validate locally

```bash
npm run validate     # Validates YAML, TOML, palette keys, and hex colors
npm run generate     # Regenerates registry.json
```

### 6. Submit a pull request

Your PR must pass CI checks which verify:
- `theme.yaml` passes schema validation
- `colors.toml` has all 24 palette keys with valid hex colors
- `preview.png` exists and is a valid image
- Astro build succeeds
- HTML output passes html-validate

### PR Checklist

- [ ] `theme.yaml` follows the schema above
- [ ] `colors.toml` has exactly 24 palette keys (all `#RRGGBB`)
- [ ] `preview.png` exists in the theme directory
- [ ] `npm run validate` passes locally
- [ ] `npm run build` succeeds locally
- [ ] Theme name, slug, and tags are unique

## Project Structure

```
/
├── public/                    # Static assets (favicon, etc.)
├── scripts/
│   ├── generate-registry.ts   # Builds registry.json from themes/
│   ├── validate-themes.ts     # CI entry point for theme validation
│   └── install.sh             # One-liner curl installer
├── src/
│   ├── components/            # Astro components
│   │   ├── FilterBar.astro    # Mood/color/tag filter toggles
│   │   ├── PaletteGrid.astro  # 24-color palette swatch grid
│   │   ├── SearchInput.astro  # Debounced search input
│   │   └── ThemeCard.astro    # Theme card with preview
│   ├── data/
│   │   └── theme-schema.ts    # TypeScript types and palette constants
│   ├── layouts/
│   │   └── Base.astro         # Site shell (nav, footer, skip link)
│   ├── pages/
│   │   ├── index.astro        # Homepage — theme grid
│   │   ├── 404.astro          # Custom 404 page
│   │   └── themes/
│   │       └── [slug].astro   # Dynamic theme detail pages
│   └── styles/
│       └── global.css         # Tailwind config and base styles
├── themes/                    # Theme definitions (theme.yaml + colors.toml)
├── .github/workflows/
│   ├── ci.yml                 # PR validation pipeline
│   └── deploy.yml             # GitHub Pages deployment
├── registry.json              # Generated theme registry
└── package.json
```

## License

MIT
