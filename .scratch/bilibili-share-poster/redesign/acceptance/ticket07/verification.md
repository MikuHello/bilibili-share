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

## Review follow-up: asynchronous export boundaries

- Independent Spec review reproduced a stale image export against fixed commit `85fb9e9`: the browser's 1080×1440 canvas serialization completed while the page identity changed before manager URL-event delivery. The observed state had the new BVID URL and one old `image/png` clipboard write. The initial export guard was insufficient because navigation occurred during the awaited encoding.
- Production now revalidates context after encoding, before starting PNG copy, combined copy or download. `scripts/verify-lifecycle.mjs` exercises all three through user actions and the external canvas boundary; each now produces zero clipboard writes/downloads and does not resume playback for the new video.
- A second RED reproduced navigation followed by rejection at the external combined clipboard writer. The later plain-text fallback wrote once, despite the context being invalid (expected zero). The combined-copy adapter now accepts a continuation guard and checks it before starting text fallback; the panel supplies its current-context guard. Existing callers retain the default behavior.
- GREEN: the complete lifecycle browser script passed, including all three encoding-navigation cases and the rejected-combined-write fallback case. Clipboard unit suite: 8/8 passed. These tests use the unchanged production bundle with controlled browser/GM boundaries; they do not claim that an already-started operating-system clipboard write can be cancelled.
