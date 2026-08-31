#!/usr/bin/env node
/**
 * validate-themes.ts
 *
 * CI entry point: runs generate-registry and exits 1 on any validation errors.
 * Designed to be called from CI pipelines and pre-commit hooks.
 *
 * Usage: npx tsx scripts/validate-themes.ts
 * Exit 0 on success, exit 1 on validation errors.
 */

import { execFile } from "node:child_process";
import { resolve } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

async function main() {
  const scriptPath = resolve(import.meta.dirname, "generate-registry.ts");

  console.log("🔍 Validating themes...\n");

  try {
    const { stdout, stderr } = await execFileAsync("npx", ["tsx", scriptPath], {
      cwd: resolve(import.meta.dirname, ".."),
      timeout: 30_000,
    });

    if (stdout) process.stdout.write(stdout);
    if (stderr) process.stderr.write(stderr);

    console.log("\n✅ All themes validated successfully.");
  } catch (err: unknown) {
    // execFile throws on non-zero exit code — that's expected when validation fails
    if (err && typeof err === "object" && "stdout" in err) {
      const e = err as { stdout?: string; stderr?: string; code?: number };
      if (e.stdout) process.stdout.write(e.stdout);
      if (e.stderr) process.stderr.write(e.stderr);
    } else {
      console.error("Unexpected error:", err);
    }

    process.exit(1);
  }
}

main();
