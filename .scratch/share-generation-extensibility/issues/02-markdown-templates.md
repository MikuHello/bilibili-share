# 02 — Markdown 独立模板与四预设完整配置

Status: ready-for-agent
Blocked by: 01

## What to build

Markdown 简洁/详细接入共用能力，独立配置和转义，规范 URL 保持完整，单预设错误不影响其他输出。

## Acceptance criteria

- [ ] 默认 Markdown 精确兼容，特殊字符和链接正确。
- [ ] 四预设可部分覆盖，实际面板详细/分P/时间切换及复制正常。
- [ ] 配置错误独立回退，文档完整。

## Execution

按同目录上级 spec.md 与 ticket-breakdown.md 实施，使用已批准的生成接口及实际面板/导出测试入口。每票独立新上下文，TDD、类型检查、code-review。每票开始提交为该票审查基准；三票完成后统一交付。
