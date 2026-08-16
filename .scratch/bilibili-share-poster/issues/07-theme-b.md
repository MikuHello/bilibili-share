# 07 — 选择并记住 B 沉浸封面主题

**What to build:** 观看者可以在 A 报刊信息卡与 B 沉浸封面之间切换，两个主题呈现相同 generation snapshot 和 share target，并在下次打开面板时恢复上次选择。

**Blocked by:** 05 — 分享当前分P与播放位置

**Status:** in-progress

- [x] 首次使用默认选择 A 报刊信息卡；切换 A/B 后记住上次选择，并在后续打开分享面板时恢复。
- [x] 切换主题只改变视觉表现，不重新获取视频信息、不改变 generation snapshot、字段集合、share target 或文案语义。
- [x] B 主题以 1080×1440 的 3:4 画布导出，封面全出血、底部深色渐变、文字为白色，并保持已批准的信息层级。
- [x] B 主题标题最多三行并按内容压力执行 19→17→15px 阶梯降级；底端遮罩保证标题、UP 主、数据和身份信息可读。
- [x] 四项统计使用毛玻璃数据条，BV/AV 同时可见；二维码位于独立白卡并保留安静区，可见链接可完整换行。
- [x] 分P与时间标签在启用时位于顶部毛玻璃胶囊，未启用时不占位；缺少分P标题和统计时遵守既定 `P<number>` 与 `--` 规则。
- [x] B 主题使用对应深色分享面板；窄视口下海报收窄、控制区换行且所有动作仍可访问。
- [ ] A/B 两主题的 poster preview、复制 PNG 和下载 PNG 保持内容一致，并通过长标题、长链接、缺失统计和多分P场景视觉验收。
- [x] 页面入口随记住的主题呈现已批准的 A 细边框或 B 深色实心样式，同时保持海报图标和“生成海报”文案，不与官方分享动作混淆。
- [x] 主题默认值、持久化恢复、切换不改变数据语义以及 B 标题字号规则具有外部行为测试。
- [x] 若主人在本 ticket 的前端设计阶段要求切换 agent，每次切换前（含前端设计 agent 切回 Codex）均由离场 agent 用 `handoff` 在操作系统临时目录交付上下文，引用而不复制现有产物并列出 suggested skills；返回 Codex 后重新核对 ticket、实际文件和 Git 状态后继续。

## Comments

### 2026-08-14 — in-progress implementation

- TDD seam：`domain.ts` 新增 `posterTitleFontSize`（B 主题 19→17→15px 阶梯）与 A/B 内容顺序；`tests/domain.test.ts` 覆盖主题默认、B 画布、内容顺序与字号阶梯。
- 面板新增 A/B 主题选择器；首次默认 A，切换后通过 `GM_setValue` 记住，下次打开恢复；页面入口按钮随记忆主题切换 A 细边框 / B 深色实心样式。
- 切换主题只重建海报 DOM/二维码（本地），不重新获取视频信息、不重新生成短链、不改变 share target 或 share text 语义。
- B 海报按 3:4 实现：封面全出血、底部渐变遮罩、顶部毛玻璃分P/时间胶囊、标题三行、毛玻璃统计条、BV/AV、72px 白卡二维码与可换行链接。
- B 面板使用深色弹层样式，窄视口沿用纵向折叠布局。
- 待执行：`npm test`、`npm run check`、`npm run build` 与长标题/长链接/缺失统计/多分P 视觉验收；当前执行环境无法启动 shell，尚未 claim complete。
### 2026-08-17 — implementation and real-page evidence

- Real Chrome 151 page: switching to B changed poster/panel/entry classes, kept the same share target and text semantics, and downloaded a B-theme PNG measured by `sips` at 1080×1440.
- B title size steps are tested at 19→17→15px; A/B content order and 3:4 canvas are covered in `domain.test.ts`.
- Remaining acceptance: owner visual review of long-title, long-link, missing-stat, and multi-P B renders against the approved spec/prototype.
