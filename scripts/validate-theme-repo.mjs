#!/usr/bin/env node
/**
 * validate-theme-repo.mjs
 *
 * Validates a theme submission by cloning the repo and checking structure.
 * Designed for GitHub Actions — outputs a markdown report to stdout.
 *
 * Usage: node scripts/validate-theme-repo.mjs --repo_url <URL> --commit_sha <SHA>
 *        (or via env vars REPO_URL and COMMIT_SHA)
 *
 * Exit 0 on success, exit 1 on validation failure.
 */

import { execSync } from "node:child_process";
import { mkdirSync, rmSync, readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";

// ---------------------------------------------------------------------------
// Palette keys — must match src/data/theme-schema.ts
// ---------------------------------------------------------------------------

const PALETTE_KEYS = [
  "background",
  "foreground",
  "cursor",
  "selection_foreground",
  "selection_background",
  "border",
  "color0",
  "color1",
  "color2",
  "color3",
  "color4",
  "color5",
  "color6",
  "color7",
  "color8",
  "color9",
  "color10",
  "color11",
  "color12",
  "color13",
  "color14",
  "color15",
  "accent",
  "comment",
];

// ---------------------------------------------------------------------------
// Simple YAML parser (handles flat key: value pairs and simple nested structures)
// ---------------------------------------------------------------------------

function parseSimpleYaml(text) {
  const result = {};
  const lines = text.split("\n");
  let currentKey = null;
  let collectingArray = false;
  let arrayItems = [];

  for (const rawLine of lines) {
    const line = rawLine.replace(/\r$/, "").replace(/#.*$/, "").trimEnd();
    const stripped = line.trim();

    if (!stripped) continue;

    // Detect array items: lines like "  - value" (indented dash)
    // Use the raw line to check for leading whitespace + dash
    if (/^\s+-\s+/.test(line) && currentKey) {
      const val = stripped.replace(/^-\s+/, "").replace(/^["']|["']$/g, "");
      arrayItems.push(val);
      collectingArray = true;
      continue;
    }

    // If we were collecting an array and hit a non-array line, flush it
    if (collectingArray && currentKey) {
      result[currentKey] = arrayItems;
      collectingArray = false;
      arrayItems = [];
      currentKey = null;
    }

    // Key: Value pair (only top-level, 0 indent)
    const kvMatch = stripped.match(/^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)$/);
    if (kvMatch && !/^\s/.test(line)) {
      currentKey = kvMatch[1];
      const rawVal = kvMatch[2].trim();

      if (!rawVal) {
        // Value will come on next line(s) as array items or nested
        continue;
      }

      // Parse scalar value
      result[currentKey] = parseScalar(rawVal);
      currentKey = null;
    }
  }

  // Flush trailing array
  if (collectingArray && currentKey) {
    result[currentKey] = arrayItems;
  }

  return result;
}

function parseScalar(val) {
  if (val === "") return "";
  // Remove surrounding quotes
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    return val.slice(1, -1);
  }
  // Booleans
  if (val === "true") return true;
  if (val === "false") return false;
  // Numbers
  if (/^\d+(\.\d+)?$/.test(val)) return Number(val);
  return val;
}

// ---------------------------------------------------------------------------
// Simple TOML parser (flat key = "value" only)
// ---------------------------------------------------------------------------

function parseSimpleToml(text) {
  const result = {};
  const lines = text.split("\n");

  for (const rawLine of lines) {
    const line = rawLine.replace(/\r$/, "").trim();

    // Skip comments and empty lines
    if (!line || line.startsWith("#")) continue;

    // Handle key = "value" or key = '#RRGGBB'
    const match = line.match(/^([a-zA-Z0-9_]+)\s*=\s*(".*?"|'.*?'|#\w+)$/);
    if (match) {
      const key = match[1];
      let val = match[2];
      // Strip quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      result[key] = val;
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Parse CLI args
// ---------------------------------------------------------------------------

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, "");
    const val = args[i + 1];
    if (val && !val.startsWith("--")) {
      opts[key] = val;
    }
  }
  return {
    repoUrl: opts.repo_url || process.env.REPO_URL || "",
    commitSha: opts.commit_sha || process.env.COMMIT_SHA || "",
  };
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateTheme(cloneDir) {
  const report = [];
  let passCount = 0;
  let failCount = 0;
  let warnCount = 0;

  function pass(msg) {
    report.push(`- ✅ ${msg}`);
    passCount++;
  }

  function fail(msg) {
    report.push(`- ❌ **FAIL**: ${msg}`);
    failCount++;
  }

  function warn(msg) {
    report.push(`- ⚠️ **WARN**: ${msg}`);
    warnCount++;
  }

  // Check theme.yaml
  const yamlPath = join(cloneDir, "theme.yaml");
  if (!existsSync(yamlPath)) {
    fail("`theme.yaml` not found in repository root");
    return { report: report.join("\n"), passCount, failCount, warnCount };
  }
  pass("`theme.yaml` exists");

  let yamlData;
  try {
    const content = readFileSync(yamlPath, "utf-8");
    yamlData = parseSimpleYaml(content);
  } catch (err) {
    fail(`Failed to parse theme.yaml: ${err.message}`);
    return { report: report.join("\n"), passCount, failCount, warnCount };
  }

  // Validate required YAML fields
  const requiredFields = ["name", "slug", "author", "version", "description", "mood", "color_family", "tags", "license", "preview"];
  for (const field of requiredFields) {
    if (yamlData[field] === undefined || yamlData[field] === null || yamlData[field] === "") {
      fail(`theme.yaml missing required field: \`${field}\``);
    } else {
      pass(`theme.yaml has field \`${field}\`: ${JSON.stringify(yamlData[field]).slice(0, 60)}`);
    }
  }

  // Validate mood values
  const validMoods = ["dark", "light", "warm", "cool", "neon", "pastel", "earthy", "monochrome"];
  if (Array.isArray(yamlData.mood)) {
    const invalidMoods = yamlData.mood.filter((m) => !validMoods.includes(m));
    if (invalidMoods.length > 0) {
      fail(`Invalid mood values: ${invalidMoods.join(", ")}. Valid: ${validMoods.join(", ")}`);
    } else {
      pass(`Mood values are valid`);
    }
  }

  // Validate color family
  const validFamilies = ["red", "orange", "yellow", "green", "cyan", "blue", "purple", "pink", "neutral"];
  if (typeof yamlData.color_family === "string" && !validFamilies.includes(yamlData.color_family)) {
    fail(`Invalid color_family: "${yamlData.color_family}". Valid: ${validFamilies.join(", ")}`);
  }

  // Check colors.toml
  const tomlPath = join(cloneDir, "colors.toml");
  if (!existsSync(tomlPath)) {
    fail("`colors.toml` not found in repository root");
    return { report: report.join("\n"), passCount, failCount, warnCount };
  }
  pass("`colors.toml` exists");

  let tomlData;
  try {
    const content = readFileSync(tomlPath, "utf-8");
    tomlData = parseSimpleToml(content);
  } catch (err) {
    fail(`Failed to parse colors.toml: ${err.message}`);
    return { report: report.join("\n"), passCount, failCount, warnCount };
  }

  // Validate all 24 palette keys
  const missingKeys = [];
  for (const key of PALETTE_KEYS) {
    if (!tomlData[key]) {
      missingKeys.push(key);
    }
  }

  if (missingKeys.length > 0) {
    fail(`colors.toml missing ${missingKeys.length} palette key(s): ${missingKeys.join(", ")}`);
  } else {
    pass(`All 24 palette keys present`);
  }

  // Validate hex color format
  const invalidColors = [];
  for (const key of PALETTE_KEYS) {
    const val = tomlData[key];
    if (val && !/^#[0-9a-fA-F]{6}$/.test(val)) {
      invalidColors.push(`${key}: "${val}"`);
    }
  }

  if (invalidColors.length > 0) {
    fail(`Invalid hex colors (expected #RRGGBB): ${invalidColors.join(", ")}`);
  } else {
    pass(`All colors are valid hex (#RRGGBB)`);
  }

  // Check preview image (warn only)
  const previewPng = join(cloneDir, "preview.png");
  const previewJpg = join(cloneDir, "preview.jpg");
  if (existsSync(previewPng)) {
    pass("`preview.png` exists");
  } else if (existsSync(previewJpg)) {
    pass("`preview.jpg` exists");
  } else {
    warn("`preview.png` or `preview.jpg` not found — theme will appear without preview");
  }

  return { report: report.join("\n"), passCount, failCount, warnCount };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const { repoUrl, commitSha } = parseArgs();

  if (!repoUrl) {
    process.stderr.write("Error: Missing --repo_url or REPO_URL environment variable.\n");
    process.exit(1);
  }

  if (!commitSha) {
    process.stderr.write("Error: Missing --commit_sha or COMMIT_SHA environment variable.\n");
    process.exit(1);
  }

  // Sanitize repo URL for clone
  const cloneUrl = repoUrl.replace(/\.git$/, "");

  // Create temp directory
  const tmpDir = join(tmpdir(), `theme-validate-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  mkdirSync(tmpDir, { recursive: true });

  try {
    // Shallow clone at specific commit
    process.stdout.write(`Cloning ${repoUrl} @ ${commitSha.slice(0, 8)}...\n\n`);
    execSync(`git clone --depth 1 ${cloneUrl}.git .`, {
      cwd: tmpDir,
      stdio: "pipe",
      timeout: 60_000,
    });

    // Checkout specific commit if provided
    if (commitSha && commitSha !== "HEAD") {
      execSync(`git fetch --depth 1 origin ${commitSha}`, {
        cwd: tmpDir,
        stdio: "pipe",
        timeout: 30_000,
      });
      execSync(`git checkout ${commitSha}`, {
        cwd: tmpDir,
        stdio: "pipe",
      });
    }

    // Run validation
    const { report, passCount, failCount, warnCount } = validateTheme(tmpDir);

    // Build markdown report
    const md = [
      `## Theme Validation Report`,
      ``,
      `**Repository**: ${repoUrl}`,
      `**Commit**: ${commitSha.slice(0, 8)}`,
      ``,
      report,
      ``,
      `---`,
      `**Result**: ${failCount === 0 ? "✅ PASSED" : "❌ FAILED"}`,
      `— ${passCount} passed, ${failCount} failed, ${warnCount} warnings`,
    ].join("\n");

    process.stdout.write("\n" + md + "\n");

    if (failCount > 0) {
      process.exit(1);
    }
  } catch (err) {
    process.stderr.write(`\n❌ Validation failed with error: ${err.message}\n`);

    // Still output a report for the workflow
    const md = [
      `## Theme Validation Report`,
      ``,
      `**Repository**: ${repoUrl}`,
      `**Commit**: ${commitSha.slice(0, 8)}`,
      ``,
      `- ❌ **FAIL**: Could not clone or read repository: ${err.message}`,
      ``,
      `---`,
      `**Result**: ❌ FAILED`,
    ].join("\n");

    process.stdout.write("\n" + md + "\n");
    process.exit(1);
  } finally {
    // Cleanup
    try {
      rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // Best effort cleanup
    }
  }
}

main();
