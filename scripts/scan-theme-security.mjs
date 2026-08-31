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

import { readFileSync, readdirSync, statSync } from "node:fs";
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
    const stat = statSync(fullPath);
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

  try {
    const content = readFileSync(filePath, "utf-8");
    const ext = extname(filePath).toLowerCase();

    // Check for findings
    for (const pattern of FINDING_PATTERNS) {
      const matches = content.match(pattern.regex);
      if (matches) {
        findings.push({
          id: pattern.id,
          description: pattern.description,
          severity: pattern.severity,
          file: filePath,
          count: matches.length,
          sample: matches[0].slice(0, 80),
        });
      }
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

  let outcome;
  if (criticalFindings.length > 0 || highFindings.length > 0) {
    outcome = "needs-fixes";
  } else if (mediumFindings.length > 0 || allCapabilities.length > 0) {
    outcome = "review-required";
  } else {
    outcome = "passed";
  }

  // Output JSON report
  const report = {
    scan_version: "1.0.0",
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
