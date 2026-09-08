# 原生导航回归修复验收

Date: 2026-09-08
Status: Local implementation verified; not published or installed
Baseline: 9d9408a24b09f7536e6b263f0b2770702285c6e9
Branch: codex/fix-native-header

## 根因与修复

原生视频应用仍处于 SSR 接管阶段（祖先节点 `data-server-rendered="true"`）时，脚本插入分享入口，改变了 Vue 预期的子节点结构。Vue 放弃接管并重建应用，破坏独立挂载的原生顶部导航。

入口现在跳过仍在接管的祖先节点；全局挂载观察器仅额外观察 `data-server-rendered` 属性，让接管完成后重新尝试挂载。没有固定延时、没有导航重建补丁、没有 BewlyCat 依赖。Vue 2.7.16 只作为开发测试依赖，用真实的 SSR 接管逻辑复现宿主行为，不进入 userscript 产品包。

## 可重复反馈

测试入口：`scripts/verify-native-header.mjs`。最小 fixture 保留真实页面观察到的导航类名与左右链接；Vue 父应用接管时，导航已经独立渲染，入口插入改变工具栏子节点会导致父应用重建并丢失导航。

环境变量 `BSP_PLAYWRIGHT_MODULE` 指向本机已有 Playwright 入口。

- 旧包：`git show 9d9408a24b09f7536e6b263f0b2770702285c6e9:dist/bilibili-share-poster.user.js > artifacts/native-header/baseline.user.js`，再以 `BSP_TEST_BUNDLE=artifacts/native-header/baseline.user.js` 运行测试。
- 实际 RED：`AssertionError: native 首页 remains visible with userscript enabled`，`false !== true`，退出码 1。最终测试版本使用两次 animation frame 等待入口机会，已再次确认旧包失败。
- 修复后 GREEN：左右导航可见、通过浏览器点击可操作性检查；分享面板可以打开、加载、关闭，关闭后导航继续可操作。退出码 0。
- 静态 DOM 最初未复现；加入真实 Vue SSR 接管边界后才捕获相同故障，没有将静态 fixture 通过误报为问题解决。

## 真实 Edge 证据与边界

现场：BV1d18i6GEoY，BewlyCat 关闭。已安装分享脚本 V0.1.0 的入口挂载逻辑与仓库基线相同。

1. 分享脚本关闭时：顶部 `.bili-header`、`.left-entry`、`.right-entry` 存在。
2. 分享脚本启用并刷新：分享入口存在，三个导航节点均消失；页面日志出现 header `nextSibling` 为空的挂载错误。
3. 临时诊断断点记录第一次入口插入时根节点 SSR 标记为 `true`，后续插入为 `null`。
4. 临时限制 SSR 阶段入口插入后刷新：分享入口、原生导航、首页和消息链接同时存在。

此处是已安装旧脚本上的临时诊断验证，不是修复开发包的真实脚本管理器安装验收。所有调试断点已移除，Debugger 已禁用；临时元素方法修改只属于该次文档，刷新后失效。开发包尚未安装。恢复旧脚本禁用状态时，浏览器安全策略阻止打开扩展管理页面，已告知维护者在安装开发包前保持旧脚本禁用；没有尝试绕过策略。

## 全套检查

- `npm run check`：通过。
- `npm test`：7 个文件、95 个测试通过。
- `npm run build`：通过（完整浏览器套件首先构建并测试该正式格式候选文件）。
- `npm run build:dev`：通过，`0.1.0-dev.1`。
- `npm run test:browser`：16 个套件全部通过，包括新增原生导航回归、独立导出、面板、剪贴板表示、PNG 下载、外观、生命周期、性能、视频荣誉和文案模板。
- `git diff --check`：通过。
- Standards 独立审查：0 项。
- Spec 独立审查：0 项。

完整浏览器套件属于受控 Chromium/GM 网络边界；其中已有真实浏览器剪贴板表示检查，不等于所有接收应用粘贴或真实网络验收。没有执行发布、推送或创建 GitHub PR。

## 本地交付

- 开发包：`dist/bilibili-share-poster.dev.user.js`，版本 `0.1.0-dev.1`。
- 开发包 SHA-256：`ea8def9ecdaffd73d4b77e730cc5d3312b68fa3fb197dd2b17986e04fe27a514`。
- 正式格式候选包 SHA-256：`0fdaf228264bba07b542bd660d8a4608cc1f17edfc33d69c0631f7742c17090e`。
- 正式版本保持 `0.1.0`，未发布新版本；安装开发包时仅启用一个通道。
- 历史清理：移除 5 份已完成阶段的中间调查报告，原始资料以固定基准提交链接保存，规格引用同步更新；原始需求、批准记录、票据和最终验收摘要保留。入口见 `.scratch/ARCHIVE.md`。
