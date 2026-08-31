#!/usr/bin/env node
/**
 * copy-themes.mjs
 * Copies preview.png and wallpaper.jpg from themes/ to public/themes/
 */

import { readdirSync, mkdirSync, copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const themesDir = "themes";
const publicDir = "public/themes";

const dirs = readdirSync(themesDir).filter((d) => {
  try {
    return require("node:fs").statSync(join(themesDir, d)).isDirectory();
  } catch {
    return false;
  }
});

for (const dir of dirs) {
  const pub = join(publicDir, dir);
  mkdirSync(pub, { recursive: true });

  // Copy preview.png
  const previewSrc = join(themesDir, dir, "preview.png");
  if (existsSync(previewSrc)) {
    copyFileSync(previewSrc, join(pub, "preview.png"));
  }

  // Copy wallpaper.jpg
  const wallpaperSrc = join(themesDir, dir, "wallpaper.jpg");
  if (existsSync(wallpaperSrc)) {
    copyFileSync(wallpaperSrc, join(pub, "wallpaper.jpg"));
  }

  // Copy wallpaper.png (some themes might have png)
  const wallpaperPng = join(themesDir, dir, "wallpaper.png");
  if (existsSync(wallpaperPng)) {
    copyFileSync(wallpaperPng, join(pub, "wallpaper.png"));
  }
}

console.log(`Copied assets for ${dirs.length} themes`);
