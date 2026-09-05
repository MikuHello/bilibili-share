# Runtime discovery follow-up

Date: 2026-09-05
Status: 封面故障层已锁定；修复未实施、未验证。主题 CSS 模拟已验证；真实设置切换未验证。

已读取最新 discovery frontier；Q1–Q8 已确认。沿用上一轮真实缺封面反馈，继续 diagnosing-bugs 事实采集。本轮不修改生产、不安装脚本、不改变持久设置、不操作本地原型。

## 封面：管理器 @connect 许可拒绝已有直接证据

新建 Edge 调查页 `https://www.bilibili.com/video/BV1TXoWBsEGc/`，读取当前实装 userscript 源码，并在已定位边界添加 **condition 最后返回 false 的临时 logpoint**，不暂停页面。

两次点击现有“生成海报”均得到相同证据链：

```text
04:56:14.109Z [DEBUG-bsp-followup] gm-start function https://i1.hdslb.com/bfs/archive/a48a609105359d30b0f7c53e12c6fee560f81507.jpg
04:56:14.110Z injected: Refused to connect to "https://i1.hdslb.com/bfs/archive/a48a609105359d30b0f7c53e12c6fee560f81507.jpg": This domain is not a part of the @connect list
04:56:14.112Z [DEBUG-bsp-followup] gm-error
04:56:14.114Z [DEBUG-bsp-followup] cover-catch

04:56:57.093Z [DEBUG-bsp-followup] gm-start function [同一公开封面 URL]
04:56:57.094Z injected: Refused to connect to [同一公开封面 URL]: This domain is not a part of the @connect list
04:56:57.096Z [DEBUG-bsp-followup] gm-error
04:56:57.096Z [DEBUG-bsp-followup] cover-catch
```

两次最后的真实 dialog 都包含 `COVER UNAVAILABLE`。拒绝信息来自管理器 `chrome-extension://fcmfnpggmnlmfebfghbfnillijihnkoh/content.js`，不是本产品合并后的泛化错误。

**已锁定**：本次封面获取在 GM 的域名许可层被拒绝；onerror 被调用后 loadCover catch 降级。GM_xmlhttpRequest 在调用处实际为 function，因此本次不是函数名缺失或闭包不存在。不是依据“onload 未命中”猜测根因。此链路没有走到 Blob/FileReader/decode，不应再把这几层列为此次直接失败点。

**未完成**：更正许可声明后的真实请求、解码与海报恢复尚未测试；仍不能声明封面修复完成或排除放行后还存在第二个故障。

## 实装声明与本地构建声明一致

实装 metadata `@version 0.1.0`，实际连接声明为：

```text
// @connect      api.bilibili.com
// @connect      b23.tv
// @connect      *.hdslb.com
```

本地 `scripts/build.mjs:17–19` 和 `dist/bilibili-share-poster.user.js` 同样使用这些声明；`gmBlobRequest` 与 `loadCover` 的相关正文也一致。没有证明整个实装 bundle 与某 Git 提交逐字相同；管理器注入 wrapper 包含每次不同的临时函数名，不应把整个 CDP script hash 跨导航变化当作产品版本变化。

