# 04 — 深色适配与工具栏入口

**What to build:** 分享者在浅深模式下清晰阅读面板，生成海报入口自然融入原视频操作栏。

**Blocked by:** None — can start immediately

**Status:** complete

- [x] 明确面板标题/正文/图标/背景/控件语义颜色，验证宿主标题覆盖情形，不再出现深底黑字。
- [x] 遵循既有有效页面模式初始化与切换，未知信号保持已知模式；支持既有标准页/BewlyCat边界。
- [x] 入口图标、字体、行高、对齐、颜色及交互与点赞投币收藏分享协调，保留菜单备用入口和SPA重挂载。
- [x] 面板模式切换不改变海报配色或触发PNG无意义失效；不恢复旧A/B主题联动。
- [x] 验证浅深、宿主干扰、初始信号/变化/未知、键盘焦点与窄窗口；真实环境和CSS模拟证据分别记录。

## 执行约定

- 事实源：本轮已批准实现规格、B3最终视觉批准及拆票方案；原型仅作视觉证据，不能整体合并生产。
- 在同一隔离集成分支累积实现，每票fresh implement；沿用领域逻辑与浏览器副作用的既有测试接缝。
- 本票先完成必要局部整理，再按TDD实现可见行为；运行相关测试和类型检查，完成双轴code-review并提交，记录真实证据及限制。
- 每票独立验证，不把本票测试推迟到最终集成；不逐票向主人交付中间安装包，全部完成后统一交付。
- 遇到已授权的常规实现选择继续推进；新的产品取舍或不能自行解决的外部阻塞明确记录，不擅自扩展范围。

Verification: [controlled browser + live CSS observations](https://github.com/MikuHello/bilibili-share/blob/f0a534c81de44edccd741ecd116a6d07dfa5cf83/.scratch/bilibili-share-poster/usage-refinement/evidence/ticket04/verification.md). Code commit `86f2d2e`; full installed-candidate verification remains ticket07.

## 实心入口B收尾

- [x] 按主人已选择B替换入口图形，保留原生工具栏位置/尺寸/颜色与交互。
- [x] 浏览器核对浅深与原生行对齐、键盘及SPA重挂载；代码审阅后与复制修复统一交付0.3.3。

事实源spec.md末尾确认与entry-icon-polish/idea.md；原型codex/entry-icon-prototype。

0.3.3完成证据：[统一验收](../entry-icon-polish/evidence/final/verification.md)。实际安装后的GM通道验证仍待主人升级；不以受控验证替代。

## 0.3.4 follow-up

- [x] Apply approved entry label correction from spec.md final appendix: 分享海报. Existing appearance browser suite and typecheck pass; review before unified delivery.

Entry keeps its approved icon and geometry. Existing browser action selectors now use the visible 分享海报 label. Evidence: [entry](https://github.com/MikuHello/bilibili-share/blob/f0a534c81de44edccd741ecd116a6d07dfa5cf83/.scratch/bilibili-share-poster/usage-refinement/interaction-smoothness/evidence/entry/browser-verification.md).

0.3.4 entry review `971a087...1c3fa4b`: Spec 0 findings; Standards 0 hard violations and 0 actionable smells. Unified release remains pending ticket 06.
