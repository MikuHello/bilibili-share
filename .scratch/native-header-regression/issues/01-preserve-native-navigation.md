# Preserve native Bilibili navigation
Status: Complete (local fix; publication and installation not performed)

## Request and authorization
2026-09-08: Owner reports that with BewlyCat disabled, enabling Bilibili 分享海报 hides the native top-left and top-right navigation. Disabling the share script restores it. Urgent local fix authorized, following CONTRIBUTING and Matt skills; no GitHub submission/publication.

## Scope and acceptance
- Treat this as new maintenance work, not a continuation of completed historical requirements.
- Native header navigation remains visible and clickable with the script enabled, before opening and after closing the share panel.
- Share entry, panel and exports continue working; no dependency on BewlyCat.
- Clean superseded historical intermediate documents while retaining original requests, decisions, tickets and final acceptance evidence with fixed-commit references.
- Keep formal version 0.1.0; provide local development build.

## Workflow
Diagnosing-bugs → implement/TDD → independent Standards and Spec reviews.
Approved observable seam follows the owner's reported UI behavior and existing browser integration convention: production userscript in a controlled page using native header DOM structure; external browser/GM boundaries only.
Baseline: 9d9408a24b09f7536e6b263f0b2770702285c6e9.
Branch: codex/fix-native-header, existing clean working directory (no parallel implementation requiring a worktree).

## Comments

2026-09-08: SSR hydration regression reproduced with the baseline userscript and real Vue 2, fixed at the entry mounting boundary. Check, 95 unit tests, full 16-suite browser matrix and both review axes passed. See [final acceptance](../verification.md) for live diagnostic limits, historical cleanup and local build checksums. No GitHub submission.
