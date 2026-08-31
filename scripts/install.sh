#!/usr/bin/env bash
# install.sh — One-liner installer for Omarchy Quattro themes
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/markbus-ai/omarchy-quattro-marketplace/main/scripts/install.sh | bash
#   curl -fsSL https://raw.githubusercontent.com/markbus-ai/omarchy-quattro-marketplace/main/scripts/install.sh | bash -s -- --theme catppuccin-mocha
#   curl -fsSL https://raw.githubusercontent.com/markbus-ai/omarchy-quattro-marketplace/main/scripts/install.sh | bash -s -- --list
#
# Options:
#   --theme <slug>   Install a specific theme by slug (skip interactive prompt)
#   --list           List all available themes and exit
#   --help           Show this help message
#
set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
REGISTRY_URL="https://raw.githubusercontent.com/markbus-ai/omarchy-quattro-marketplace/main/registry.json"
THEMES_DIR="${HOME}/.config/omarchy/themes"
REQUIRED_PALETTE_KEYS=24

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

info()  { printf "${BLUE}ℹ${NC}  %s\n" "$*"; }
ok()    { printf "${GREEN}✔${NC}  %s\n" "$*"; }
warn()  { printf "${YELLOW}⚠${NC}  %s\n" "$*"; }
err()   { printf "${RED}✖${NC}  %s\n" "$*" >&2; }
die()   { err "$@"; exit 1; }

