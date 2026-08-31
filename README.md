# Omarchy Quattro Marketplace

> **The community theme gallery for Omarchy 4** — browse, preview, and install 24-color themes for your terminal, editor, and desktop.

[![Omarchy 4](https://img.shields.io/badge/Omarchy-4-blueviolet?style=flat-square)](https://omarchy.org)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

---

## [Browse Themes →](https://markbus-ai.github.io/omarchy-quattro-marketplace/)

![Theme Marketplace Screenshot](https://markbus-ai.github.io/omarchy-quattro-marketplace/themes/nebula/preview.png)

---

## Quick Install

Find a theme you like on the [marketplace](https://markbus-ai.github.io/omarchy-quattro-marketplace/), click **Copy** on the install command, then run it:

```bash
# Example: install the Nebula theme
git clone --depth 1 --filter=blob:none --sparse https://github.com/markbus-ai/omarchy-quattro-marketplace.git /tmp/omarchy-marketplace
cd /tmp/omarchy-marketplace && git sparse-checkout set themes/nebula
cp -r themes/nebula ~/.config/omarchy/themes/
rm -rf /tmp/omarchy-marketplace

# Apply it
omarchy theme set nebula
```

Or use **Aether** to generate any theme from a wallpaper:

```bash
aether --generate ~/wallpaper.jpg
```

---

## Available Themes

| Theme | Style | Colors |
|-------|-------|--------|
| **Nebula** | Cosmic purple galaxy | 🟣 |
| **Midnight Street** | Monochrome urban night | ⚫ |
| **Noise** | Pure black OLED | ⚫ |
| **Faded** | Dark abstract faded | ⚫ |
| **Liquid** | 3D dark CGI abstract | 🟤 |
| **Waves** | Monochrome wave lines | ⚫ |
| **Thunder** | Dark storm clouds | ⚫ |
| **Memento** | Skull minimalism | ⚫ |
| **Urban** | Architecture monochrome | ⚫ |
| **Obsidian** | Dark texture | ⚫ |

---

## Submit Your Theme

Got a theme? Share it with the community!

### 1. Create your theme

Your theme needs:
- `theme.yaml` — metadata (name, author, mood, etc.)
- `colors.toml` — 24 Omarchy 4 palette keys
- `preview.png` — screenshot (recommended)

Use [Aether](https://github.com/bjarneo/aether) to generate a complete theme from any wallpaper.

### 2. Push to GitHub

Push your theme to a **public** GitHub repository.

### 3. Open an Issue

Go to [Issues → Submit a Theme](https://github.com/markbus-ai/omarchy-quattro-marketplace/issues/new?template=submit-theme.yml) and fill in the form.

### 4. Wait for Approval

Automated validation checks your theme. Once approved, it's live on the marketplace automatically.

---

## Theme Structure

```
themes/my-theme/
├── theme.yaml          # Metadata
├── colors.toml         # 24-color palette
├── preview.png         # Screenshot
├── hyprland.conf       # Hyprland colors
├── ghostty.conf        # Ghostty terminal
├── alacritty.toml      # Alacritty terminal
├── kitty.conf          # Kitty terminal
├── neovim.lua          # Neovim colors
├── waybar.css          # Waybar styles
└── ...                 # Other app configs
```

### Required `colors.toml` Keys

```toml
background = "#0a0a0b"
foreground = "#e4e4e7"
cursor = "#ffffff"
selection_foreground = "#ffffff"
selection_background = "#3b82f6"
border = "#1a1a1f"
comment = "#6c7086"
accent = "#3b82f6"
color0 = "#0a0a0b"    # Black
color1 = "#ef4444"    # Red
color2 = "#22c55e"    # Green
color3 = "#eab308"    # Yellow
color4 = "#3b82f6"    # Blue
color5 = "#a855f7"    # Magenta
color6 = "#06b6d4"    # Cyan
color7 = "#e4e4e7"    # White
color8 = "#52525b"    # Bright Black
color9 = "#f87171"    # Bright Red
color10 = "#4ade80"   # Bright Green
color11 = "#facc15"   # Bright Yellow
color12 = "#60a5fa"   # Bright Blue
color13 = "#c084fc"   # Bright Magenta
color14 = "#22d3ee"   # Bright Cyan
color15 = "#ffffff"   # Bright White
```

---

## Development

```bash
git clone https://github.com/markbus-ai/omarchy-quattro-marketplace.git
cd omarchy-quattro-marketplace
npm install
npm run dev          # localhost:4321
npm run build        # production build
npm run generate     # rebuild registry.json
```

---

## Security

This marketplace performs automated security checks on submitted themes:

- **Static analysis** — scans for dangerous patterns (curl-pipe-shell, sudo, eval, etc.)
- **Exact-SHA pinning** — install commands reference the exact approved commit
- **Maintainer review** — all themes require manual approval before publication

Community themes are third-party code. Review the source before installation.

Report security concerns privately via [GitHub Security Advisories](https://github.com/markbus-ai/omarchy-quattro-marketplace/security/advisories/new).

See [SECURITY.md](SECURITY.md) for full details.

---

## Credits

- [Omarchy](https://omarchy.org) by [DHH](https://dhh.dk)
- [Aether](https://github.com/bjarneo/aether) theme generator
- Inspired by [HANCORE Plugin Marketplace](https://github.com/HANCORE-linux/omarchy-plugin-marketplace)

---

## License

MIT
