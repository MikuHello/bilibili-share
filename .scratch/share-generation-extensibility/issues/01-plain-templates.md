# 01 — 普通文案模板接入实际分享流程

Status: complete
Blocked by: None

## What to build

共用变量和简单条件块生成能力，普通简洁/详细默认模板和集中覆盖入口接入实际面板；消除末行链接假设；错误配置回退默认文案。

## Acceptance criteria

- [x] 默认文案精确兼容；变量/条件/缺失/零值/错误行为符合规格。
- [x] 自定义模板链接换位或省略后，初始和刷新预览与复制内容一致。
- [x] Markdown 现有行为不变；提供变量表及开发示例。

## Execution

按同目录上级 spec.md 与 ticket-breakdown.md 实施，使用已批准的生成接口及实际面板/导出测试入口。每票独立新上下文，TDD、类型检查、code-review。每票开始提交为该票审查基准；三票完成后统一交付。

## Comments

2026-09-08 — Implemented in a fresh implement context, review baseline `a991d84`.

- Public `buildShareText` now accepts partial ordinary-template overrides. Production panel reads `src/share-text-config.ts`; parser supports single-pass variables, nonnested availability conditions, escaped delimiters and source-position diagnostics. Markdown behavior stays in ticket 02 scope.
- Initial/updated previews preserve the whole string and emphasize canonical URL occurrences without assuming a final link line. Errors fall back independently in the panel. Developer variable table and examples: `docs/share-text-templates.md`.
- TDD red→green: partial ordinary overrides; zero/missing/conditional output; malformed/hidden syntax and literal escapes; unavailable part/time; production browser config initially failed before panel integration and then passed.
- Validation: full Vitest suite 91/91 before final availability guard; final share-text tests 24/24 and TypeScript passed after guard. Production build passed. Chromium browser integration passed 18 cases (6 templates × initial/detail/markers), with evidence `../evidence/01/template-report.json`. Fixtures replace external page/GM/clipboard boundaries and compile the actual config module with developer overrides. Final batch regression and release bundle are owned by the parent execution.
- Code review: parallel Standards and Spec agents reviewed `git diff a991d84...HEAD`: Standards 0 hard violations / 0 actionable smells; Spec 0 missing, extra or incorrect requirements. Final availability guard followup review passed on both axes with no new findings.
- Limitation: no live Tampermonkey/Violentmonkey validation in this ticket; controlled Chromium evidence is not a substitute for it.
