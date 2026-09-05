# 02 — 选项 pill 与可读的文案预览卡

**What to build:** 四个选项改为带图标的 pill 开关；share text 预览从“代码块感”改成设计过的消息卡；删除快照表和固定帮助说明。短链降级提示保留为条件显示。

**Blocked by:** 01 — 修正入口并建立海报舞台面板骨架

**Status:** complete

- [x] 四个选项为图标 pill：分P / 时间戳 / 详细 / Markdown，`aria-pressed` 表达状态，无副标题。
- [x] 开/关状态视觉明确：开=实心强调，关=描边浅底；hover/focus 可见。
- [x] 选项行为不回归：分P/时间戳规则、重建期间导出禁用、详细/Markdown 只重建文案。
- [x] 文案预览为消息卡：内容逐字符等于实际复制文本；标题与 UP 主使用系统中文字体，链接行使用等宽字体；不使用代码块边框或语法高亮。
- [x] 文案预览高度上限约 96px，超出滚动；不加“预览”标题。
- [x] 删除五栏快照表和固定帮助段落；短链降级提示仅在 fallback 时出现。
- [x] 主题 A/B 下文案预览和选项均有对应 tokens。
- [x] 纯逻辑测试覆盖选项状态与文案四种组合；`npm test`、`npm run check`、`npm run build` 通过；真实页面验证无回归。

## Comments

### 2026-09-05 — implementation and verification

- 已按批准方案完成本 ticket 实现；自动化、真实页面适配验证及评审记录见 [本轮验收记录](../acceptance/2026-09-05-validation.md)。
- 完成状态指本 ticket 的实现与上述验证；不宣称完整 Tampermonkey / Chrome / Edge 矩阵已通过，最终视觉接受仍待主人确认。
