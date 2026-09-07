# 03 — 流畅更新与按版本复用导出

**What to build:** 分享者切换标记、详情和重复导出时减少等待，始终得到同一快照与目标的完整结果。

**Blocked by:** 01、02

**Status:** complete

- [x] 稳定保留面板控件，详情仅更新文案；目标变化缩小更新范围，封面/静态排版在允许时复用。
- [x] 删除人为140ms串行等待，不以动画完成作为恢复动作前置；选项即时反馈，未完成期间不开放混合状态导出。
- [x] 按封面/海报版本复用背景和PNG或进行中Promise；失败可重试，目标/字体/封面/版式变化正确失效，快照结束释放资源。
- [x] 关闭、导航、快速切换、重试、导出并发时过期结果不得回写；保留玩家上下文和生命周期保护。
- [x] 在相同环境记录改前改后打开、标记、首次/重复导出阶段耗时及布局变化，区分网络和本地；不把隔离计时当真实总延迟。
- [x] 测试重复导出复用、失败后重试、失效、异步竞态、详情无图像工作与当前版本一致性。

## 执行约定

- 事实源：本轮已批准实现规格、B3最终视觉批准及拆票方案；原型仅作视觉证据，不能整体合并生产。
- 在同一隔离集成分支累积实现，每票fresh implement；沿用领域逻辑与浏览器副作用的既有测试接缝。
- 本票先完成必要局部整理，再按TDD实现可见行为；运行相关测试和类型检查，完成双轴code-review并提交，记录真实证据及限制。
- 每票独立验证，不把本票测试推迟到最终集成；不逐票向主人交付中间安装包，全部完成后统一交付。
- 遇到已授权的常规实现选择继续推进；新的产品取舍或不能自行解决的外部阻塞明确记录，不擅自扩展范围。

Evidence: [ticket03 verification](../evidence/ticket03/verification.md).

## 0.3.4 follow-up

- [x] Apply approved local correction from spec.md final appendix; verify and review before unified delivery.

Verified: painted-frame regression now passes; SVG QR exports decode to the canonical target; update races pass. Same headless fixture median open 170.3 -> 162.3 ms, marker 35.9 -> 32.8 ms, first export 107.4 -> 106.5 ms. These small fixture changes do not establish installed Tampermonkey latency. SVG removes the measured full-resolution pixel loop while retaining QRCode and atomic target updates.

Review: Spec 0 findings; Standards 0 hard violations, 1 low-priority unused overlay-motion setting removed. Green delayed-frame evidence retained.
