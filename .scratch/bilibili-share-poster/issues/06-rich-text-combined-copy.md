# 06 — 提供详细文案、Markdown 与组合复制

**What to build:** 观看者可以独立选择详细程度和 Markdown 表示，并在浏览器能力允许时尝试组合复制海报与所选文案；界面准确说明接收方可能只采用一种格式。

**Blocked by:** 03 — 复制海报并保留下载兜底；04 — 预览并复制默认分享文案；05 — 分享当前分P与播放位置

**Status:** complete

- [x] 详细 share text 包含标题、UP 主、BV/AV、四项精确千分位统计和 share target，仅在对应选项启用时加入分P与时间戳信息。
- [x] Markdown 与详细程度是两个独立选项；紧凑 Markdown 的标题为可点击链接并保留独立裸链接，详细 Markdown 使用已批准字段列表。
- [x] 详细文案和 Markdown 偏好记住上次选择；分P和时间戳仍遵守每次打开重置的既定规则。
- [x] 切换详细程度或 Markdown 只重建 share text，不重新生成海报、二维码或短链，也不重新获取视频信息。
- [x] 在编写生产剪贴板适配器前，以可运行的受支持浏览器验证 PNG、纯文本和 HTML 表示在 Tampermonkey 注入上下文中的实际能力，并记录兼容与不兼容目标的客观结果。
- [x] 组合复制在一次直接用户操作中提供海报、所选普通或 Markdown 源文本以及图在前文在后的富表示；界面不承诺粘贴结果一定同时包含两者。
- [x] 组合写入成功反馈明确表述“已写入兼容格式，接收方可能只取其中一种”。
- [x] 组合写入失败时退回复制所选 share text，并明确提示海报仍需单独复制或下载；不得隐瞒降级或自动下载。
- [x] 文案四种组合、偏好恢复、精确数字、条件字段和组合复制降级均有外部行为测试。

## Comments

### 2026-08-14 — in-progress implementation

- TDD seam：`share-text.ts` 扩展为紧凑/详细 × 纯文本/Markdown 四种组合；详细模式使用精确千分位统计，分P/时间字段仅在对应选项启用时出现。
- `options.ts` 新增偏好恢复：详细文案与 Markdown（以及后续主题）跨面板记住，分P/时间戳仍每次打开重置；`tests/options.test.ts` 覆盖合法/非法存储值。
- 组合复制端口 `copyCombined` 使用注入式 `CombinedClipboardPorts` 做确定性测试：成功、组合失败退化为仅复制文案、两者都失败的反馈都覆盖；HTML 富表示固定为图在前、文在后。
- 面板新增“详细文案”“Markdown”开关与“组合复制”按钮；详细/Markdown 切换只重建文案 DOM，不重新生成海报/二维码/短链，也不重新获取视频信息。
- 偏好通过 `GM_getValue`/`GM_setValue` 存取，构建头已补对应 grant。
- 未完成：真实 Chromium/Tampermonkey 注入上下文中 PNG+纯文本+HTML 组合写入能力验证，以及 `npm test`/`npm run check`/`npm run build` 执行；当前执行环境无法启动 shell，尚未 claim complete。
### 2026-08-17 — final validation

- Real Chrome 151 page: detailed+Markdown text updated without regenerating the poster, QR, short link, or refetching metadata; the stored preferences retained theme/detail/Markdown while part/timestamp stayed off.
- Trusted combined-copy click produced clipboard types `text/plain`, `text/html`, `image/png`; UI feedback was exactly “已写入兼容格式。” with the honest compatibility wording.
- Combined-write failure fallback is deterministic via injected `CombinedClipboardPorts` tests, including both-writes-fail reporting.
