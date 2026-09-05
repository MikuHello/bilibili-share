# Ticket 02 verification

- Baseline: `0b08900`; production changes are scoped to the default poster, browser layout/export, and removal of the picker.
- TDD: old B preference test failed before options fix; the same-body/different-target test failed for the former B layout and part/time labels, then passed after removing those domain fields. Domain/options: 33 passed.
- `npm run check` passed. Full `npm test` passed (see implementation run).
- `scripts/verify-default-poster.mjs` bundles the actual domain, poster, export and global stylesheet modules. Eight browser layouts produced real PNGs; each was checked for 1080×1440 dimensions, 1080×608 contain region, title/footer separation, two-line nickname maximum and complete, bounded links. Original PNG visually inspected against approved v5/adaptation.
- Long and unbroken titles reached 48px and four-line ellipsis; names reached 30px and two lines. The long canonical URL grew the footer before title sizing. Normal titles remained 64px; long-link case required 60px.
- `scripts/verify-poster-qr.swift` decoded all eight complete exported PNGs using macOS Vision. Every decoded URL was independently matched to the expected canonical target; longlink included its complete part/time query. The 188px QR remains black/white with four-module quiet zone; rounding affects the supporting frame only.
- Preview and export share the measured DOM; production panel scales 1080px width to its preview frame and exports with the transform removed.
- Only official brand, UP and three statistic SVGs were carried from approved assets; no prototype fixture video metadata or cover enters production code.
- Intermediate compatibility: the legacy options theme field is forced to A for the existing entry adapter until ticket06 removes that adapter coupling. There is no theme picker or A/B poster renderer. Markdown preference/action recovery remains ticket03.
- Real installed Tampermonkey networking and clipboard behavior are not verified by these controlled browser render checks. Final integrated installation and panel acceptance belong to the whole-batch delivery.
- Two-axis code review is coordinated by the primary agent after this implementation commit; findings will be addressed before whole-batch delivery.

- Follow-up browser regression: four 99,999,999 counters originally overlapped the QR. Added a failing bounded-statistics test, then proportionally fitted the measured row to its signature width. Eight layouts/PNGs now pass; the large-statistics PNG also decodes to the expected target. No counters are truncated.

- Spec review found CSS `line-clamp` preview behavior did not preserve the ellipsis in exported PNGs. Added a failing literal-ellipsis regression; replaced CSS clamp with a binary search over original text using actual browser line-box height. The full title/uploader remain in the domain and share text. Regenerated and visually inspected `long.png` and `unbroken.png`: both show four title lines and two nickname lines ending with a visible ellipsis. Eight PNG dimensions/layouts/QR targets still pass, and typecheck passes.
