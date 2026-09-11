#!/usr/bin/env node
/**
 * scan-theme-security.mjs
 *
 * Static security scan for theme submissions.
 * Checks for dangerous patterns in theme files (TOML, YAML, conf, etc.)
 *
 * This is NOT a security audit — it's a baseline check for common risky patterns.
 *
 * Exit 0: passed or review-required
 * Exit 1: needs-fixes (blocking findings)
 */

import { readFileSync, readdirSync, lstatSync } from "node:fs";
import { join, extname } from "node:path";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const MAX_FILE_SIZE = 1024 * 1024; // 1MB per file
const MAX_FILES = 500;

const TEXT_EXTENSIONS = new Set([
  ".toml", ".yaml", ".yml", ".json", ".conf", ".cfg", ".ini",
  ".lua", ".vim", ".css", ".sh", ".bash", ".zsh", ".fish",
  ".py", ".js", ".ts", ".md", ".txt", ".lua",
]);

const BINARY_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico",
  ".ttf", ".otf", ".woff", ".woff2",
  ".mp3", ".mp4", ".wav",
]);

// Docs are never executed by a theme install, so execution-context
// patterns (sudo, eval, rm -rf, env reads) in prose/README install
// instructions would be false positives. Docs hits become `docs-*`
// capabilities (logged for transparency); only code/config files produce
// blocking findings. `docs-sudo-pkexec` is informational only and does not
// affect the outcome — README install instructions routinely mention sudo.
const DOC_EXTENSIONS = new Set([".md", ".txt"]);

// Docs-only capabilities that are informational and never affect the outcome.
// `docs-sudo-pkexec`: sudo/pkexec mentioned in README/prose install
// instructions (e.g. `sudo install ...`) is not executed by a theme install.
// Kept in the report for transparency, but excluded from the review-required
// decision. Code/config `sudo-pkexec` hits remain high-severity findings.
const DOCS_INFORMATIONAL_CAPABILITIES = new Set(["docs-sudo-pkexec"]);

// ---------------------------------------------------------------------------
// Patterns to detect (findings = blocking)
// ---------------------------------------------------------------------------

