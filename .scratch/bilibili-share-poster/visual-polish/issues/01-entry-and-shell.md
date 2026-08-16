# 01 — 修正入口并建立海报舞台面板骨架

**What to build:** 页面入口成为官方分享按钮同排的 toolbar item；分享面板替换为“海报舞台 + 控制栏”骨架，并加入 A/B 主题分段控件。本 ticket 只改结构与 tokens，不重做选项、动作或文案样式。

**Blocked by:** None

**Status:** ready-for-agent

- [ ] 入口挂载点为 `.toolbar-left-item-wrap` 的兄弟节点，不再插入 `.video-share-wrap` 内部；入口与官方分享图标同排，重复挂载仍幂等。
- [ ] 入口形态为 18px 海报图标 + `生成海报`，A 为白底细边框、B 为深色实心；SPA 导航/DOM 重建后位置与主题保持正确。
- [ ] 面板头部只保留 `BILIBILI SHARE` 眉题与关闭按钮，移除 `BILIBILI · POSTER WORKSPACE` 和 `生成分享海报` 大标题。
- [ ] 宽视口 ≥880px 为 `54% / 46%`：左侧深色中性海报舞台，右侧控制栏；窄视口折叠为舞台在上、控制栏在下。
- [ ] 海报舞台始终使用深色中性背景，A/B 海报均以 `min(100%, 360px)` 居中呈现。
- [ ] 控制栏按 A 暖纸 / B 深色两组 tokens 渲染；新增 `A 报刊` / `B 沉浸` 分段控件，切换只改变 tokens，不重新获取视频信息或 share target。
- [ ] 现有海报生成、短链、快照、关闭/恢复播放逻辑不回归；旧面板中过时的标题文案不保留。
- [ ] 组件文件按 `src/ui/` 拆分（entry、panel、poster stage、tokens），不得继续向单一 `ui.ts` 堆叠。
- [ ] `npm test`、`npm run check`、`npm run build` 通过；真实页面入口位置和宽窄视口 smoke 通过。

## Comments
