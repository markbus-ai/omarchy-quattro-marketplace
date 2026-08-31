# Security Policy

## Report a Security Concern

Report suspected malicious, compromised, or otherwise unsafe marketplace themes through [GitHub's private vulnerability reporting form](https://github.com/markbus-ai/omarchy-quattro-marketplace/security/advisories/new).

Do not disclose credentials, exploit details, personal information, or other sensitive material in a public issue. Include the marketplace listing, theme repository, relevant commit, observed behavior, and any safe reproduction details in the private report.

If the concern originates in an upstream theme, also notify that theme's maintainer privately when a suitable channel is available. The Marketplace may suspend or remove a listing while concerns are investigated.

## Scope

Marketplace checks are limited automated compatibility and security-baseline checks on identified theme commits, with manual review where required. They are not a security audit, certification, endorsement, or guarantee. Community themes execute as unsandboxed third-party code.

## Automated Security Baseline

### Purpose and limits

The Automated Security Baseline is a deterministic snapshot-publication check. It identifies only the documented static patterns in this file. It does not perform general data-flow analysis, prove that a theme is safe, or attempt to stop a motivated attacker.

The baseline does not execute theme code. It reads selected files from the exact full commit SHA produced by submission, update, or existing-snapshot validation. Themes remain unsandboxed upstream code, and users must still inspect the source and decide whether to trust it.

### Scan scope and limits

The scan includes TOML, YAML, JSON, shell scripts, configuration files, and other text-based theme files. Binary assets (images, fonts) are excluded from static analysis.

A complete result is limited to:
- 500 relevant files
- 1MB per relevant file

### Deterministic findings (blocking)

The following patterns produce findings:

- **curl-pipe-shell**: Content downloaded with `curl` or `wget` is passed directly to a shell
- **eval-exec**: Dynamic code execution via `eval()` or `exec()`
- **sudo-pkexec**: Privilege escalation via `sudo` or `pkexec`
- **dangerous-rm**: Dangerous recursive delete of system directories
- **env-file-read**: Reading sensitive environment files (.env, /etc/passwd, etc.)
- **network-listen**: Opening network listeners
- **base64-decode**: Base64 decode piped to shell
- **download-to-execute**: Downloading files to executable paths

### Review capabilities (non-blocking)

The following detected patterns require maintainer review but are not findings:

- **shell-script**: Shell scripts present in the theme
- **external-download**: External downloads detected
- **file-permissions**: File permission changes

### Outcomes

- **passed**: No findings or review capabilities detected
- **review-required**: Review capabilities detected (requires maintainer approval)
- **needs-fixes**: Blocking findings detected (must fix before approval)

### Exact-SHA binding

Every listing and approved theme is pinned to an exact commit SHA. Install commands reference the specific approved commit, not a mutable branch or tag. This ensures the installed code matches what was reviewed.

## Security Notice

> Community themes are developed and maintained by independent third parties. They may modify terminal colors, window manager configs, and other desktop settings according to their implementation.

> The Marketplace performs limited automated checks on the identified theme commit and may conduct manual review. These checks are not a security audit, certification, endorsement, or guarantee that a theme is safe, secure, error-free, or suitable for a particular purpose. Upstream code may change after review unless the installed version is explicitly pinned to the reviewed commit.

> Before installation, review the theme's source code, configuration files, and any included scripts. Report suspected malicious or compromised themes immediately through the [private security report form](https://github.com/markbus-ai/omarchy-quattro-marketplace/security/advisories/new). The Marketplace may suspend or remove listings while concerns are investigated.

> Nothing in this notice excludes or limits liability where exclusion or limitation is prohibited by applicable law.
