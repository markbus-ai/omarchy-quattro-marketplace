/**
 * Theme schema types for Omarchy Quattro Marketplace.
 *
 * These types define the contract between theme files (theme.yaml + colors.toml)
 * and the generated registry.json. The 24 PaletteKey values match Omarchy 4's
 * semantic color system.
 */

// ---------------------------------------------------------------------------
// Palette keys — the 24 semantic color slots every theme must fill
// ---------------------------------------------------------------------------

export const PALETTE_KEYS = [
  // UI chrome
  "background",
  "foreground",
  "cursor",
  "selection_foreground",
  "selection_background",
  "border",

  // Standard ANSI colors (dark variants)
  "color0",
  "color1",
  "color2",
  "color3",
  "color4",
  "color5",
  "color6",
  "color7",

  // Standard ANSI colors (bright variants)
  "color8",
  "color9",
  "color10",
  "color11",
  "color12",
  "color13",
  "color14",
  "color15",

  // Accent
  "accent",

  // Comment color (used for comments, muted text)
  "comment",
] as const;

export type PaletteKey = (typeof PALETTE_KEYS)[number];

/** Number of required palette keys — enforced at build time. */
export const PALETTE_KEY_COUNT = PALETTE_KEYS.length; // 24

// ---------------------------------------------------------------------------
// Enums from theme.yaml
// ---------------------------------------------------------------------------

export const MOOD_VALUES = [
  "dark",
  "light",
  "warm",
  "cool",
  "neon",
  "pastel",
  "earthy",
  "monochrome",
] as const;

export type Mood = (typeof MOOD_VALUES)[number];

export const COLOR_FAMILY_VALUES = [
  "red",
  "orange",
  "yellow",
  "green",
  "cyan",
  "blue",
  "purple",
  "pink",
  "neutral",
] as const;

export type ColorFamily = (typeof COLOR_FAMILY_VALUES)[number];

// ---------------------------------------------------------------------------
// Theme metadata — matches theme.yaml fields
// ---------------------------------------------------------------------------

export interface ThemeMetadata {
  /** Human-readable theme name (2-50 chars, unique). */
  name: string;

  /** URL-safe identifier — kebab-case, unique across registry. */
  slug: string;

  /** Theme author name (non-empty). */
  author: string;

  /** Semver version string. */
  version: string;

  /** Short description (10-200 chars). */
  description: string;

  /** One or more mood tags. */
  mood: Mood[];

  /** Primary color family. */
  color_family: ColorFamily;

  /** 1-10 kebab-case tags for search indexing. */
  tags: string[];

  /** Hyprland version this theme targets (e.g. "4.x"). */
  hyprland_version: string;

  /** SPDX license identifier. */
  license: string;

  /** Relative path to the theme preview screenshot. */
  preview: string;

  /** Optional URL to upstream repository. */
  install_url?: string;

  /** Source provenance for submitted themes (set by the approval workflow). */
  source?: {
    repository: string;
    commit?: string;
    submitted_by?: string;
    approved_at?: string;
  };
}

// ---------------------------------------------------------------------------
// Registry entry — theme.yaml fields + palette from colors.toml
// ---------------------------------------------------------------------------

export type Palette = Record<PaletteKey, string>;

export interface ThemeRegistryEntry extends ThemeMetadata {
  /** The 24-color palette extracted from colors.toml. */
  palette: Palette;
}

// ---------------------------------------------------------------------------
// Full registry — the generated registry.json structure
// ---------------------------------------------------------------------------

export type ThemeRegistry = ThemeRegistryEntry[];
