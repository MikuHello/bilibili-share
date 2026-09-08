# 02 — 本地原型使用建议性 dev 版本

Status: complete
Blocked by: None

主人明确决定去掉 R 编号，直接建议使用 0.1.0-dev.1 形式作为本地原型版本。正式版本仍由仓库拥有者管理。

- 同步贡献指南、README、开发规范；私人实验不要求全仓库递增。
- 开发构建描述仅显示实际 dev 版本；默认 build:dev 可直接生成 dev.1，可选 --revision 指定数字后缀。
- 保持正式/开发产物与安装名称隔离，正式0.1.0不变。
- 测试入口沿用实际构建命令与产物验证。审查基准9e1202b。

## Verification

红：默认 --dev 被旧代码拒绝；绿：npm run test:build通过默认dev.1、显式dev.1/dev.2、版本描述、安装名称与产物隔离及错误参数验证。历史工单保留原规则作为当时记录。

## Comments

实现711dd41。Standards无发现；Spec提出docs/agents/skills.md旧R术语遗漏，已改为正式版本与本地开发版本。正式产物与版本保持原样，历史证据不重写。
