# 01 — 发布版本、开发迭代与项目入口规范

Status: in-progress
Blocked by: None

## Request and authorization

2026-09-08：主人明确要求测试 GitHub CLI 与连接、正式版本重定为 V0.1、区分 GitHub 发布版本和 R1/R2 开发迭代、整理贡献指南及 agent 规范、Matt 流程作为唯一 agent 工程入口、项目级技能可随仓库提交，并检查更新上游。

按 ask-matt 的已明确单会话维护任务路径执行 implement；不重新询问已明确的产品取舍。本票审查起点 d887910。测试入口为实际构建命令及输出 userscript 头、正式/开发产物隔离；文档与上游锁校验采用静态检查。

## Deliverables

- GitHub CLI / authenticated API / Git transport 只读检查，记录仓库连接限制。
- 正式展示 V0.1，package/userscript 0.1.0，未来 GitHub tag v0.1.0；开发为 V0.1.0 Rn / 0.1.0-dev.n，明确指定迭代号。
- README 面向使用者；CONTRIBUTING 面向贡献者；AGENTS 作为 agent 唯一入口，引用 Matt 路由和工程规范。
- 项目级稳定 Matt skills 更新到 3cca18b368ae95cdbdebbff572ccafa662551015，保留 MIT 许可和来源锁。
- 不创建 GitHub 仓库、不推送或发布；当前目标仓库不可读，未得到明确建仓指令。

## Acceptance

- [ ] 正式/开发构建版本和产物隔离可验证，错误迭代参数明确拒绝。
- [ ] 文档职责、版本规则、Matt 路由、上游更新规则清晰且单一来源。
- [ ] 本地 skills 与锁定上游一致，无悬空本地文档引用。
- [ ] 类型/行为/构建检查及双轴 code-review 完成。
