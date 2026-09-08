# 01 — 清理历史中间产物

Status: done
Blocked by: none
Baseline: f0a534c81de44edccd741ecd116a6d07dfa5cf83

## Approved scope

主人认可清理历史中间产物与冗余记录：迁移仍被测试使用的素材到 tests/fixtures/，保留规格、设计决策和最终验收摘要，删除重复截图及过时生成文件，阻止后续输出再次进入 Git，并进行提交。

## Acceptance

- 四张有效封面输入保持原字节与来源信息，测试不再读取历史 .scratch 文件。
- 现有测试默认只写入忽略的 artifacts/browser/，保留 BSP_EVIDENCE_DIR 覆盖能力。
- 保留想法、规格、审批、工单和每阶段最终验收摘要；旧原型、逐步探针、日志、截图和冗余报告可从固定历史提交恢复。
- 保留最近一次重构的发布摘要与 PNG 哈希比较，保留 docs/images 产品展示、.agents 技能源和来源锁。
- 修复 Markdown 导航引用、增加简洁归档入口和产物留存规则；不改产品代码、版本或 Git 历史。
- 运行类型检查、单元与完整浏览器套件；审查后以 MikuHello 为主作者、Codex 为共同作者提交。

## Validation

- 清理前 .scratch 跟踪 1,060 个文件、约 327.45 MiB；移除 968 个历史路径（其中需要的封面/来源已迁移），保留 90 份历史 Markdown、2 份关键 JSON。新增归档入口和本工单。
- 删除的历史文档共 43 份，主要为已被最终摘要覆盖的逐步报告、旧原型说明和过时发布草稿；规格、审批和工单仍保留。
- 测试封面与 sources.json 对照基线逐字节一致；重复 default 封面合并。fixtures 合计约 1.84 MiB，来源说明保留。
- 37 处历史 Markdown 引用转换为固定基线链接；连同归档入口及摘要说明，共 47 个固定提交链接按基线文件树核对通过。当前本地文档链接有效（模板示例 {{url}} 不作为文件链接）。
- npm run check、95 项 Vitest 测试、npm run test:build 通过。
- 设置 BSP_PLAYWRIGHT_MODULE 后，npm run test:browser 默认输出到 artifacts/browser/delivery/，全部 15 套件退出 0。测试覆盖受控浏览器和 Chromium 剪贴板，不代表重新进行真实 Tampermonkey 安装验收。
- 验证 .gitignore 同时排除 artifacts/ 和历史 evidence 输出；scripts 无 .scratch 引用。产品源码、README、展示图、.agents 与正式 dist 均未变化。
- 本轮生成的 86 个原始浏览器输出（约 36.01 MiB）在汇总后清理，仅保留本摘要；可用相同命令重新生成。
- Standards 独立审查 0 项；Spec 独立审查 0 项；git diff --check 通过。
