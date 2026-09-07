# 06 — 最终动作布局与浮层反馈

**What to build:** 分享者在统一浅深面板中使用集中导出动作，提示利落出现且不挤动页面。

**Blocked by:** 04、05

**Status:** complete — 0.3.4 approved three-button follow-up

- [x] 下载PNG图标在蓝色复制海报左侧；根据05实际组合动作去留自然布局，不保留空槽或原型演示说明。
- [x] 操作反馈使用不占布局浮层，约120ms短过渡且不阻塞动作；支持减少动态效果，不遮挡关键控件。
- [x] 成功提示可自动消失；重要失败保留清晰恢复路径，复制失败不丢预览，封面失败仍保留有效文案。
- [x] 关闭按钮/Escape/遮罩和焦点返回完整；窄屏能滚动访问全部动作，图标有名称、提示和焦点状态。
- [x] 验证提示前后控件无布局位移、快速连续操作、不同失败分支、320/390px与键盘导航。

## 执行约定

- 事实源：本轮已批准实现规格、B3最终视觉批准及拆票方案；原型仅作视觉证据，不能整体合并生产。
- 在同一隔离集成分支累积实现，每票fresh implement；沿用领域逻辑与浏览器副作用的既有测试接缝。
- 本票先完成必要局部整理，再按TDD实现可见行为；运行相关测试和类型检查，完成双轴code-review并提交，记录真实证据及限制。
- 每票独立验证，不把本票测试推迟到最终集成；不逐票向主人交付中间安装包，全部完成后统一交付。
- 遇到已授权的常规实现选择继续推进；新的产品取舍或不能自行解决的外部阻塞明确记录，不擅自扩展范围。

证据：[验证与两轴审阅](../evidence/ticket06/verification.md)。实现a3cdec9，审阅修复a9b9e68。


## B局部收尾（主人已确认）

- [x] 文案高度自适应，右侧紧凑居中，操作区紧邻文案；取消64px常驻预留，浮层恢复路径及非阻塞行为完整。
- [x] 详细文案编号紧邻链接且无BV/av前缀，普通/Markdown顺序一致；不改变详细信息默认值。
- [x] 按新规格补充几何/窄屏/反馈验证并回归，双轴审阅后交付0.3.2。

设计档案`codex/text-panel-prototype`，B已确认；事实源为spec.md本轮补充及text-panel-polish/idea.md中的主人直接指示。沿用当前已批准工单的fresh implement流程，不再询问已确认布局，也不恢复主人暂停的复制故障排查。

0.3.2实现38ced25，构建f895e7c；[本轮验证与双轴审阅](../text-panel-polish/evidence/verification.md)，64单元测试、9浏览器套件和28PNG扫码通过。

## 0.3.4 follow-up

- [x] Bottom row now contains download, primary poster copy and secondary plain-text copy with equal copy widths; Markdown remains above.
- [x] Existing browser seam red on same-row assertion, then green: desktop, 320/390px, keyboard, feedback, cover failure, clipboard and PNG download. Typecheck passed.
- [x] Dual-axis review 31685d1...42863fa: Standards 0 hard violations / 0 actionable smells; Spec 0 findings.
