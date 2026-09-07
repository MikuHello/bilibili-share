# Ticket 02 verification

Implemented the approved B3 in production DOM and PNG export. Fixed 1080×1440 canvas, 10% mast and 38% complete-cover area, content-sized serif title limited to 298.8px, moving divider, single author line, four fixed 54px stat icons and 183.6px QR area. Numeric glyphs fit independently in five bounded sizes; very large values (near one trillion after rounding) use compact scientific notation rather than truncated numbers. Long author names ellipsize in one line; complete source names/titles remain in share text.

Cover appearance is generated once per snapshot in a 240×320 canvas with 18px blur and the approved light overlay; a weak snapshot cache reuses the result without accumulating videos. Preview and export use the same background bitmap and measured layout. Existing context guards prevent closed/navigated panels from publishing the result; broader version/update work is ticket 03.

## Evidence

- TDD red: browser assertion rejected old BV/av below the cover; second red rejected identical exported background pixels for red/blue covers. Extreme-number domain tests failed before scientific formatting was added. Production grid overflow found by actual PNG export was corrected by explicitly bounding the grid column.
- `npm run check`, `npm test` (66 tests), and `npm run build` pass. After rounding-boundary follow-up, all 24 domain tests and the production build pass.
- `scripts/verify-b3-poster.mjs`: 18 PNG cases pass: 12 title/shape combinations, long name/extreme statistics, unit-rounding/MAX_VALUE boundaries, missing/zero values, long marked target, and two additional real covers. Every PNG was independently decoded with Apple Vision using `verify-poster-qr.swift`.
- Two synthetic solid-color exports give different background pixels, confirming that the exported atmosphere follows the cover. Three real cover designs include the existing low-saturation meditation cover, dark/high-contrast desk cover, and warm/pink music cover. `covers/sources.json` records original URLs; an official transparent placeholder is excluded because the existing cover adapter correctly rejects it.
- Checked actual normal/extreme/portrait/real-cover PNGs visually for whole cover, stable icons, title ellipsis, separation from QR, readable type, and full address.
- `target-regression/`: ticket 01 production-panel regression rerun against B3; all ten scenarios pass and six exported QR codes decode to the expected canonical/marked targets.

Environment: bundled headless Chromium on macOS, unchanged production bundle plus controlled external Bilibili/GM and clipboard-recording boundaries. This is actual renderer/PNG evidence, not prototype output. It does not claim a real receiver paste, an installed userscript match, Windows font parity, or live-site performance; these remain ticket 05/07 validation boundaries.

## Standards

No documented-standard violations. One low-priority possible Shotgun Surgery finding: hidden title measurement duplicated the layout width and padding total. Resolved by reading actual title width and editorial padding when calculating the 26% height limit. Follow-up review confirms resolution and no new findings.

## Spec

No missing, incorrect, or unrequested ticket 02 behavior found. Follow-up review confirms measured geometry and early unit promotion remain inside the approved bounded-fitting scope.

Review totals: Standards 1 advisory resolved (0 open); Spec 0.
