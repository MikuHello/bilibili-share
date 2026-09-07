# Bilibili Share 0.4.0 — final verification

Status: verification passed; aggregate code review pending

## Delivered behavior

- Plain text and Markdown each have independent compact/detailed templates, a shared variable/conditional renderer, partial developer overrides, and per-preset diagnostic fallback.
- The actual panel uses the centralized configuration; previews preserve full template output with links anywhere or omitted. Built-in output remains compatible.
- Default poster layout, measurement and target nodes are separated from PNG encoding/cache; existing async guards and export behavior remain intact.
- No configuration GUI or framework migration. Existing userscript identity, distributable filename and preference keys stay compatible. Old worktrees were not deleted.

## Verification

- Node v24.18.0; TypeScript no-emit check passed; Vitest 7 files / 95 tests passed; production esbuild bundle passed at version 0.4.0.
- All 13 existing browser suites passed on the final production bundle: b3-poster, text-recovery, text-isolation, share-targets, update-races, marker-smoothness, independent-exports, final-panel, appearance, lifecycle, update-performance, video-honors, floating-feedback.
- Final ordinary-template browser verification passed 18 cases; Markdown verification passed 12 cases. These compile production entry points with actual developer-config replacements, rather than claiming custom configurations run from the unmodified default distributable.
- The browser runner now includes both new template suites for future runs. This batch ran the original 13-suite runner, followed by the two template scripts after adding them to the runner; no product code changed between these checks.
- 28 exported poster PNGs are byte-identical to pre-change version 0.3.5, including varied covers, extreme titles/statistics, narrow screens, contrast cases and marked targets. SHA-256 pairs are in poster-comparison.json. Baseline images were captured before implementation from the old distributable.
- Actual default desktop-light panel screenshot inspected; layout readable and contained. The automated final-panel suite also verifies narrow layouts, keyboard interaction, recovery, Chromium clipboard and PNG download.
- Target/font cache invalidation, latest-wins races, navigation, failed cover recovery and playback state were covered by existing browser suites.
- git diff --check and browser-runner JavaScript syntax check passed.

## Reproduce

Run npm run check, npm test and npm run build. With Playwright installed, run npm run test:browser and set BSP_EVIDENCE_DIR to a new directory. In this environment BSP_PLAYWRIGHT_MODULE points to /Users/mikuhello/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs. macOS Vision QR verification and a system Arial font are used by existing checks.

## Evidence and limits

Reports/screenshots live under browser/. release.json identifies the final distributable by SHA-256. Per-ticket TDD and review evidence are recorded in issues/ and sibling evidence directories.

Browser checks control external Bilibili API/GM/player boundaries; some clipboard suites exercise real Chromium clipboard while template suites capture the external clipboard boundary. This does not establish live Tampermonkey installation or live Bilibili network behavior. No remote repository or publication action was performed.
