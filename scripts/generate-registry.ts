#!/usr/bin/env node
/**
 * generate-registry.ts
 *
 * Reads themes/{slug}/theme.yaml + colors.toml, validates against the schema,
 * and outputs registry.json (sorted by slug for deterministic output).
 *
 * Usage: npx tsx scripts/generate-registry.ts
 * Exit 0 on success, exit 1 if any theme fails validation.
 */

import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { parse as parseYaml } from "yaml";
import { parse as parseToml } from "toml";
import {
  PALETTE_KEYS,
  PALETTE_KEY_COUNT,
  MOOD_VALUES,
  COLOR_FAMILY_VALUES,
  type PaletteKey,
  type ThemeMetadata,
  type Palette,
  type ThemeRegistryEntry,
} from "../src/data/theme-schema.js";

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

interface ValidationError {
  theme: string;
  field: string;
  message: string;
}

function validateThemeMetadata(
  data: Record<string, unknown>,
  slug: string
): ValidationError[] {
  const errors: ValidationError[] = [];

  const required: [string, (v: unknown) => boolean, string][] = [
    ["name", (v) => typeof v === "string" && v.length >= 2 && v.length <= 50, "string 2-50 chars"],
    ["slug", (v) => typeof v === "string" && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(v), "kebab-case string"],
    ["author", (v) => typeof v === "string" && v.length > 0, "non-empty string"],
    ["version", (v) => typeof v === "string" && /^\d+\.\d+\.\d+/.test(v), "semver string"],
    ["description", (v) => typeof v === "string" && v.length >= 10 && v.length <= 200, "string 10-200 chars"],
    [
      "mood",
      (v) => Array.isArray(v) && v.length > 0 && v.every((m) => (MOOD_VALUES as readonly string[]).includes(m)),
      "non-empty array of valid mood values",
    ],
    [
      "color_family",
      (v) => typeof v === "string" && (COLOR_FAMILY_VALUES as readonly string[]).includes(v),
      "valid color family",
    ],
    [
      "tags",
      (v) =>
        Array.isArray(v) &&
        v.length >= 1 &&
        v.length <= 10 &&
        v.every((t) => typeof t === "string" && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(t) && t.length <= 24),
      "1-10 kebab-case tags (max 24 chars each)",
    ],
    ["hyprland_version", (v) => typeof v === "string" && /^4\.[\dx]+$/.test(v), '"4.x" format string'],
    ["license", (v) => typeof v === "string" && v.length > 0, "SPDX license identifier"],
    ["preview", (v) => typeof v === "string" && v.length > 0, "relative path to screenshot"],
  ];

  for (const [field, check, desc] of required) {
    const value = data[field];
    if (value === undefined || value === null) {
      errors.push({ theme: slug, field, message: `required field missing — expected ${desc}` });
    } else if (!check(value)) {
      errors.push({ theme: slug, field, message: `invalid value — expected ${desc}` });
    }
  }

  // install_url is optional but must be a valid HTTPS URL if present
  if (data.install_url !== undefined && data.install_url !== null) {
    const url = data.install_url;
    if (typeof url !== "string" || !/^https:\/\/(github\.com|gitlab\.com)\//.test(url)) {
      errors.push({
        theme: slug,
        field: "install_url",
        message: "must be an HTTPS URL from github.com or gitlab.com",
      });
    }
  }

  return errors;
}

