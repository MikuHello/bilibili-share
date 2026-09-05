# 站点外观信号独立调查

Date: 2026-09-05
Status: SOURCE VERIFIED；真实浏览器浅深切换未实测；不构成产品回退决策或实现授权。

## 调查边界

只读本地生产源码、既有 investigation.md / approval.md，以及 Bilibili 官方公开视频 HTML/CSS、BewlyCat 官方仓库源码。未打开或操作真实浏览器，未读取 Cookie/扩展存储，未改变设置，未修改生产代码。v5 海报定稿不重新设计。本文件的源码结论不能替代已安装扩展版本与运行行为的验证。

## Bilibili 原生变量来源已核实

直接 HTTP 获取 [原调查视频](https://www.bilibili.com/video/BV1TXoWBsEGc/) 的公开 HTML，当前返回文档引用：

- [map.css](https://s1.hdslb.com/bfs/seed/jinkela/short/bili-theme/map.css)
- [light_u.css](https://s1.hdslb.com/bfs/seed/jinkela/short/bili-theme/light_u.css)
- [light.css](https://s1.hdslb.com/bfs/seed/jinkela/short/bili-theme/light.css)，对应 link 元素 ID 为 `__css-map__`。

这些资源注释标明 `@bilibili/bili-theme(v12.0.0)`；map.css 在 `:root` 定义 `--bg3:var(--Ga1)`、`--text2:var(--Ga7)`、`--graph_icon:var(--Ga7)`；light.css 在 `:root` 定义 `--Ga1:#F1F2F3`、`--Ga7:#61666D`。这与前轮浅色现场读取一致，证明这三个变量在原生资源中存在，**不能证明当前页面层叠后的实际值只来自 B 站**。

下载后的解压正文 SHA-256：

| 资源 | SHA-256 |
|---|---|
| map.css | `69fc627e9d19ad3b014ca285f82e40b01c45aa30968e9d964ff1fe3ef2e4797f` |
| light_u.css | `204ad7cac0c62a9a8e9d89459c5125cc09d755228b96d9a2e52ab565321e4c93` |
| light.css | `efcaa29f5911a9323448b2492b856bfb2333eda9f874037ec0efe5d68e3e09cf` |

这是当前公开响应的源码证据，没有找到或验证 B 站对外承诺的稳定主题 API，也未从此响应核实无扩展时的原生主题切换机制。

## BewlyCat 官方源码已核实

仓库：[keleus/BewlyCat](https://github.com/keleus/BewlyCat)。本轮 shallow clone 固定提交 `90ac6d826020b25782e6e6568424d1181201b0c9`；不是已安装扩展版本证明。

1. [useDark.ts L88–126](https://github.com/keleus/BewlyCat/blob/90ac6d826020b25782e6e6568424d1181201b0c9/src/composables/useDark.ts#L88) 计算有效外观：显式 light/dark、按时间 scheduled、auto 跟系统；视频页专用深色可覆盖为暗色。它将有效主题写入 `theme_style` Cookie，并在有效主题变化时向 window 派发 `global.themeChange`，detail 是 `light` 或 `dark`。本调查没有读取该 Cookie。
2. [useDark.ts L163–206](https://github.com/keleus/BewlyCat/blob/90ac6d826020b25782e6e6568424d1181201b0c9/src/composables/useDark.ts#L163) 对视频页一般路径，暗色给 `#bewly`、html、body 添加 `.dark`，浅色移除。`html.bili_dark` 虽先添加，但在全局主题为 dark 时随后删除。因此 **只检测 `.bili_dark` 会遗漏该源码下的一种实际暗色状态**。节日页存在仅插件容器应用暗色的例外，不能无条件外推全站。
3. [Appearance.vue L96–113、203–223](https://github.com/keleus/BewlyCat/blob/90ac6d826020b25782e6e6568424d1181201b0c9/src/components/Settings/Appearance/Appearance.vue#L96) 设置 UI 确实有 light/dark/auto/scheduled 及视频页专用暗色。顶栏 toggleDark 并非简单固定二态：与系统状态比较后可写 auto。只看系统偏好无法反推实际页面外观。
4. [useDark.ts L144–156](https://github.com/keleus/BewlyCat/blob/90ac6d826020b25782e6e6568424d1181201b0c9/src/composables/useDark.ts#L144) 自定义暗色基准变化会更新 html inline `--bew-dark-base-color`，派发 `darkModeBaseColorChange`。所以 class 不变时，实际色值仍能变化。
5. [variables.scss L525–552](https://github.com/keleus/BewlyCat/blob/90ac6d826020b25782e6e6568424d1181201b0c9/src/styles/variables.scss#L525) 在 `:root.dark.bewly-design` 及其后代覆盖三个变量：bg3 来自 `--bew-content-alt-solid`，text2 来自 `--bew-text-2`，graph_icon 来自基于 `--bew-content-solid` 的 color-mix；不是固定暗色十六进制值。基准色可由设置改变。
6. [necessarySettingsWatchers.ts L429–449](https://github.com/keleus/BewlyCat/blob/90ac6d826020b25782e6e6568424d1181201b0c9/src/contentScripts/views/necessarySettingsWatchers.ts#L429) 根据页面适配与视频页专用暗色设置切换 `.bewly-design` / `.bewly-video-dark-only`。所以 `.bewly-design` 单独不能表示暗色；CSS 覆盖是否启用也依赖这类标记。

## 本地产品现状

`src/ui/tokens.ts` 的 `selectThemeSurfaceClasses(PosterTheme)` 仍将 A/B 海报选项映射为入口和面板外观；`src/ui/panel.ts:391` 同步这些类到面板、遮罩和入口；`src/ui/entry.ts:38` 与 `:76` 使用同一映射。`src/ui/styles.ts:106` 起有 B 面板硬编码暗色。搜索未找到当前产品用于跟随 B 站主题的 `prefers-color-scheme` 或上述站点变量适配。

因此，现有“海报主题”与“站点界面浅深色”共用一个输入；已批准的新海报定稿不能自动证明界面外观边界已确定。这是后续 spec 需要表达清楚的现有耦合事实，不是本轮授权实现变更。

## 可监听候选与待实测事项

源码支持把 html/body class、html style，以及 `global.themeChange` / `darkModeBaseColorChange` 作为**候选刷新提示**；CSS 变量可作为当前最终颜色的候选输入。事件来自扩展实现，既可能早于本脚本安装监听，也未确认当前安装版本支持，不能将其当唯一初始化来源或稳定契约。只监听 class 也覆盖不了基准色变化。

还需要真实环境验证：

- 已安装 BewlyCat 精确版本与上述提交是否对应；暗色→浅色→恢复原设置时的 html/body class、变量和最终计算样式。
- 用户脚本实际隔离上下文能否收到上述 window 事件，事件和 DOM/样式生效的先后；面板已打开、入口已挂载时能否同步。
- 页面适配关闭、仅视频页暗色以及 SPA 导航的边界；无 BewlyCat 的原生页面是否存在可用深色入口及其信号。
- 变量缺失、透明底色、其他扩展改色或 class 与最终颜色冲突时的表现。

## 对剩余产品决策的影响（未替主人决策）

- “跟随 B 站实际外观”技术上需要允许 BewlyCat 改写后的页面实际外观，还是仅支持某个来源，仍是支持范围问题。当前证据不足以承诺任意扩展兼容。
- 缺失或冲突信号时选固定浅色、保持最后已知值，或其他回退，是产品行为；本调查没有证据替主人选定。系统偏好并不能保证符合当前显式站点设置。
- 同一浅/深模式下基准色仍可变化；“跟随浅深模式”与“逐色继承站点变量”是两种不同承诺，应在共同理解中区分，避免无意改变已批准海报的独立雾蓝配色。
- v5 导出海报保持批准的视觉基线；入口/面板如何适配及何时更新，仍属于开放 discovery。未进入 to-spec 或旧工单。
