# 03 — 默认海报职责整理并保持导出行为

Status: ready-for-agent
Blocked by: None

## What to build

默认布局拥有渲染、测量、外观及目标节点更新；PNG 编码与缓存职责分离，现有面板继续预览/更新/复制/下载。

## Acceptance criteria

- [ ] 默认视觉和尺寸保持一致，二维码目标正确。
- [ ] 字体与目标更新后缓存失效，过期异步结果不覆盖当前状态。
- [ ] 封面失败时文字可用，无新布局或插件系统，维护文档更新。

## Execution

按同目录上级 spec.md 与 ticket-breakdown.md 实施，使用已批准的生成接口及实际面板/导出测试入口。每票独立新上下文，TDD、类型检查、code-review。每票开始提交为该票审查基准；三票完成后统一交付。
