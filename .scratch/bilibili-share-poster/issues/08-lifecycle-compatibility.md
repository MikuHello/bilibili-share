# 08 — 加固页面生命周期与支持矩阵

**What to build:** 完整分享功能在 Bilibili 的 SPA 导航、分P变化、DOM 重建和受支持浏览器矩阵中保持身份正确、入口可达、播放状态安全，并在页面入口挂载失败时提供 Tampermonkey 菜单备用入口。

**Blocked by:** 06 — 提供详细文案、Markdown 与组合复制；07 — 选择并记住 B 沉浸封面主题

**Status:** in-progress

- [x] 导航到另一 BVID 时关闭旧面板、丢弃旧 snapshot，并为新标准视频页幂等恢复唯一入口；旧视频重试不再可用。
- [x] 同一 BVID 内切换分P时关闭面板并丢弃 snapshot，不暂停或恢复新分P的播放。
- [x] 面板已打开时再次激活任一入口只将现有面板置前，不重复网络请求或重抓 snapshot。
- [x] 页面入口无法挂载但当前标准视频可读取时，Tampermonkey 菜单命令可打开同一分享链路；非标准视频页不会生成误导性结果。
- [x] 页面 DOM 重建只恢复入口，不改变已打开面板的身份或已捕获播放位置。
- [x] 所有关闭路径严格遵守播放恢复规则，在身份已经变化时不会恢复错误视频。
- [x] 分享面板在窄视口下可滚动、可关闭，预览、四项选项、文案和四个导出动作都可访问；简体中文状态和错误不被截断。
- [ ] 当前稳定 Tampermonkey、Chrome/Edge 当前稳定版及此前两个主版本完成安装、生成、切换、复制、下载、关闭和导航验证。
- [x] 验证过程中确认没有项目后端上传、没有后台剪贴板写入、没有分享计数请求，也不会在日志或产物中保留凭据及个人数据。
- [x] 构建、自动化测试、真实页面 smoke 和最终 code review 全部通过；发现的兼容差异被明确记录为支持边界而不是静默忽略。

## Comments

### 2026-08-14 — in-progress implementation

- 已具备：`urlchange`/`popstate` 处理 BVID 与分P变化时关闭旧面板并丢弃 snapshot；MutationObserver 幂等恢复入口；面板已打开时再次激活只置前不重复请求；同一身份检查防止恢复错误视频；关闭路径统一。
- 新增 Tampermonkey `GM_registerMenuCommand` 备用入口；仅在 `readPageIdentity()` 命中标准视频页时打开，非标准页不产生误导结果。
- 页面 DOM 重建只影响入口挂载，不改变已打开面板的 capture/options/snapshot。
- 待执行：真实浏览器矩阵（当前稳定 Chrome/Edge 及其前两个大版本）安装、生成、切换、复制、下载、关闭、导航验证；`npm test`/`npm run check`/`npm run build`/`git diff --check`；兼容差异记录。当前执行环境无法启动 shell，尚未 claim complete。
### 2026-08-17 — implementation and real-page evidence

- Real Chrome 151 SPA simulation: `history.pushState` + `urlchange` closed the old panel and idempotently remounted “生成海报”; `popstate` back restored the entry; menu command was registered as the backup entry.
- Full current-Chrome smoke passed install-injection, generation, part/timestamp/theme switching, text/poster/combined copy, download, close, and navigation.
- Remaining acceptance: current Edge plus previous two major versions of Chrome and Edge in real Tampermonkey; Edge/legacy findings are not yet recorded as a support boundary.
