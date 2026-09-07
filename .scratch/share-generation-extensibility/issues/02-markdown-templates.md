# 02 — Markdown 独立模板与四预设完整配置

Status: complete
Blocked by: 01

## What to build

Markdown 简洁/详细接入共用能力，独立配置和转义，规范 URL 保持完整，单预设错误不影响其他输出。

## Acceptance criteria

- [x] 默认 Markdown 精确兼容，特殊字符和链接正确。
- [x] 四预设可部分覆盖，实际面板详细/分P/时间切换及复制正常。
- [x] 配置错误独立回退，文档完整。

## Execution

按同目录上级 spec.md 与 ticket-breakdown.md 实施，使用已批准的生成接口及实际面板/导出测试入口。每票独立新上下文，TDD、类型检查、code-review。每票开始提交为该票审查基准；三票完成后统一交付。

## Comments

2026-09-08 — Implemented in a fresh implement context, review baseline `8ba8bdd`; implementation commit `09befc0`.

- Markdown compact/detailed presets now use the common variable context and single-pass renderer. The existing production configuration accepts independent partial overrides for all four presets. Text variables are escaped; canonical URLs and formatted statistics retain their display forms.
- TDD: added an independent Markdown compact override test at `buildShareText`; it failed against the fixed-code Markdown branch, then passed after template integration. Added regression cases for omitted defaults, authored Markdown, special characters, single escaping, conditional availability, zero/missing statistics, empty overrides and contextual selected-preset diagnostics.
- Validation: TypeScript passed; full Vitest suite 95/95 passed. Real Chromium Markdown verification passed 12 cases covering all four production presets, detail/part/time changes, escaped copy output, independently broken Markdown compact/detailed presets, ordinary preview/copy, and actual PNG clipboard export on every case. Existing ordinary-template browser regression passed 18 cases.
- Evidence: `../evidence/ticket02/markdown-report.json`, `../evidence/ticket02/plain-regression/template-report.json`, and `../evidence/ticket02/verification.md`. Browser checks bundle the production entry point with actual developer-config overrides. Final version/build and broad browser regression remain the parent batch responsibility.
- Code review of `git diff 8ba8bdd...HEAD`: Standards 0 documented violations, one optional minor duplication suggestion for the browser config injection setup; Spec 0 missing, extra or incorrect requirements. The small test setup remains local for now; no production issue was identified.
- Limitation: controlled Chromium external page/GM/clipboard fixtures, not live Tampermonkey or Violentmonkey validation.
