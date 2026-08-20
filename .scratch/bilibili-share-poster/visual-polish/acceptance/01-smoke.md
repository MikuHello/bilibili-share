# Ticket 01 真实页面验收

目标：在真实 Bilibili 视频页逐条核对 `01-entry-and-shell.md` 的验收标准。
为什么必须在真实页面：脚本靠 Tampermonkey 的 `GM_xmlhttpRequest` 绕过 CORS 拿视频信息和封面，纯浏览器注入或 Node 都跑不通这条路径。

## 1. 装好验收环境

### 1.1 装用户脚本管理器（二选一，已有可跳过）

- **Chrome / Edge**：[Tampermonkey](https://www.tampermonkey.net/)
- **Safari**：[Userscripts](https://apps.apple.com/app/userscripts/id1463298887)

### 1.2 加载脚本

把本仓库构建产物导入管理器：

```
dist/bilibili-share-poster.user.js
```

两种方式：

- **拖入安装**：浏览器里打开 `dist/bilibili-share-poster.user.js`（`file://` 或用本地静态服务器），管理器会弹「安装」确认。
- **手动粘贴**：管理器「新建脚本」→ 清空模板 → 粘贴整个文件内容 → 保存。**注意保留头部 `// ==UserScript==` 元数据块**，否则 `@grant` 不生效。

确认脚本状态为「启用」。脚本只在 `https://www.bilibili.com/video/BV*` 生效。

### 1.3 打开一个测试视频

随便挑一个标准视频页（普通 BV 视频，非番剧/非充电专属），例如：

```
https://www.bilibili.com/video/BV1GJ411x7h7
```

（换成任意 BV 号即可。）登录态随意，登录与否不影响结构验收。

## 2. 跑验收（粘贴下面这段到 DevTools Console）

打开 DevTools（`⌘⌥I` / `F12`）→ Console，整段粘贴回车。脚本会打开面板、等待海报生成、跑断言，最后打印一张 ✓/✗ 表格。

```js
(async () => {
  const out = [];
  const ok = (name, cond, detail = "") => out.push({ "✓": cond ? "✓" : "✗", 检查项: name, 说明: detail });

  // --- 入口（打开面板前）---
  const entry = document.getElementById("bsp-entry");
  ok("入口存在 (#bsp-entry)", !!entry);
  if (entry) {
    const prev = entry.previousElementSibling;
    const isToolbarSibling = prev && (
      prev.classList.contains("toolbar-left-item-wrap") ||
      /toolbar-left-item-wrap/.test(prev.className)
    );
    ok("入口是 .toolbar-left-item-wrap 的兄弟节点", !!isToolbarSibling,
      `前一个兄弟: ${prev ? prev.className : "无"}`);
    ok("入口不在 .video-share-wrap 内部", !entry.closest(".video-share-wrap"));
    ok("入口文案含「生成海报」", entry.textContent.includes("生成海报"));
    const svg = entry.querySelector("svg");
    const sw = svg ? parseFloat(getComputedStyle(svg).width) : 0;
    ok("入口图标约 18px", svg && Math.abs(sw - 18) < 1, `实测 ${sw}px`);
  }

  // --- 打开面板并等海报生成 ---
  entry?.click();
  const waitFor = (sel, ms = 8000) => new Promise((resolve) => {
    const t0 = Date.now();
    (function check() {
      const el = document.querySelector(sel);
      if (el) return resolve(el);
      if (Date.now() - t0 > ms) return resolve(null);
      setTimeout(check, 150);
    })();
  });
  const frame = await waitFor(".bsp-preview-frame");
  ok("面板打开并生成海报", !!frame, frame ? "" : "8s 内未出现 .bsp-preview-frame（检查网络/GM）");

  const panel = document.querySelector(".bsp-panel");
  const ws = document.querySelector(".bsp-workspace");
  const pane = document.querySelector(".bsp-preview-pane");

  // --- 头部 ---
  const eyebrow = document.querySelector(".bsp-eyebrow");
  ok("头部眉题为 BILIBILI SHARE", eyebrow && eyebrow.textContent.trim() === "BILIBILI SHARE");
  ok("无旧大标题 (.bsp-panel-title 已移除)", !document.querySelector(".bsp-panel-title"));
  ok("无旧眉题 (.bsp-kicker 已移除)", !document.querySelector(".bsp-kicker"));

  // --- 布局（按当前视口分支断言）---
  if (ws) {
    const cols = getComputedStyle(ws).gridTemplateColumns;
    const w = window.innerWidth;
    const expectWide = w >= 880;
    ok(expectWide ? "宽视口 54%/46% 两栏" : "窄视口单列",
      expectWide ? cols === "54% 46%" : cols === "1fr",
      `视口 ${w}px, grid-template-columns: ${cols}`);
  }
  if (pane) {
    const bg = getComputedStyle(pane).backgroundColor;
    ok("海报舞台深色中性背景 #232629", bg === "rgb(35, 38, 41)", `实测 ${bg}`);
  }

  // --- A/B 主题分段 + tokens ---
  const segBtn = (txt) => Array.from(document.querySelectorAll(".bsp-theme-option"))
    .find((b) => b.textContent.includes(txt));
  ok("存在 A 报刊 / B 沉浸 分段控件", !!segBtn("A 报刊") && !!segBtn("B 沉浸"));

  if (segBtn("B 沉浸")) {
    segBtn("B 沉浸").click();
    await new Promise((r) => setTimeout(r, 300)); // crossfade
    ok("切到 B：面板加 .bsp-theme-b", panel?.classList.contains("bsp-theme-b"));
    ok("切到 B：入口加 .bsp-entry-b", document.getElementById("bsp-entry")?.classList.contains("bsp-entry-b"));

    segBtn("A 报刊").click();
    await new Promise((r) => setTimeout(r, 300));
    ok("切回 A：主题类同步移除", !panel?.classList.contains("bsp-theme-b") &&
      !document.getElementById("bsp-entry")?.classList.contains("bsp-entry-b"));
  }

  // --- 关闭面板 ---
  document.querySelector(".bsp-close")?.click();

  console.table(out);
  const passed = out.filter((r) => r["✓"] === "✓").length;
  console.log(`%c${passed}/${out.length} 项通过`, passed === out.length ? "color:#3d6b47;font-weight:bold" : "color:#a3452f;font-weight:bold");
  return out;
})();
```

### 2.1 同时覆盖窄视口分支

上面那段按**当前视口宽度**只断言一个分支。窄视口需手动切：

1. DevTools → 点工具栏「设备切换」图标（`⌘⇧M`）→ 选 Responsive。
2. 把宽度拉到 **< 880px**。
3. 刷新页面，重新粘贴跑一遍。此时「窄视口单列」一行应 ✓，且面板整体可滚动、底部动作可达。

## 3. 验收通过的标准

- 全部项目一次跑完均为 ✓（宽、窄各跑一次）。
- 视觉上：入口与官方分享按钮同排无错位；主题切换是淡入淡出而非跳动；封面缺失的视频也能正常生成海报（只显示 `COVER UNAVAILABLE` 占位）。

## 4. 不通过怎么办

- **面板没出现 / 卡在「正在建立稳定快照」**：Console 看报错；多半是 `GM_xmlhttpRequest` 未授权（确认脚本头 `@grant` 没被改掉）或 `@connect api.bilibili.com` 缺失。
- **入口位置不对**：把入口前一个兄弟的 className（脚本会打印在「说明」列）发出来，我看是否命中了旧版页面回退分支。
- 把不通过的输出贴回来，我来修。

## 备注

- 这份验收对应 ticket 01「结构与 tokens」范围。动作区 4 按钮、文案卡角标复制（ticket 03）、motion 时长集中（ticket 04）尚未实现，不属本验收。
- 后续每个 ticket 完成后，可在此目录新增对应的 `0X-smoke.md`。
