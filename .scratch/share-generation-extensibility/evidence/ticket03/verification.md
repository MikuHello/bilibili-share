# Ticket 03 verification

Review baseline: `7dcceac`; implementation: `0230f77`.

This ticket preserves behavior while relocating existing implementation. Existing approved public panel/export tests were run before and after the move; no new internal-function tests were introduced.

- `npm run check`: passed.
- `npm test`: 7 files, 95 tests passed.
- `npm run build`: passed; final packaged bundle is delivered with the parent batch.
- `scripts/verify-update-races.mjs`: passed before and after; 9 scenario summaries in `before/races.json` and `after/races.json`. Includes actual exported PNG QR decoding, latest-wins target updates, target/font cache invalidation, cache reuse, encoding retry, close/navigation guards, and cover failure with text sharing available.
- `scripts/verify-update-performance.mjs`: passed, 3 samples in `after/after.json`; details retain nodes with no canvas/decode/request work, target changes retain cover/title/controls, repeated export reuses encoding.
- Before/after actual PNG files are byte-identical: `latest-wins.png` SHA-256 `50b716a3e8740b789978330946276cf8b110fe67ce6c67ee731f28c886bdd9a4`; `cache-invalidated.png` SHA-256 `2b46841de6760d2284db519b9fb7dafff6b93b93d11e19b782381a8cc8bb5e7b`.

Browser commands used `BSP_PLAYWRIGHT_MODULE=/Users/mikuhello/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs` and `BSP_EVIDENCE_DIR=.scratch/share-generation-extensibility/evidence/ticket03/before` or `/after`. Chromium version: 151.0.7922.34. The race script used production source bundled by the shared browser helper. The parent batch additionally runs the final distributable regression and full poster matrix comparison.

Limit: controlled page/GM/player/clipboard fixtures; no live userscript manager installation verification.

Independent reviews of `git diff 7dcceac...0230f77`: Standards 0 documented violations / 0 reportable smells; Spec 0 missing requirements / scope creep / incorrect behavior. Reviewers independently read code and documents; they did not rerun tests.
