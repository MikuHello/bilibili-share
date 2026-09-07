# 0.3.5 delivery verification

Both approved tickets are complete. Ticket01 implementation/review commits: 55b09b7 / b04b94a. Ticket02 implementation: d3f9b3f. Each ticket received separate Standards and Spec reviews: zero actionable findings on both axes. Reviewers inspected code and evidence; they did not independently rerun tests.

## Changes

- Existing view metadata supplies the optional primary honor. The approved warm-gold bookmark appears in preview and PNG; detailed plain text and Markdown include its original wording after statistics. Compact text excludes it; missing/invalid honors are omitted without extra requests.
- Disabled part/time explanations float on hover, focus or touch. Buttons remain disabled. Results retain success dismissal and persistent failure behavior. Manual copying overlays the existing preview area without moving controls, including after long-text scrolling.

## Validation

- TypeScript check and all 77 unit tests passed.
- Exact distributable version 0.3.5 passed all 13 browser suites: b3-poster, text-recovery, text-isolation, share-targets, update-races, marker-smoothness, independent-exports, final-panel, appearance, lifecycle, update-performance, video-honors and floating-feedback.
- The initial delivery run stopped at an obsolete share-target assertion requiring an always-visible explanation. It was updated to focus the explanation entry and inspect the tooltip; the remaining suites were resumed against the unchanged distributable and all passed.
- Five actual honor PNGs covered the three approved labels, long original wording/title/portrait cover and no honor. QR decoding passed; geometry checks found no overlap with IDs/title, and marker updates retained two network requests total.
- Floating feedback checks covered mouse, keyboard, touch, 390px, light/dark appearance, reduced motion, unchanged preview geometry, selected recovery text, retry, long-text scrolling and Escape/focus return. Existing suites cover image-copy/download recovery and navigation/late-result cleanup.
- Visually inspected exact-build honor PNG and dark/mobile tooltip screenshots, plus source-build mobile manual-copy recovery.

Browser fixtures control API, player and clipboard-failure boundaries. Existing clipboard-success suites also exercise real Chromium clipboard representations. No new Tampermonkey installation or external receiving-app paste certification was performed.

Build: `dist/bilibili-share-poster.user.js`

SHA-256: `c250d43e8eff54d1825702cd1cd0fb754a03f3e75695f2fcc36b9d685129c5f6`

Focused screenshots and PNGs are in `video-honors/` and `floating-feedback/`; other suite reports are alongside them. Full baseline rerun screenshots remain available locally.
