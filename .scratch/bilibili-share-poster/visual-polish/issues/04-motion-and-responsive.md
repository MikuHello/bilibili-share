# 04 — 动效与无溢出响应式

**What to build:** 按 `motion.md` 落地面板开合、主题切换 crossfade、重建遮罩、状态反馈与入口过渡；窄视口按明确网格换行，B 式底部控制条不采用。

**Blocked by:** 01、02、03

**Status:** ready-for-agent

- [ ] 面板打开 240ms、关闭 160ms，仅 opacity/transform/color 类属性动画。
- [ ] 主题切换为双层 crossfade：旧海报层原位淡出，新海报层淡入，总时长约 160ms；不得先清空再重建造成跳动。
- [ ] 分P/时间戳重建期间旧预览保留，遮罩 140ms 淡入/淡出，导出按钮禁用。
- [ ] 状态反馈按 `motion.md` 执行；入口 hover 与 A/B 样式切换使用 tokens。
- [ ] `prefers-reduced-motion: reduce` 下所有非必要过渡为 0ms。
- [ ] 窄视口 <880px：舞台在上、控制栏在下；选项 2×2、动作 2×2；面板整体滚动，底部按钮可访问且不溢出方框。
- [ ] 宽视口控制栏内部不出现横向溢出；长链接在预览卡和海报内完整换行。
- [ ] `npm test`、`npm run check`、`npm run build` 通过；真实页面宽窄视口与 reduced-motion smoke 通过。

## Comments
