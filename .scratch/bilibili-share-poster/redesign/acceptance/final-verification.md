# Final integrated verification — 2026-09-05

> 归档说明：本报告对应历史版本。原始截图、日志和中间报告见 [清理前快照](https://github.com/MikuHello/bilibili-share/tree/f0a534c81de44edccd741ecd116a6d07dfa5cf83/.scratch/bilibili-share-poster/redesign/acceptance)；当前测试使用 tests/fixtures/，输出写入 artifacts/。

Production source and distribution baseline: fb79f0c. Version 0.2.0.

- `npm test`: 7 files, 66 behavior tests PASS. Four retired A/B surface-only tests removed along with unused theme/token API; legacy stored settings are still tested as ignored.
- `npm run check`: PASS.
- `npm run build`: PASS; userscript header version reads package.json, description uses the default theme; grants remain scoped to api.bilibili.com, b23.tv and hdslb.com.
- `BSP_PLAYWRIGHT_MODULE=/Users/mikuhello/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs npm run test:browser`: all six suites PASS (default poster, text recovery, share targets, final panel, appearance, lifecycle).
- Eight measured layouts and actual 1080×1440 PNG exports validated; native macOS Vision QR decoding verifies encoded targets. Share-target matrix includes 15 scenarios and 11 PNGs.
- Actual Chromium clipboard representations, contenteditable paste and PNG download verified; desktop and narrow layout/focus paths covered. Browser runtime: Chromium 151.0.7922.34. GM/network/player ports are controlled fixtures, not an installed-manager or actual-media-playback test.
- Actual Bilibili/BewlyCat page setting toggled light → dark → light with the production observer probe, then restored and cleaned up. Reduced user-agent: Edge 152. Exact build and extension versions are unverified. See implementation-evidence/live-theme-signals.md.
- Distribution SHA-256: `4eab6211a9bfc733474ae4c15f1f3e0a823f2da0bffcf3c66f71508633192f28`.

## Acceptance limitations

The browser tool rejected extension-management navigation by security policy. No workaround was used. Installation/version matching and the hdslb.com request/decoding/export chain inside the real userscript manager remain unverified. Ticket 01 and the manager/version portion of ticket 06 remain open for final product acceptance; fixture or page-probe success is not substituted for this evidence. No automatic update URL, remote deployment or published release was added.

## Workspace preservation

Implementation accumulated on codex/default-theme-delivery in the isolated bilibili-share-delivery worktree. Original bilibili-share main remains at 4d1f35510b5226b17695589386427302d1df284a with its pre-existing uncommitted design documents preserved. The original main worktree was not merged or overwritten.
