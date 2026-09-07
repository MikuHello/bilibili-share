# 03 — 默认海报职责整理并保持导出行为

Status: complete
Blocked by: None

## What to build

默认布局拥有渲染、测量、外观及目标节点更新；PNG 编码与缓存职责分离，现有面板继续预览/更新/复制/下载。

## Acceptance criteria

- [x] 默认视觉和尺寸保持一致，二维码目标正确。
- [x] 字体与目标更新后缓存失效，过期异步结果不覆盖当前状态。
- [x] 封面失败时文字可用，无新布局或插件系统，维护文档更新。

## Execution

按同目录上级 spec.md 与 ticket-breakdown.md 实施，使用已批准的生成接口及实际面板/导出测试入口。每票独立新上下文，TDD、类型检查、code-review。每票开始提交为该票审查基准；三票完成后统一交付。

## Comments

2026-09-08 — Implemented in a fresh implement context, review baseline `7dcceac`; implementation commit `0230f77`.

- Default layout now owns rendering, offscreen measurement, cover appearance and target-node selectors in `default-poster.ts`. `poster-png.ts` owns encoding/cache/font invalidation. The stable public `posters.ts` entry points coordinate an asynchronous preparation with a guarded synchronous target commit and cache invalidation.
- This is a behavior-preserving refactor: reused the approved actual panel/export test seams before and after moving implementation. `verify-update-races.mjs` passed all 9 scenario groups; both before/after exported PNGs are byte-identical, including actual QR target decoding. `verify-update-performance.mjs` passed 3 samples. TypeScript, production build and 95/95 behavior tests passed.
- Maintenance guide: `docs/poster-maintenance.md`. Evidence: `../evidence/ticket03/verification.md`, before/after race reports and PNGs, `../evidence/ticket03/after/after.json`.
- Independent code reviews of `git diff 7dcceac...0230f77`: Standards 0 hard violations and 0 reportable smells; Spec 0 missing/partial requirements, scope creep or incorrect behavior.
- Final full browser matrix and 28-image comparison remain parent batch verification. Controlled browser fixtures do not substitute for a live userscript-manager install check.