[Tampermonkey 官方 @connect 文档](https://www.tampermonkey.net/documentation.php?locale=en&q=connect) 说明普通域名声明会包含其子域名；因此文档支持的域名范围表达是 `hdslb.com`。官方列出的取值还包括精确子域、self、localhost、IP 和单独的 `*`，没有将 `*.hdslb.com` 列作域名通配表达。

**有证据的最小修复候选**：后续经授权的实现阶段，更正构建头为文档支持的 `hdslb.com`，用真实安装包重跑上述反馈并验证 HTTP/Blob/decode/海报。当前没有执行该修改，也没有扩大为任意域名许可，没有修改管理器用户白名单。

## 复现方法（本轮已运行）

CDP 从当前 tab 的 `Debugger.scriptParsed` 找到 `name=Bilibili-` 的实际脚本，`getScriptSource` 读源码。以下行为断点行号为该源码的零基行号：

```js
await cd.send('Debugger.setBreakpoint', {
  location: {scriptId, lineNumber:2260},
  condition: 'console.log("[DEBUG-bsp-followup] gm-start", typeof GM_xmlhttpRequest, url), false'
});
await cd.send('Debugger.setBreakpoint', {
  location: {scriptId, lineNumber:2275},
  condition: 'console.log("[DEBUG-bsp-followup] gm-error"), false'
});
await cd.send('Debugger.setBreakpoint', {
  location: {scriptId, lineNumber:2381},
  condition: 'console.log("[DEBUG-bsp-followup] cover-catch"), false'
});
await bt.playwright.getByRole('button', {name:'生成海报', exact:true}).click();
// 生成完成后分别读 exact dialog 和必要日志：
await bt.playwright.getByRole('dialog').textContent();
await bt.dev.logs({filter:'[DEBUG-bsp-followup]', limit:12});
await bt.dev.logs({filter:'This domain is not a part', limit:3});
```

另外设有 onload、timeout、Blob 和 decode 后边界 logpoint，本轮没有相应命中日志。第二次操作前关闭上次面板。不要在另一版本盲用这些行号。

## 主题：真实页面 CSS、内存态模拟

未点击 BewlyCat 主题 UI。仅在代理新建调查标签里临时给 html/body/#bewly 添加 `.dark`，同步读取计算样式，再按保存的原始布尔值移除；使用 try/finally 恢复，随即关闭调查标签。没有发送 `global.themeChange`、读写 Cookie 或扩展存储。

| 信号 | 原始浅色 | 临时 .dark 模拟 | 恢复后 |
|---|---|---|---|
| html/body dark | false/false | true/true | false/false |
| body --bg3 | #f1f2f3 | color-mix(in oklab, #2a2d32, white 5%) | #f1f2f3 |
| body --text2 | #61666d | hsl(220 13% 85% / 90%) | #61666d |
| body background | rgb(241, 242, 243) | oklab(0.236945 -0.00128311 -0.00790365) | rgb(241, 242, 243) |
| 现有脚本入口 background | rgb(24, 25, 28) | rgb(24, 25, 28) | rgb(24, 25, 28) |

**已验证**：当前真实页面已加载的样式确实响应这些 class，暗色变量格式不是只限 hex/rgb；现有入口没有因该切换改变底色。

**准确限制**：这是内存态 CSS 模拟，不是用户真实设置切换，不能证明安装版 BewlyCat 的事件发射、时序、初始化或 userscript 接收事件。也没有实现新面板，因此不宣称新面板已跟随主题。后续规格应把初始 DOM 识别、class 变化、事件提示、信号失效/保持上次模式分别验证；实际设置切换仍须在可安全恢复的验收环节补证。

## 清理与下一边界

所有临时 logpoint 均逐个 removeBreakpoint，随后 Debugger.disable。未用 pause-on-exceptions；没有造成暂停。CSS 已恢复值有直接输出，调查标签已关闭。仅新增此报告。

本轮证据可以支持新 spec 表达封面成功链路、管理器许可和失败反馈，而不要求主人猜技术原因。不可恢复封面失败的产品呈现仍应在 discovery/新设计里确认；旧 A/B 的 COVER UNAVAILABLE 不能自动继承为 v5 批准设计。短链 mismatch 没有新增复现证据，仍按独立问题处理。

## 真实设置切换补查：原模式无法精确确认，未改变设置

在新的 Edge 调查页，从实际 DOM 找到 BewlyCat 的 `button[data-layout-edit-target="sidebar-settings"]`，点击一次后读取 DOM、截图并检查当前浏览器标签。没有出现外观设置面板或独立设置标签；截图仍是视频页和右侧收缩的控制按钮。现有可见提示只有“亮色模式”。

这一提示无法区分显式 light、当前有效为 light 的 auto/scheduled，也不能确认视频专用暗色设置。因此没有点击主题切换按钮，没有依赖系统偏好推断原模式，没有读写 Cookie 或扩展存储。已关闭本次新建调查页。真实设置切换仍缺“可精确读取并恢复原模式的设置 UI”；之前 CSS 内存模拟不得升级表述为真实设置切换成功。
