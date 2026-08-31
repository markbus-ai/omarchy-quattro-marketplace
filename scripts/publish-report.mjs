#!/usr/bin/env node
/**
 * publish-report.mjs
 *
 * Posts or updates a bot comment on a GitHub issue.
 * Uses the gh CLI — no external npm dependencies.
 *
 * Usage:
 *   node scripts/publish-report.mjs --issue=123 --file=report.md --marker="<!-- validation-report -->"
 *
 * Behavior:
 *   - Finds existing comment containing the marker
 *   - Updates it if found, creates new if not
 *   - Exits 0 on success, 1 on error
 */

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {};
  for (const arg of args) {
    const match = arg.match(/^--([a-zA-Z_]+)=(.+)$/);
    if (match) {
      opts[match[1]] = match[2];
    }
  }
  return opts;
}

const opts = parseArgs();
const issueNumber = opts.issue;
const filePath = opts.file;
const marker = opts.marker || "<!-- validation-report -->";

if (!issueNumber) {
  process.stderr.write("Error: --issue=N is required.\n");
  process.exit(1);
}

if (!filePath) {
  process.stderr.write("Error: --file=path is required.\n");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Read report content
// ---------------------------------------------------------------------------

let reportBody;
try {
  reportBody = readFileSync(filePath, "utf-8");
} catch (err) {
  process.stderr.write(`Error: Cannot read report file: ${err.message}\n`);
  process.exit(1);
}

// Wrap with marker so we can find it later
const commentBody = `${marker}\n${reportBody}`;

// ---------------------------------------------------------------------------
// Find existing bot comment with the marker
// ---------------------------------------------------------------------------

function gh(args, opts = {}) {
  return execSync(`gh ${args}`, {
    encoding: "utf-8",
    stdio: ["pipe", "pipe", "pipe"],
    ...opts,
  }).trim();
}

let existingCommentId = null;

try {
  // List comments on the issue, find one containing our marker
  const commentsJson = gh(
    `api repos/{owner}/{repo}/issues/${issueNumber}/comments --paginate --jq '.[] | select(.body | contains("${marker}")) | .id'`
  );

  // The output may be multi-line (one ID per line) — take the first
  const ids = commentsJson
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (ids.length > 0) {
    existingCommentId = ids[0];
  }
} catch {
  // No existing comment found — that's fine, we'll create one
}

// ---------------------------------------------------------------------------
// Create or update the comment
// ---------------------------------------------------------------------------

try {
  if (existingCommentId) {
    gh(
      `api repos/{owner}/{repo}/issues/comments/${existingCommentId} -X PATCH -f body='${commentBody.replace(/'/g, "'\\''")}'`
    );
    process.stdout.write(
      `✅ Updated existing comment #${existingCommentId} on issue #${issueNumber}\n`
    );
  } else {
    gh(
      `api repos/{owner}/{repo}/issues/${issueNumber}/comments -X POST -f body='${commentBody.replace(/'/g, "'\\''")}'`
    );
    process.stdout.write(`✅ Created new comment on issue #${issueNumber}\n`);
  }
} catch (err) {
  process.stderr.write(`Error: Failed to post comment: ${err.message}\n`);
  process.exit(1);
}