const FINDING_PATTERNS = [
  {
    id: "curl-pipe-shell",
    description: "Download piped to shell (curl/wget | sh/bash)",
    regex: /(?:curl|wget)\s+[^\n]*\|\s*(?:sh|bash|zsh|fish|dash)/gi,
    severity: "critical",
  },
  {
    id: "eval-exec",
    description: "Dynamic code execution (eval/exec)",
    regex: /\b(?:eval|exec)\s*\(/gi,
    severity: "high",
  },
  {
    id: "sudo-pkexec",
    description: "Privilege escalation (sudo/pkexec)",
    regex: /\b(?:sudo|pkexec)\b/gi,
    severity: "high",
  },
  {
    id: "dangerous-rm",
    description: "Dangerous recursive delete",
    regex: /\brm\s+(?:-[rf]+\s+|-[a-z]*r[a-z]*f|--force\s+--recursive)\s+[\/~]/gi,
    severity: "high",
  },
  {
    id: "env-file-read",
    description: "Reading sensitive env files",
    regex: /(?:cat|source|\.)\s+(?:~\/\.env|\/etc\/(?:passwd|shadow|sudoers))/gi,
    severity: "high",
  },
  {
    id: "network-listen",
    description: "Opening network listeners",
    regex: /\b(?:nc|ncat|netcat|socat)\s+[^\n]*-l/gi,
    severity: "medium",
  },
  {
    id: "base64-decode",
    description: "Base64 decode to shell",
    regex: /base64\s+(?:-[d]|--decode)\s*\|\s*(?:sh|bash)/gi,
    severity: "high",
  },
  {
    id: "download-to-execute",
    description: "Download to executable path",
    regex: /(?:curl|wget)\s+[^\n]*-o\s+\/(?:usr\/bin|usr\/local\/bin|tmp\/[^\s]*\.(?:sh|py|js))/gi,
    severity: "high",
  },
];

// ---------------------------------------------------------------------------
// Capabilities (non-blocking, require review)
// ---------------------------------------------------------------------------

const CAPABILITY_PATTERNS = [
  {
    id: "shell-script",
    description: "Shell scripts present",
    regex: /#!\/.*(?:sh|bash|zsh|fish)/gi,
    fileTypes: [".sh", ".bash", ".zsh", ".fish"],
  },
  {
    id: "external-download",
    description: "External downloads detected",
    regex: /\b(?:curl|wget)\s+/gi,
  },
  {
    id: "file-permissions",
    description: "File permission changes",
    regex: /\bchmod\s+/gi,
  },
];

// ---------------------------------------------------------------------------
// Scanner
// ---------------------------------------------------------------------------

function collectFiles(dir, files = []) {
  const entries = readdirSync(dir);
  for (const entry of entries) {
    if (entry === ".git" || entry === "node_modules") continue;
    const fullPath = join(dir, entry);
    // No-follow guard: never follow symlinks in attacker-controlled clones.
    // A symlink to host paths would otherwise get content-scanned and its
    // samples posted to the public issue comment.
    let stat;
    try {
      stat = lstatSync(fullPath);
    } catch {
      continue;
    }
    if (stat.isSymbolicLink()) continue;
    if (stat.isDirectory()) {
      collectFiles(fullPath, files);
    } else if (stat.size <= MAX_FILE_SIZE) {
      files.push(fullPath);
    }
    if (files.length > MAX_FILES) break;
  }
  return files;
}

function scanFile(filePath) {
  const findings = [];
  const capabilities = [];

  const ext = extname(filePath).toLowerCase();
  if (BINARY_EXTENSIONS.has(ext)) return { findings, capabilities };
  if (ext !== "" && !TEXT_EXTENSIONS.has(ext)) return { findings, capabilities };

  try {
    const content = readFileSync(filePath, "utf-8");
    const isDoc = DOC_EXTENSIONS.has(ext);

    // Check for findings (docs never block: doc hits become review
    // capabilities so the signal survives without failing the scan)
    for (const pattern of FINDING_PATTERNS) {
      const matches = content.match(pattern.regex);
      if (!matches) continue;
      if (isDoc) {
        capabilities.push({
          id: `docs-${pattern.id}`,
          description: `${pattern.description} (in docs)`,
          file: filePath,
          count: matches.length,
        });
        continue;
      }
      findings.push({
        id: pattern.id,
        description: pattern.description,
        severity: pattern.severity,
        file: filePath,
        count: matches.length,
        sample: matches[0].slice(0, 80),
      });
    }

    // Check for capabilities
    for (const pattern of CAPABILITY_PATTERNS) {
      if (pattern.fileTypes && !pattern.fileTypes.includes(ext)) continue;
      const matches = content.match(pattern.regex);
      if (matches) {
        capabilities.push({
          id: pattern.id,
          description: pattern.description,
          file: filePath,
          count: matches.length,
        });
      }
    }
  } catch {
    // Binary or unreadable — skip
  }

  return { findings, capabilities };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const themeDir = process.argv[2];
  if (!themeDir) {
    process.stderr.write("Usage: node scan-theme-security.mjs <theme-directory>\n");
    process.exit(1);
  }

  const files = collectFiles(themeDir);
  const allFindings = [];
  const allCapabilities = [];

  for (const file of files) {
    const { findings, capabilities } = scanFile(file);
    allFindings.push(...findings);
    allCapabilities.push(...capabilities);
  }

  // Determine outcome
  const criticalFindings = allFindings.filter(f => f.severity === "critical");
  const highFindings = allFindings.filter(f => f.severity === "high");
  const mediumFindings = allFindings.filter(f => f.severity === "medium");

  // Informational docs-only capabilities (e.g. docs-sudo-pkexec) stay in the
  // report but do not drive review-required; everything else does.
  const blockingCapabilities = allCapabilities.filter(
    (c) => !DOCS_INFORMATIONAL_CAPABILITIES.has(c.id)
  );

  let outcome;
  if (criticalFindings.length > 0 || highFindings.length > 0) {
    outcome = "needs-fixes";
  } else if (mediumFindings.length > 0 || blockingCapabilities.length > 0) {
    outcome = "review-required";
  } else {
    outcome = "passed";
  }

  // Output JSON report
  const report = {
    scan_version: "1.0.1",
    scanned_at: new Date().toISOString(),
    files_scanned: files.length,
    outcome,
    findings: allFindings,
    capabilities: allCapabilities,
    summary: {
      findings_count: allFindings.length,
      critical: criticalFindings.length,
      high: highFindings.length,
      medium: mediumFindings.length,
      capabilities_count: allCapabilities.length,
    },
  };

  process.stdout.write(JSON.stringify(report, null, 2) + "\n");

  // Exit code
  if (outcome === "needs-fixes") {
    process.stderr.write(`\n❌ Security scan: ${outcome}\n`);
    process.stderr.write(`   Findings: ${allFindings.length} (${criticalFindings.length} critical, ${highFindings.length} high)\n`);
    process.exit(1);
  } else if (outcome === "review-required") {
    process.stderr.write(`\n⚠️  Security scan: ${outcome} (requires maintainer review)\n`);
    process.exit(0);
  } else {
    process.stderr.write(`\n✅ Security scan: ${outcome}\n`);
    process.exit(0);
  }
}

main();
