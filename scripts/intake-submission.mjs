#!/usr/bin/env node
/**
 * intake-submission.mjs
 *
 * Parses a GitHub issue created from the "Submit a Theme" template.
 * Reads ISSUE_TITLE and ISSUE_BODY from environment variables (set by
 * the GitHub Actions issue_comment / issues workflow context).
 *
 * Outputs values to $GITHUB_OUTPUT for downstream workflow steps.
 *
 * Usage: node scripts/intake-submission.mjs
 * Exit 0 on success, exit 1 if the issue does not match the template.
 */

import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

// ---------------------------------------------------------------------------
// Env
// ---------------------------------------------------------------------------

const ISSUE_TITLE = process.env.ISSUE_TITLE || "";
const ISSUE_BODY = process.env.ISSUE_BODY || "";
const GITHUB_OUTPUT = process.env.GITHUB_OUTPUT || "";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract a field value from the GitHub issue body.
 * GitHub renders form fields as `### Field Label\n\nvalue`.
 */
function extractField(body, fieldName) {
  // Match the header line (### Field Label) and capture the next non-empty line(s)
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
  return opts;
}

function setOutput(key, value) {
  const line = `${key}=${value}\n`;
  if (GITHUB_OUTPUT) {
    appendFileSync(GITHUB_OUTPUT, line);
  }
  // Always log for debugging
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

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const opts = parseArgs();

  const title = opts["title"] || ISSUE_TITLE;
  const body = opts["body"] || ISSUE_BODY;

  if (!title) {
    process.stderr.write("Error: No issue title provided.\n");
    process.exit(1);
  }

  // Validate title prefix
  if (!title.startsWith("[Theme]:")) {
    process.stderr.write(
      `Error: Issue title does not start with "[Theme]:". Got: "${title}"\n`
    );
    process.exit(1);
  }

  // Extract theme name from title: "[Theme]: My Theme Name" -> "My Theme Name"
  const themeName = title.replace(/^\[Theme\]:\s*/, "").trim();
  if (!themeName) {
    process.stderr.write("Error: Theme name is empty after prefix.\n");
    process.exit(1);
  }

  if (!body) {
    process.stderr.write("Error: No issue body provided.\n");
    process.exit(1);
  }

  // Parse fields from the issue body
  const repoUrl = extractField(body, "Repository URL");
  const mood = extractField(body, "Theme Mood");
  const colorFamily = extractField(body, "Color Family");
  const tagsRaw = extractField(body, "Tags");
  const description = extractField(body, "Theme Description");

  // Validate repository URL
  if (!repoUrl || !isGitHubHttpsUrl(repoUrl)) {
    process.stderr.write(
      `Error: Invalid or missing Repository URL. Expected a public GitHub HTTPS URL. Got: "${repoUrl}"\n`
    );
    process.exit(1);
  }

  // Validate mood
  const validMoods = ["Dark", "Light", "Colorful", "Muted", "Warm", "Cool"];
  if (!mood || !validMoods.includes(mood)) {
    process.stderr.write(
      `Error: Invalid or missing Theme Mood. Expected one of: ${validMoods.join(", ")}. Got: "${mood}"\n`
    );
    process.exit(1);
  }

  // Validate color family
  const validFamilies = [
    "Blue", "Green", "Red", "Purple", "Orange", "Yellow", "Pink", "Gray", "Multi",
  ];
  if (!colorFamily || !validFamilies.includes(colorFamily)) {
    process.stderr.write(
      `Error: Invalid or missing Color Family. Expected one of: ${validFamilies.join(", ")}. Got: "${colorFamily}"\n`
    );
    process.exit(1);
  }

  // Description is required
  if (!description) {
    process.stderr.write("Error: Missing Theme Description.\n");
    process.exit(1);
  }

  // Tags are optional — clean up
  const tags = tagsRaw
    ? tagsRaw
        .split(",")
        .map((t) => t.trim().toLowerCase().replace(/\s+/g, "-"))
        .filter(Boolean)
        .slice(0, 3)
        .join(",")
    : "";

  // Derive expected slug from theme name
  const slug = themeName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  // Output
  setOutput("should_validate", "true");
  setOutput("should_label", "true");
  setOutput("repo_url", repoUrl);
  setOutput("theme_name", themeName);
  setOutput("theme_slug", slug);
  setOutput("mood", mood.toLowerCase());
  setOutput("color_family", colorFamily.toLowerCase());
  setOutput("tags", tags);
  setOutput("description", description);

  process.stdout.write(`\n✅ Intake parsed successfully for theme: ${themeName}\n`);
}

main();
