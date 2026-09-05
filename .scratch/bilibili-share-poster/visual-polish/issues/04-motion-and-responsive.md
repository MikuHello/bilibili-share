# 04 — 动效与无溢出响应式

**What to build:** 按 `motion.md` 落地面板开合、主题切换 crossfade、重建遮罩、状态反馈与入口过渡；窄视口按明确网格换行，B 式底部控制条不采用。

**Blocked by:** 01、02、03

**Status:** complete

- [x] 面板打开 240ms、关闭 160ms，仅 opacity/transform/color 类属性动画。
- [x] 主题切换为双层 crossfade：旧海报层原位淡出，新海报层淡入，总时长约 160ms；不得先清空再重建造成跳动。
- [x] 分P/时间戳重建期间旧预览保留，遮罩 140ms 淡入/淡出，导出按钮禁用。
- [x] 状态反馈按 `motion.md` 执行；入口 hover 与 A/B 样式切换使用 tokens。
- [x] `prefers-reduced-motion: reduce` 下所有非必要过渡为 0ms。
- [x] 窄视口 <880px：舞台在上、控制栏在下；选项 2×2、动作 2×2；面板整体滚动，底部按钮可访问且不溢出方框。
- [x] 宽视口控制栏内部不出现横向溢出；长链接在预览卡和海报内完整换行。
- [x] `npm test`、`npm run check`、`npm run build` 通过；真实页面宽窄视口与 reduced-motion smoke 通过。

## Comments

### 2026-09-05 — implementation and verification

- 已按批准方案完成本 ticket 实现；自动化、真实页面适配验证及评审记录见 [本轮验收记录](../acceptance/2026-09-05-validation.md)。
- 完成状态指本 ticket 的实现与上述验证；不宣称完整 Tampermonkey / Chrome / Edge 矩阵已通过，最终视觉接受仍待主人确认。
