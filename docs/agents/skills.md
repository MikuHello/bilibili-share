# Matt skills 工作流

Matt skills 是本项目 agent 工程工作的唯一流程入口。先由 [ask-matt](../../.agents/skills/ask-matt/SKILL.md) 路由，再执行对应技能。其他设计、浏览器、文档工具可以辅助当前阶段，不另起一套绕过规格和验证的流程。

## 按任务进入

| 当前情况 | Matt 路径 |
| --- | --- |
| 新想法或尚有产品取舍 | grill-with-docs → 需要可视/可运行答案时 handoff + prototype → to-spec → to-tickets → implement |
| 已明确、单上下文可完成的小维护任务 | implement；将当前请求和验收依据记录到本地工作项 |
| 已批准的规格/工单 | implement，从其依赖和当前状态继续 |
| 难复现或原因不明的故障 | diagnosing-bugs，再进入相应实现/审查路径 |
| 外部提交的原始问题/需求 | triage，使用 [默认角色映射](triage-labels.md) |
| 单独审查 | code-review，固定审查 SHA 与规格来源 |
| 不确定下一步 | ask-matt；需要人类补充时只询问尚未确定的决策 |

implement 使用 TDD（适用时）和 code-review。多票实施每票使用新上下文；已经批准的整批任务按依赖连续推进，最终统一交付。新上下文和新文件目录是两件事，临时 worktree 生命周期见 [开发规范](../development.md)。

## 项目约定

- 原始输入写到 `.scratch/<feature>/idea.md`，它不是实施授权。
- 新需求在主人确认已达成共同理解后生成规格，规格与拆票批准后发布正式工单。
- 当前请求已经明确的维护工作，以及已有获批范围，可按对应入口直接执行。后续技术细节由 agent 在范围内处理，不重复索取已有授权。
- 视觉变化单独走 prototype/design 阶段；内部职责整理保持已有视觉。
- 本地工单规则见 [issue-tracker.md](issue-tracker.md)；领域规则见 [domain.md](domain.md)；正式版本与本地开发版本只在 [开发规范](../development.md) 定义。
- Skills 明确引用其他技能时继续按路由读取。单纯回答问题或只读核查不强制生成一套新产品规格。

## 上游来源与随仓库共享

上游为 [mattpocock/skills](https://github.com/mattpocock/skills)。本地安装的是上游插件清单列出的稳定 engineering/productivity 技能，包含主流程及其路由依赖；不包含 in-progress、deprecated、misc 目录。

精确提交、插件版本、技能清单、上游路径和文件 SHA-256 以 [来源锁](../../.agents/matt-skills.lock.json) 为准。上游插件版本可能不随每次提交变化，因此更新检查以 commit 为准。

`.agents/skills/`、来源锁及 [上游 MIT 许可证](../../.agents/MATT-SKILLS-LICENSE) 应一起纳入 Git，能够随项目推送到 GitHub。该许可证适用于这些上游技能；项目自身源码许可独立决定。

## 更新技能

1. 读取来源锁，检查本地 skill 文件是否仍匹配锁中的散列。有本地差异时先说明并保存，不能静默覆盖。
2. 通过 `gh api repos/mattpocock/skills/commits/main` 获取当前提交；与锁中提交比较。可用 compare API 查看两者之间的变更，插件版本号相同不代表没有更新。
3. 在临时目录检出目标提交，检查上游 `.claude-plugin/plugin.json` 的稳定清单、技能互相引用、可执行辅助脚本和许可证。
4. 按清单复制完整技能目录到 `.agents/skills/<name>/`；保留上游内容，项目适配只修改 AGENTS 和 `docs/agents/`。清单移除或重命名技能时，先处理项目引用再移除旧目录。
5. 同步许可证和来源锁，核对每个文件的散列、清单与本地链接；运行文档/规范审查。上游工程流程发生实质变化时解释差异，再决定项目适配。
6. 记录旧/新提交及验证结果，与技能更新一起提交。技能同步不增加产品正式版本，也不执行上游安装脚本去改动全局环境。
