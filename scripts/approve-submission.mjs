#!/usr/bin/env node
/**
 * approve-submission.mjs
 *
 * Handles a validated theme submission by:
 * 1. Parsing the issue body (reuses intake logic)
 * 2. Cloning the submitted repo at HEAD
 * 3. Copying theme.yaml, colors.toml, preview.png into themes/<slug>/
 * 4. Adding source metadata to theme.yaml
 * 5. Updating registry.json
 *
 * Environment variables (set by GitHub Actions workflow):
 *   ISSUE_NUMBER  — GitHub issue number
 *   ISSUE_TITLE   — Issue title (must start with [Theme]:)
 *   ISSUE_BODY    — Issue body (markdown form)
 *   APPROVER      — GitHub username of the maintainer who approved
 *   GITHUB_OUTPUT — Path to $GITHUB_OUTPUT file
 *
 * Usage: node scripts/approve-submission.mjs
 * Exit 0 on success, exit 1 on error.
 */

import { appendFileSync, readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { execSync } from "node:child_process";
import { parse as parseYaml } from "yaml";
import { stringify as stringifyYaml } from "yaml";

// ---------------------------------------------------------------------------
// Env
// ---------------------------------------------------------------------------

const ISSUE_NUMBER = process.env.ISSUE_NUMBER || "";
const ISSUE_TITLE = process.env.ISSUE_TITLE || "";
const ISSUE_BODY = process.env.ISSUE_BODY || "";
const APPROVER = process.env.APPROVER || "";
const GITHUB_OUTPUT = process.env.GITHUB_OUTPUT || "";

// ---------------------------------------------------------------------------
// Helpers (adapted from intake-submission.mjs)
// ---------------------------------------------------------------------------

function extractField(body, fieldName) {
  const regex = new RegExp(
    `### ${escapeRegex(fieldName)}\\s*\\n\\n([\\s\\S]*?)(?=\\n### |\\n---|$)`,
    "i"
  );
  const match = body.match(regex);
  if (!match) return "";
  return match[1].trim();
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function setOutput(key, value) {
  const line = `${key}=${value}\n`;
  if (GITHUB_OUTPUT) {
    appendFileSync(GITHUB_OUTPUT, line);
  }
  process.stdout.write(`::set-output name=${key}::${value}\n`);
}

function isGitHubHttpsUrl(url) {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      parsed.hostname === "github.com" &&
      parsed.pathname.split("/").filter(Boolean).length >= 2
    );
  } catch {
    return false;
  }
}

function deriveSlug(themeName) {
  // Remove "omarchy-" prefix and "-theme" suffix, lowercase
  let slug = themeName
    .toLowerCase()
    .replace(/^omarchy-/, "")
    .replace(/-theme$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug;
}

function cloneRepo(repoUrl, destPath) {
  execSync(`git clone --depth 1 "${repoUrl}.git" "${destPath}"`, {
    stdio: ["pipe", "pipe", "pipe"],
    timeout: 60_000,
  });
}

function getHeadSha(repoPath) {
  return execSync("git rev-parse HEAD", {
    cwd: repoPath,
    encoding: "utf-8",
  }).trim();
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  // 1. Validate inputs
  if (!ISSUE_TITLE) {
    process.stderr.write("Error: ISSUE_TITLE is required.\n");
    process.exit(1);
  }
  if (!ISSUE_BODY) {
    process.stderr.write("Error: ISSUE_BODY is required.\n");
    process.exit(1);
  }
  if (!ISSUE_TITLE.startsWith("[Theme]:")) {
    process.stderr.write(`Error: Issue title must start with "[Theme]:". Got: "${ISSUE_TITLE}"\n`);
    process.exit(1);
  }

  // 2. Parse theme name and metadata from issue
  const themeName = ISSUE_TITLE.replace(/^\[Theme\]:\s*/, "").trim();
  if (!themeName) {
    process.stderr.write("Error: Theme name is empty after prefix.\n");
    process.exit(1);
  }

  const slug = deriveSlug(themeName);
  const repoUrl = extractField(ISSUE_BODY, "Repository URL");
  const mood = extractField(ISSUE_BODY, "Theme Mood");
  const colorFamily = extractField(ISSUE_BODY, "Color Family");
  const tagsRaw = extractField(ISSUE_BODY, "Tags");
  const description = extractField(ISSUE_BODY, "Theme Description");

  if (!repoUrl || !isGitHubHttpsUrl(repoUrl)) {
    process.stderr.write(`Error: Invalid or missing Repository URL. Got: "${repoUrl}"\n`);
    process.exit(1);
  }

  // 3. Check if theme already exists in registry
  const themesDir = resolve(process.cwd(), "themes");
  const targetDir = join(themesDir, slug);

  if (existsSync(targetDir)) {
    process.stderr.write(`Error: Theme directory already exists: themes/${slug}/\n`);
    process.stderr.write("This theme has already been approved. Aborting.\n");
    process.exit(1);
  }

  // 4. Clone the submitted repo
  const tmpDir = join(resolve(process.cwd()), ".tmp-clone");
  process.stdout.write(`Cloning ${repoUrl} ...\n`);
  try {
    cloneRepo(repoUrl, tmpDir);
  } catch (err) {
    process.stderr.write(`Error: Failed to clone repository: ${err.message}\n`);
    process.exit(1);
  }

  const headSha = getHeadSha(tmpDir);
  process.stdout.write(`HEAD commit: ${headSha}\n`);

  // 5. Copy files into themes/<slug>/
  mkdirSync(targetDir, { recursive: true });

  const filesToCopy = ["theme.yaml", "colors.toml", "preview.png"];
  for (const file of filesToCopy) {
    const src = join(tmpDir, file);
    const dest = join(targetDir, file);
    try {
      const content = readFileSync(src);
      writeFileSync(dest, content);
    } catch {
      process.stderr.write(`Error: Required file "${file}" not found in submitted repo.\n`);
      process.exit(1);
    }
  }

  // 6. Add source metadata to theme.yaml
  const yamlPath = join(targetDir, "theme.yaml");
  const yamlContent = readFileSync(yamlPath, "utf-8");
  const themeData = parseYaml(yamlContent);

  // Set source field
  themeData.source = {
    repository: repoUrl,
    commit: headSha,
    submitted_by: extractField(ISSUE_BODY, "Submitter GitHub Username") || undefined,
    approved_at: new Date().toISOString(),
  };

  // Write back with source metadata
  writeFileSync(yamlPath, stringifyYaml(themeData, { lineWidth: 0, quotingType: '"' }));

  // 7. Clean up temp clone
  try {
    execSync(`rm -rf "${tmpDir}"`, { stdio: "pipe" });
  } catch {
    // Best effort cleanup
  }

  // 8. Output for downstream workflow steps
  setOutput("theme_name", slug);
  setOutput("theme_display_name", themeName);
  setOutput("commit_sha", headSha);

  process.stdout.write(`\n✅ Theme "${themeName}" (${slug}) copied to themes/${slug}/\n`);
  process.stdout.write(`   Source: ${repoUrl}@${headSha}\n`);
  process.stdout.write(`   Approved by: ${APPROVER}\n`);
}

main();
