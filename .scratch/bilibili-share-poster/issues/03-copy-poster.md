# 03 — 复制海报并保留下载兜底

**What to build:** 观看者可以把 poster preview 对应的 PNG 直接复制到剪贴板；若浏览器或目标上下文拒绝图片写入，分享面板保持可用并明确引导手动下载。

**Blocked by:** 01 — 生成并下载默认 A 主题海报

**Status:** complete

- [x] “复制海报”是面板中的主导出动作，且只有直接的用户操作会触发剪贴板写入。
- [x] 剪贴板中的 PNG、poster preview 和下载 PNG 来自同一已完成的生成结果，不出现字段、主题、二维码或 share target 不一致。
- [x] 图片复制成功时给出准确成功反馈，不暗示同时复制了文本。
- [x] 图片复制失败时保留面板和预览，显示具体失败提示并引导“下载 PNG”；不得自动触发下载。
- [x] 下载动作在图片复制失败后仍可正常使用，并维持既定尺寸与文件名规则。
- [x] 受支持 Chromium/Tampermonkey 注入上下文中的 PNG 剪贴板行为经过真实浏览器验证，适配器失败路径可被确定性测试。

## Comments

### 2026-08-14 — in-progress implementation

- TDD seam：`src/clipboard.ts` 通过注入式 `PngClipboardWriter` 端口测试成功/失败结果；测试文件 `tests/clipboard.test.ts` 先写。
- 运行入口：面板新增“复制海报”主按钮与“下载 PNG”次按钮；两者都从同一 `poster` 节点、同一 `posterPngDataUrl()` 生成 PNG，复用 `model.dimensions` 的 1080×1440 导出比例。
- 失败路径：剪贴板不可用或写入失败时，面板与预览保持，状态区给出具体失败原因，并提示“请改用‘下载 PNG’保存图片”；不会自动触发下载。
- 成功反馈明确为仅复制海报图片，不声称包含文案。
- 待执行：`npm test`、`npm run check`、`npm run build` 与真实 Chromium/Tampermonkey 剪贴板验证；当前执行环境无法启动 shell，尚未 claim complete。
### 2026-08-17 — final validation

- `npm run check`、`npm test`（70 assertions across 6 files）、`npm run build`、`git diff --check` all pass.
- Real Chrome 151 page (`BV1xx411c7mD`): “复制海报”成功写入了剪贴板，`navigator.clipboard.read()` 返回 `image/png`；UI status 为“海报已复制到剪贴板。”且明确不包含文案。
- 剪贴板拒绝路径也实测（headless permission-denied）：面板和预览保留，提示具体原因并引导“下载 PNG”，没有自动下载；随后下载仍可生成 1080×1440 PNG。