function validatePalette(
  tomlData: Record<string, string>,
  slug: string
): { palette: Palette | null; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  const palette: Record<string, string> = {};

  for (const key of PALETTE_KEYS) {
    const value = tomlData[key];
    if (value === undefined || value === null) {
      errors.push({
        theme: slug,
        field: `palette.${key}`,
        message: `missing palette key "${key}"`,
      });
      continue;
    }
    if (typeof value !== "string" || !/^#[0-9a-fA-F]{6}$/.test(value)) {
      errors.push({
        theme: slug,
        field: `palette.${key}`,
        message: `invalid hex color "${value}" — expected #RRGGBB`,
      });
      continue;
    }
    palette[key] = value.toLowerCase();
  }

  if (Object.keys(palette).length < PALETTE_KEY_COUNT) {
    errors.push({
      theme: slug,
      field: "palette",
      message: `expected ${PALETTE_KEY_COUNT} keys, found ${Object.keys(palette).length}`,
    });
    return { palette: null, errors };
  }

  return { palette: palette as Palette, errors };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const themesDir = resolve(process.cwd(), "themes");
  const entries = await readdir(themesDir);
  const allErrors: ValidationError[] = [];
  const registry: ThemeRegistryEntry[] = [];

  // Track slugs for duplicate detection
  const seenSlugs = new Set<string>();

  for (const entry of entries) {
    const themeDir = join(themesDir, entry);
    const dirStat = await stat(themeDir);
    if (!dirStat.isDirectory()) continue;

    const yamlPath = join(themeDir, "theme.yaml");
    const tomlPath = join(themeDir, "colors.toml");
    const previewPath = join(themeDir, "preview.png");

    // Check required files exist
    try {
      await stat(yamlPath);
    } catch {
      allErrors.push({ theme: entry, field: "theme.yaml", message: "file not found" });
      continue;
    }
    try {
      await stat(tomlPath);
    } catch {
      allErrors.push({ theme: entry, field: "colors.toml", message: "file not found" });
      continue;
    }
    try {
      await stat(previewPath);
    } catch {
      allErrors.push({ theme: entry, field: "preview.png", message: "file not found" });
      continue;
    }

    // Parse YAML
    let yamlData: Record<string, unknown>;
    try {
      const yamlContent = await readFile(yamlPath, "utf-8");
      yamlData = parseYaml(yamlContent) as Record<string, unknown>;
    } catch (err) {
      allErrors.push({
        theme: entry,
        field: "theme.yaml",
        message: `parse error: ${err instanceof Error ? err.message : String(err)}`,
      });
      continue;
    }

    // Parse TOML
    let tomlData: Record<string, string>;
    try {
      const tomlContent = await readFile(tomlPath, "utf-8");
      tomlData = parseToml(tomlContent) as Record<string, string>;
    } catch (err) {
      allErrors.push({
        theme: entry,
        field: "colors.toml",
        message: `parse error: ${err instanceof Error ? err.message : String(err)}`,
      });
      continue;
    }

    // Validate metadata
    const metaErrors = validateThemeMetadata(yamlData, entry);
    allErrors.push(...metaErrors);

    // Check slug uniqueness
    const slug = yamlData.slug as string;
    if (slug && seenSlugs.has(slug)) {
      allErrors.push({ theme: entry, field: "slug", message: `duplicate slug "${slug}"` });
    } else if (slug) {
      seenSlugs.add(slug);
    }

    // Validate palette
    const { palette, errors: paletteErrors } = validatePalette(tomlData, entry);
    allErrors.push(...paletteErrors);

    // If no errors for this theme, add to registry
    if (paletteErrors.length === 0 && metaErrors.length === 0 && slug) {
      registry.push({
        name: yamlData.name as string,
        slug,
        author: yamlData.author as string,
        version: yamlData.version as string,
        description: yamlData.description as string,
        mood: yamlData.mood as ThemeMetadata["mood"],
        color_family: yamlData.color_family as ThemeMetadata["color_family"],
        tags: yamlData.tags as string[],
        hyprland_version: yamlData.hyprland_version as string,
        license: yamlData.license as string,
        preview: yamlData.preview as string,
        install_url: yamlData.install_url as string | undefined,
        palette,
      });
    }
  }

  // Sort by slug for deterministic output
  registry.sort((a, b) => a.slug.localeCompare(b.slug));

  if (allErrors.length > 0) {
    console.error("\n❌ Validation errors:\n");
    for (const err of allErrors) {
      console.error(`  [${err.theme}] ${err.field}: ${err.message}`);
    }
    console.error(`\n${allErrors.length} error(s) found. registry.json NOT written.`);
    process.exit(1);
  }

  // Write registry.json
  const outputPath = resolve(process.cwd(), "registry.json");
  await writeFile(outputPath, JSON.stringify(registry, null, 2) + "\n", "utf-8");

  console.log(`\n✅ registry.json generated with ${registry.length} theme(s):`);
  for (const theme of registry) {
    console.log(`   - ${theme.name} (${theme.slug})`);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
