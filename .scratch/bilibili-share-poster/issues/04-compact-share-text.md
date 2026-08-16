# 04 — 预览并复制默认分享文案

**What to build:** 分享面板在海报旁显示精确的默认紧凑 share text，观看者可以单独复制；复制失败时仍能直接选择并手动复制原文。

**Blocked by:** 02 — 使用已校验短链并诚实降级

**Status:** complete

- [x] 默认 share text 使用未额外包裹的原始标题、`（UP主：<up_name>）` 和独立一行的 share target，不给标题补加 `【】`。
- [x] 文案预览逐字符对应实际复制内容，并与海报及二维码使用同一 share target。
- [x] “复制文案”只在用户直接操作时写入普通文本剪贴板，不产生后台复制行为。
- [x] 文案复制成功时明确反馈；失败时精确文本保持可见、可选中，并提示手动复制。
- [x] 短链降级后，预览和复制内容立即使用规范长链接且与面板降级提示一致。
- [x] 紧凑文案的标点、换行、原始语言保留、短链和长链路径均有外部行为测试。

## Comments

### 2026-08-14 — in-progress implementation

- TDD seam：`src/share-text.ts` 的 `buildCompactShareText` 为纯函数；`tests/share-text.test.ts` 覆盖原样标题、不加 `【】`、短链/长链同目标与源语言保留。
- 面板新增精确文案预览（`<pre>`，可选中）与“复制文案”按钮；文案 target 直接来自与海报/二维码相同的 `model.shareTarget`。
- 复制成功反馈明确为只复制文案；失败时原文预览保持可见、可选中，并提示手动全选复制。
- 剪贴板文本端口位于 `src/clipboard.ts`：优先 `navigator.clipboard.writeText`，失败后回退 `GM_setClipboard`；构建头已补 `GM_setClipboard` grant。
- 待执行：`npm test`、`npm run check`、`npm run build` 与真实页面手动复制验证；当前执行环境无法启动 shell，尚未 claim complete。
### 2026-08-17 — final validation

- `npm run check`、`npm test`、`npm run build`、`git diff --check` all pass.
- Real Chrome 151 page (`BV1xx411c7mD`): preview text equals the exact compact form `标题（UP主：碧诗）\n<target>`; trusted click “复制文案”写剪贴板成功，`navigator.clipboard.readText()` 返回同一字符串。
- The page-level fetch shim cannot resolve b23.tv (CORS), so the real page exercised the canonical-fallback path; the preview and clipboard content immediately consumed the same canonical target as the poster. Short-link identity path is covered by `share-target.test.ts`.