check_deps() {
  local missing=()
  for cmd in curl jq; do
    if ! command -v "$cmd" &>/dev/null; then
      missing+=("$cmd")
    fi
  done
  if [[ ${#missing[@]} -gt 0 ]]; then
    die "Missing required dependencies: ${missing[*]}"
  fi
}

# Validate a hex color (#RRGGBB)
validate_hex() {
  [[ "$1" =~ ^#[0-9a-fA-F]{6}$ ]]
}

# ---------------------------------------------------------------------------
# Fetch registry
# ---------------------------------------------------------------------------
fetch_registry() {
  info "Fetching theme registry..."
  local registry
  registry=$(curl -fsSL "$REGISTRY_URL") || die "Failed to fetch registry from $REGISTRY_URL"
  echo "$registry"
}

# ---------------------------------------------------------------------------
# List themes
# ---------------------------------------------------------------------------
list_themes() {
  local registry
  registry=$(fetch_registry)

  local count
  count=$(echo "$registry" | jq 'length')

  printf "\n${BOLD}Available themes (${count}):${NC}\n\n"
  echo "$registry" | jq -r '.[] | "  \(.slug)\t\(.name)\tby \(.author)\t[\(.mood | join(", "))]"' | column -t -s $'\t'
  echo ""
}

# ---------------------------------------------------------------------------
# Prompt user to select a theme
# ---------------------------------------------------------------------------
select_theme() {
  local registry="$1"
  local count
  count=$(echo "$registry" | jq 'length')

  printf "\n${BOLD}Available themes:${NC}\n\n"
  echo "$registry" | jq -r 'to_entries[] | "  \(.key + 1)) \(.value.name) (\(.value.slug)) — by \(.value.author)"'
  echo ""

  local choice
  while true; do
    read -rp "Select a theme (1-${count}): " choice
    if [[ "$choice" =~ ^[0-9]+$ ]] && [[ "$choice" -ge 1 ]] && [[ "$choice" -le "$count" ]]; then
      echo "$registry" | jq -r ".[$((choice - 1))].slug"
      return
    fi
    warn "Invalid selection. Please enter a number between 1 and ${count}."
  done
}

# ---------------------------------------------------------------------------
# Install a single theme
# ---------------------------------------------------------------------------
install_theme() {
  local slug="$1"
  local registry="$2"

  # Extract theme entry from registry
  local theme_json
  theme_json=$(echo "$registry" | jq -r ".[] | select(.slug == \"${slug}\")")
  if [[ -z "$theme_json" ]]; then
    die "Theme '${slug}' not found in registry."
  fi

  local name author version
  name=$(echo "$theme_json" | jq -r '.name')
  author=$(echo "$theme_json" | jq -r '.author')
  version=$(echo "$theme_json" | jq -r '.version')

  printf "\n${BOLD}Installing: ${name} v${version} by ${author}${NC}\n"

  # Validate palette from registry (24 keys)
  local palette_keys
  palette_keys=$(echo "$theme_json" | jq '.palette | keys | length')
  if [[ "$palette_keys" -ne "$REQUIRED_PALETTE_KEYS" ]]; then
    die "Palette validation failed: expected ${REQUIRED_PALETTE_KEYS} keys, found ${palette_keys}."
  fi

  # Validate all hex colors
  local invalid_colors
  invalid_colors=$(echo "$theme_json" | jq -r '.palette | to_entries[] | select(.value | test("^#[0-9a-fA-F]{6}$") | not) | "\(.key)=\(.value)"')
  if [[ -n "$invalid_colors" ]]; then
    die "Palette validation failed: invalid hex colors found:\n${invalid_colors}"
  fi

  ok "Palette validated (${palette_keys} keys, all hex colors valid)"

  # Create themes directory
  mkdir -p "${THEMES_DIR}/${slug}"

  # Download theme files from GitHub
  local base_url="https://raw.githubusercontent.com/markbus-ai/omarchy-quattro-marketplace/main/themes/${slug}"

  info "Downloading theme.yaml..."
  curl -fsSL "${base_url}/theme.yaml" -o "${THEMES_DIR}/${slug}/theme.yaml" \
    || die "Failed to download theme.yaml for '${slug}'"

  info "Downloading colors.toml..."
  curl -fsSL "${base_url}/colors.toml" -o "${THEMES_DIR}/${slug}/colors.toml" \
    || die "Failed to download colors.toml for '${slug}'"

  info "Downloading preview.png..."
  curl -fsSL "${base_url}/preview.png" -o "${THEMES_DIR}/${slug}/preview.png" \
    || die "Failed to download preview.png for '${slug}'"

  # Write palette.json for quick programmatic access
  echo "$theme_json" | jq '.palette' > "${THEMES_DIR}/${slug}/palette.json"

  ok "Theme installed to ${THEMES_DIR}/${slug}/"
  printf "   Files: ${BOLD}theme.yaml${NC}, ${BOLD}colors.toml${NC}, ${BOLD}preview.png${NC}, ${BOLD}palette.json${NC}\n\n"
}

# ---------------------------------------------------------------------------
# Usage
# ---------------------------------------------------------------------------
usage() {
  cat <<EOF
${BOLD}Omarchy Quattro Theme Installer${NC}

Usage:
  curl -fsSL ${REGISTRY_URL%/registry.json}/scripts/install.sh | bash
  curl -fsSL ... | bash -s -- --theme <slug>
  curl -fsSL ... | bash -s -- --list

Options:
  --theme <slug>   Install a specific theme by slug
  --list           List all available themes
  --help           Show this help message

Examples:
  # Interactive mode — shows a numbered list and prompts for selection
  curl -fsSL https://raw.githubusercontent.com/markbus-ai/omarchy-quattro-marketplace/main/scripts/install.sh | bash

  # Direct install by slug
  curl -fsSL https://raw.githubusercontent.com/markbus-ai/omarchy-quattro-marketplace/main/scripts/install.sh | bash -s -- --theme catppuccin-mocha

  # List available themes
  curl -fsSL https://raw.githubusercontent.com/markbus-ai/omarchy-quattro-marketplace/main/scripts/install.sh | bash -s -- --list
EOF
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
main() {
  local theme_slug=""
  local list_only=false

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --theme)
        theme_slug="${2:-}"
        [[ -z "$theme_slug" ]] && die "Missing value for --theme"
        shift 2
        ;;
      --list)
        list_only=true
        shift
        ;;
      --help|-h)
        usage
        exit 0
        ;;
      *)
        die "Unknown option: $1 (try --help)"
        ;;
    esac
  done

  check_deps

  if $list_only; then
    list_themes
    exit 0
  fi

  local registry
  registry=$(fetch_registry)

  # If a slug was provided, install it directly; otherwise prompt
  if [[ -n "$theme_slug" ]]; then
    install_theme "$theme_slug" "$registry"
  else
    theme_slug=$(select_theme "$registry")
    install_theme "$theme_slug" "$registry"
  fi

  ok "All done! Restart your terminal or source your shell config to apply."
}

main "$@"
