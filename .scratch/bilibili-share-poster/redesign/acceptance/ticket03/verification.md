# Ticket03 implementation verification

Date: 2026-09-05. Review baseline: `014bfb4` (ticket02 fixes and documentation included).

Production `src/index.ts` is bundled unchanged through the shared browser harness. Only external GM/network, browser/player and clipboard ports are controlled. This verifies Chromium browser behavior, not an installed userscript manager.

## Red → green evidence

- Cover failure initially hid every action: waiting for enabled `复制文案` timed out. Text readiness now uses validated metadata and target independently of the optional poster. Both formats remain available; all image and combined actions are disabled and no placeholder image is produced.
- Markdown initially left title punctuation unescaped; assertion `Markdown escapes source punctuation and HTML` failed. Titles, uploader and part text now escape Markdown and HTML syntax; compact Markdown retains uploader.
- Markdown clipboard failure initially had no `手动复制 Markdown` textbox. A readonly selectable source textbox now exposes the exact failed format, with ordinary preview unchanged. Combined clipboard fallback still uses ordinary text.
- The cover diagnostic assertion initially failed. Console warnings now carry a fixed failure stage and safe byte/status/dimension facts, never source URLs, raw errors, response bodies, headers, cookies or credentials. Clipboard failure logs a fixed stage and known format.

## Green checks

- `npm test`: 8 files, 70 tests passed. Two legacy assertions were updated for approved behavior: compact Markdown includes uploader; remembered Markdown mode is ignored while detail preference survives.
- `npm run check` passed.
- `npm run build` passed; production distribution rebuilt.
- `BSP_PLAYWRIGHT_MODULE=/Users/mikuhello/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs node scripts/verify-text-recovery.mjs` passed.
- Browser assertions cover failed cover with available text and disabled image/combined actions; timestamp and detailed options while failed; successful retry preserving captured 83-second playback rather than changed live 999 seconds; remembered details; exact counts; independent Markdown; legacy mode ignored; manual Markdown recovery; ordinary combined fallback; metadata failure blocking all exports.
- `git diff --check` passed.

## Remaining evidence

Independent Standards/Spec review is coordinated by the primary agent. Actual Edge + userscript-manager validation has not been performed for this commit; it belongs to final batch acceptance. Ticket04/05 own final control labels/layout and may update these user-action test locators while preserving assertions.
