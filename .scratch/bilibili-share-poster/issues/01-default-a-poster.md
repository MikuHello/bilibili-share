# 01 — 生成并下载默认 A 主题海报

**What to build:** 标准视频页上的第一条完整用户链路：观看者通过“生成海报”入口打开分享面板，看到基于稳定 generation snapshot 的 A 报刊信息卡预览，并下载与预览一致的 PNG。这个切片先使用规范长链接作为 share target；短链增强由后续 ticket 交付。

**Blocked by:** None — can start immediately

**Status:** in-review

- [x] 项目维护可测试的 TypeScript 源码，并能构建一个可直接安装的 `.user.js` 产物；版本一不声明远程更新地址。
- [x] 在受支持的标准视频页，官方分享动作右侧出现带海报/图片图标和“生成海报”文案的入口，且重复挂载不会产生多个入口。
- [x] 激活入口时先暂停正在播放的主播放器，再一次性捕获视频身份、当前分P、播放位置和先前播放状态；找不到或无法暂停主播放器时阻止生成并给出可重试的兼容性错误。
- [x] 分享面板立即以加载状态打开，随后显示 A 报刊信息卡的精确 poster preview，包含封面、标题、UP 主、BV/AV、四项统计、真实二维码和同源可见链接。
- [x] 本切片以规范长链接作为唯一 share target，二维码、可见链接和后续下载图中的落点保持一致。
- [x] 单项统计缺失时显示 `--`；标题、封面、UP 主、BV/AV 或有效 share target 缺失时阻止导出并显示具体错误和重试入口。
- [x] A 主题符合已批准视觉 spec：1080×1440、纸色网格、16:9 居中裁切封面、标题最多两行、表格化统计、二维码白底安静区以及可完整换行的链接。
- [x] A 主题分享面板在宽视口采用左侧 poster preview、右侧控制区的浅色分栏布局；窄视口折叠为预览在上、控制在下，加载、错误、关闭和下载均可访问。
- [x] 下载得到与 poster preview 内容一致的 PNG，文件名符合默认分享的命名规则。
- [x] 关闭按钮、`Escape` 和点击遮罩走同一关闭路径；仅当 userscript 暂停了原本正在播放的同一视频时恢复播放。
- [x] 数字、时间、字段层级、标题规则和默认主题等领域核心行为通过 Node 中的外部行为测试；DOM、网络和导出保持为薄适配器。
- [x] 在真实受支持页面完成可见 happy path 验证，并确认服务响应、二维码内容、PNG 尺寸与页面播放恢复行为。
- [x] 若主人在本 ticket 的前端设计阶段要求切换 agent，每次切换前（Codex → 前端设计 agent，以及前端设计 agent → Codex）均由离场 agent 用 `handoff` 将交接文档写入操作系统临时目录；交接只引用现有 idea、spec、ticket 和设计原型，包含 suggested skills 且不含敏感信息。返回 Codex 后须重新核对 ticket、实际文件和 Git 状态后继续。

## Comments

### 2026-08-14 — implementation evidence

- TDD seam: `src/domain.ts` through 18 Vitest assertions. Red was observed before each domain slice; final `npm test`, `npm run check`, and `npm run build` pass.
- The generated `dist/bilibili-share-poster.user.js` has no remote update metadata and declares only the Bilibili video match, metadata/cover connectivity, `GM_xmlhttpRequest`, and Tampermonkey's SPA URL-change grant.
- Visible real-page checks used `BV1xx411c7mD` and `BV1XoTEzrEiL`: the entry mounted once immediately after `.video-share-wrap`; live metadata returned HTTP 200/business code 0; a real cover, identity, statistics, QR, canonical target, and default A poster rendered.
- The downloaded `bilibili_BV1xx411c7mD_20260814-090512.png` measured 1080×1440. Independent QR decoding returned `https://www.bilibili.com/video/BV1xx411c7mD/`, matching the visible link.
- Closing by button and backdrop resumed a video that this userscript paused; closing with `Escape` left an already-paused video paused. At 700×900 the workspace collapsed to one column with preview above controls.
- The userscript was injected temporarily for browser validation; Tampermonkey was not persistently modified. Its GM transport boundary was fed the same live public API response and cover bytes because a page-level fetch shim cannot reproduce Tampermonkey's cross-origin grant.
- No frontend-design agent switch was requested, so the conditional handoff clause did not activate.

### 2026-08-14 — first code-review remediation

- Spec review findings were repaired: capture now pauses before reading the stable identity/time; cover bytes must be a decodable image before ready/export; the approved masthead says `SHARE CARD`.
- Domain output now drives the runtime theme class, content order, title line clamp, link wrapping, and export dimensions instead of duplicating those decisions only in adapters.
- Re-export of `BV1XoTEzrEiL` measured 1080×1440 and independently decoded to its canonical share target. A live-page invalid `text/html` cover response showed a specific error, retry action, and no download action.
- Playback restoration also requires the same captured part number. The baseline `.DS_Store` tracking state was restored so this ticket does not perform unrelated cleanup.
