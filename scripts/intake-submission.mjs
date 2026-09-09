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
import { randomBytes } from "node:crypto";
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

function sanitizeSingleLine(value) {
  return String(value ?? "").replace(/[\r\n]+/g, " ").trim();
}

function setOutput(key, value) {
  const str = String(value ?? "");
  if (GITHUB_OUTPUT) {
    if (str.includes("\n") || str.includes("\r")) {
      let delimiter = `EOF_${randomBytes(16).toString("hex")}`;
      while (str.includes(delimiter)) {
        delimiter = `EOF_${randomBytes(16).toString("hex")}`;
      }
      appendFileSync(GITHUB_OUTPUT, `${key}<<${delimiter}\n${str}\n${delimiter}\n`);
    } else {
      appendFileSync(GITHUB_OUTPUT, `${key}=${str}\n`);
    }
  }
  // Always log for debugging (single-line sanitized to avoid log injection)
  process.stdout.write(`::set-output name=${key}::${sanitizeSingleLine(str)}\n`);
}

function normalizeRepoUrl(raw) {
  if (!raw) return "";
  let v = String(raw).trim().split("#")[0].split("?")[0].trim();
  v = v.replace(/\/+$/, "");
  if (v.toLowerCase().endsWith(".git")) {
    v = v.slice(0, -4);
  }
  return v.replace(/\/+$/, "");
}

function isStrictGitHubRepoUrl(url) {
  return /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/.test(url);
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

  // Title prefix is preferred but not required: issues created from the
  // submission template may carry a plain title (GitHub does not enforce
  // a title pattern, and the template label may be silently dropped).
  // Fall back to the full trimmed title instead of failing so existing
  // issues (e.g. #9, #10) still validate.
  let themeName;
  if (title.startsWith("[Theme]:")) {
    // Extract theme name from title: "[Theme]: My Theme Name" -> "My Theme Name"
    themeName = sanitizeSingleLine(title.replace(/^\[Theme\]:\s*/, ""));
  } else {
    process.stderr.write(
      `Warning: Issue title does not start with "[Theme]:". Using full title as theme name. Got: "${sanitizeSingleLine(title)}"\n`
    );
    themeName = sanitizeSingleLine(title);
  }
  if (!themeName) {
    process.stderr.write("Error: Theme name is empty.\n");
    process.exit(1);
  }

  if (!body) {
    process.stderr.write("Error: No issue body provided.\n");
    process.exit(1);
  }

  // Parse fields from the issue body
  const repoUrlRaw = extractField(body, "Repository URL");
  const repoUrl = normalizeRepoUrl(repoUrlRaw);
  const mood = sanitizeSingleLine(extractField(body, "Theme Mood"));
  const colorFamily = sanitizeSingleLine(extractField(body, "Color Family"));
  const tagsRaw = sanitizeSingleLine(extractField(body, "Tags"));
  const description = extractField(body, "Theme Description").trim();

  // Validate repository URL against a strict allowlist. The value comes
  // from the issue body (attacker-controlled) and is later used in shell
  // commands, so only owner/repo characters are permitted. Normalization
  // strips a trailing .git, slashes, and query/fragment first.
  if (!repoUrl || !isStrictGitHubRepoUrl(repoUrl)) {
    process.stderr.write(
      `Error: Invalid or missing Repository URL. Expected https://github.com/<owner>/<repo>. Got: "${sanitizeSingleLine(repoUrlRaw)}"\n`
    );
    process.exit(1);
  }

  // Validate mood (case-insensitive membership in canonical MOOD_VALUES;
  // historic bodies use capitalized values like "Dark" and must keep passing)
  const validMoods = ["dark", "light", "warm", "cool", "neon", "pastel", "earthy", "monochrome"];
  if (!mood || !validMoods.includes(mood.toLowerCase())) {
    process.stderr.write(
      `Error: Invalid or missing Theme Mood. Expected one of: ${validMoods.join(", ")}. Got: "${mood}"\n`
    );
    process.exit(1);
  }

  // Validate color family (case-insensitive membership in canonical
  // COLOR_FAMILY_VALUES; historic bodies use capitalized "Pink"/"Green")
  const validFamilies = [
    "red", "orange", "yellow", "green", "cyan", "blue", "purple", "pink", "neutral",
  ];
  if (!colorFamily || !validFamilies.includes(colorFamily.toLowerCase())) {
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
