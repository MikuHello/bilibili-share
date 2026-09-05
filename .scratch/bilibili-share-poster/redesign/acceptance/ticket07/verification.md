# Ticket07 lifecycle evidence

Date: 2026-09-05. Implementation and review baseline: `7f30fbd`.

## Approved seam

Unchanged production `src/index.ts` bundle; browser UI and actual registered GM menu callback. Only external GM/network and HTMLVideoElement ports are controlled. No production modules are replaced. This is controlled Chromium coverage, not actual userscript-manager validation.

## Red → green

1. Closing then invoking the registered GM menu callback within the exit animation produced zero dialogs instead of a fresh one. Close now synchronously releases the active panel, restores captured playback and returns focus. Its delayed callback only removes the old DOM, so it cannot resume playback or steal focus from a new panel.
2. With no available player, capture failed; navigating to another BVID left the error panel open (one dialog instead of zero). Panel identity now retains the opening page even before successful player capture.
3. A GM menu callback immediately after changing part, before URL event delivery, reused the old capture (one pause rather than two). The entry now validates current identity before focusing an active panel.
4. In the same navigation-event delay window, copying wrote one stale text rather than zero, retry made new requests against the old capture (six total instead of three), and marker action made a stale validation request (four instead of three). The shared context guard closes stale panels before capture/retry, option changes or exports.

## Verification

`BSP_PLAYWRIGHT_MODULE=/Users/mikuhello/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs node scripts/verify-lifecycle.mjs` passes:

- Duplicate open retains one capture/request and one panel.
- Immediate close/reopen retains the new panel, paused player and its focus; final close restores original playback.
- Failed capture navigation closes without attempting playback.
- Initial generation, retry and target update results arriving after navigation cannot revive/overwrite old content. Reopen captures the new BVID and clears markers.
- Synchronous entry, export, retry and marker actions check identity before delayed navigation observers.
- Close button, Escape and backdrop each preserve originally paused playback and resume originally playing playback once; delayed retry results do not revive closed panels; focus returns to the entry.
- Replacing the captured player cannot cause either old or replacement player to play on close.

`node scripts/verify-text-recovery.mjs` with the same module environment passes its original-capture retry, detail preference, independent Markdown/manual recovery, and metadata-blocking scenarios.

`npm run check` passes. `npm test`: 8 files / 70 tests pass. `git diff --check` passes. Production bundling is exercised by both browser suites; final distribution build is owned by the primary agent after ticket06 wiring.

## Remaining evidence

Independent Standards/Spec review is coordinated by the primary agent. Actual Edge + installed userscript-manager validation has not been performed for this commit and must not be inferred from this controlled browser evidence.
