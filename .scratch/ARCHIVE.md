# 历史工作归档

2026-09-08 清理了历史截图、探针、临时构建、原型副本和逐步报告。想法、规格、审批、工单与各阶段最终验收摘要仍保留在对应工作项下；记录中的旧版本号按当时事实保留。

## 查阅原始证据

完整清理前快照：[`f0a534c`](https://github.com/MikuHello/bilibili-share/tree/f0a534c81de44edccd741ecd116a6d07dfa5cf83/.scratch)。历史记录中的裸文件路径和旧命令指向该快照，不是当前测试入口；需查看已移除文件时，在快照中按原路径打开。可导航的已移除文件链接已改为固定提交链接。Git 历史未重写。

## 最终验收摘要

- [默认主题与分享面板](bilibili-share-poster/redesign/acceptance/final-verification.md)
- [外观初期调整](bilibili-share-poster/visual-polish/acceptance/2026-09-05-validation.md)
- [分享行为迭代](bilibili-share-poster/usage-refinement/evidence/ticket07/verification.md)
- [海报细节](bilibili-share-poster/usage-refinement/polish/evidence/verification.md)
- [文案面板](bilibili-share-poster/usage-refinement/text-panel-polish/evidence/verification.md)
- [入口与剪贴板](bilibili-share-poster/usage-refinement/entry-icon-polish/evidence/final/verification.md)
- [标记更新与流畅度](bilibili-share-poster/usage-refinement/interaction-smoothness/evidence/final/verification.md)
- [视频荣誉与反馈](bilibili-share-poster/video-honors/evidence/final/verification.md)
- [文案模板与海报模块拆分](share-generation-extensibility/evidence/final/verification.md)

最近一次重构的 [发布信息](share-generation-extensibility/evidence/final/release.json) 和 [海报哈希比较](share-generation-extensibility/evidence/final/poster-comparison.json) 一并保留，里面的历史输出路径也按上述快照解释。

## 当前目录约定

- 测试输入：[tests/fixtures](../tests/fixtures/covers/SOURCES.md)。
- 产品展示：[docs/images](../docs/images)。
- 本地生成结果：`artifacts/`，不提交到 Git。
- 后续归档按 [工作项规则](../docs/agents/issue-tracker.md#generated-artifacts-and-completed-work) 执行。
