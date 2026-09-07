# 01 — 普通文案模板接入实际分享流程

Status: ready-for-agent
Blocked by: None

## What to build

共用变量和简单条件块生成能力，普通简洁/详细默认模板和集中覆盖入口接入实际面板；消除末行链接假设；错误配置回退默认文案。

## Acceptance criteria

- [ ] 默认文案精确兼容；变量/条件/缺失/零值/错误行为符合规格。
- [ ] 自定义模板链接换位或省略后，初始和刷新预览与复制内容一致。
- [ ] Markdown 现有行为不变；提供变量表及开发示例。

## Execution

按同目录上级 spec.md 与 ticket-breakdown.md 实施，使用已批准的生成接口及实际面板/导出测试入口。每票独立新上下文，TDD、类型检查、code-review。每票开始提交为该票审查基准；三票完成后统一交付。
