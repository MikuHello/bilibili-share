# 贡献指南

本项目使用 Matt skills 组织工程工作。Agent 从 [AGENTS.md](AGENTS.md) 进入，由 [ask-matt](.agents/skills/ask-matt/SKILL.md) 选择适合当前任务的路径；项目适配规则集中在 [Matt 工作流](docs/agents/skills.md)。

## 文档各管什么

| 文档 | 职责 |
| --- | --- |
| 本指南 | 贡献入口与文档导航 |
| [AGENTS.md](AGENTS.md) | Agent 的唯一项目入口，按任务指向相应规范 |
| [开发规范](docs/development.md) | 版本、开发构建、验证、发布与工作目录管理 |
| [发行流程](docs/distribution.md) | Greasy Fork 唯一安装入口、Actions 候选产物和 GitHub 源码 Release |
| [Matt 工作流](docs/agents/skills.md) | 任务路由、审批状态、技能更新与来源 |
| [本地工单](docs/agents/issue-tracker.md) | `.scratch/` 的需求、规格、票据及状态约定 |
| [领域文档规则](docs/agents/domain.md) | 何时读取/维护词汇表与 ADR |
| [CONTEXT.md](CONTEXT.md) | 产品领域术语；只记录已确定的概念 |
| [文案模板](docs/share-text-templates.md) | 模板变量、配置与复用示例 |
| [海报维护](docs/poster-maintenance.md) | 海报布局、目标更新及 PNG 缓存职责 |

已有规则只在对应文档维护，本指南和 AGENTS 保留链接，避免复制成多套规范。`docs/adr/` 在出现需要长期记录的架构决定时再创建。

项目介绍、安装入口与运行截图见 [README](README.md)；贡献与 agent 导航分别使用本指南和 AGENTS。历史原型和验收产物的查阅入口见 [归档索引](.scratch/ARCHIVE.md)。

## 开始贡献

1. 阅读开发规范，安装 Node.js 与项目依赖。
2. 从当前需求或已批准工单开始。新需求按 Matt 路径澄清；已有明确的小维护任务可直接进入 implement。
3. 修改后运行与变更相称的验证，并进行 Standards / Spec 双轴审查。
4. 提交源码、配置、文档及必要验证记录。本地原型建议使用 `0.1.0-dev.1` 这样的开发版本，不使用额外的 R 编号；私人实验不要求逐次递增或在全仓库统一序号。共享开发包时附目标版本和 Git 提交号，正式版本由仓库拥有者管理。细则见开发规范。

项目级 `.agents/skills/`、来源锁与上游许可证应随仓库提交，让其他贡献者得到相同流程。当前使用本地 Markdown 工单；有 GitHub 仓库后也不会自动迁移历史工单。
