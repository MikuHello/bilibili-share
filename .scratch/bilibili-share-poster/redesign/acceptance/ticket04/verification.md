# Ticket 04 verification

The approved seam is the real production entry/panel plus controlled external GM responses and browser clipboard writes. No private panel state is invoked. Existing domain tests cover canonical targets, option coupling and short-link validation; browser checks cover their user-visible integration.

## Red / green evidence

- First browser RED, before ticket 04 production changes: opening the production panel with a failed short-link business response yielded `短链不可用，已使用规范长链接原因：Bilibili 短链请求失败。不会影响预览或下载。`. The exact approved `已使用完整链接` status assertion failed. The fixture uses the existing production bundle and only substitutes external GM/network results.
- Final marker labels initially had zero matching accessible buttons; labels now read `标记当前分P` and `标记当前时间`.
- An actual combined-copy action held at the external clipboard writer initially left the time marker enabled. The assertion `target cannot change while an existing combined export is unfinished` failed. Export now locks options and other output actions until completion/failure, restoring each control's prior enabled state. Image actions also stop before writing/downloading if the panel closed during encoding. The same lock covers text copy and download.
- Cover failure plus a delayed target response initially left retry enabled, permitting competing resource refresh. The assertion `retry must not race a pending target change` failed. Retry is now disabled for that update and restored with the completed text state.

## Green checks

- Browser Chromium 151.0.7922.34: `scripts/verify-share-targets.mjs` passed 15 recorded results. The 11 generated PNGs were obtained from the actual production combined-copy clipboard payload and independently decoded with macOS Vision; every QR matched the expected target. Ordinary copy, independent Markdown, combined plain text and combined HTML matched the same target.
- Default/P1/P2, floor from captured 83.9 to 83 (live playback later changed to 999), no `t=0`, unknown-part disabling/notice, reopening reset, failed-cover text updates, valid short links, wrong BVID, missing part and missing time all passed. Pending `targetDelay` kept the old preview and disabled every export. Metadata request count and non-target poster text stayed stable across marker updates.
- Existing text-recovery browser suite passed all three groups after migrating the marker locator. Full domain suite: 8 files, 70 tests passed. `npm run check` and `git diff --check` passed.
- Review baseline: `9e44b05`. Independent Standards/Spec review is coordinated by the primary agent. Whole-batch build/installation is managed by the primary agent; concurrent ticket05 style changes are not part of this ticket's source scope.

## Limits

Controlled GM results cannot prove real manager permissions, Bilibili API behavior or a historical short-link mismatch repair. Native PNG decoding verifies generated image destinations, not a receiving device's navigation or clipboard paste behavior. Final manager installation remains whole-batch acceptance.
