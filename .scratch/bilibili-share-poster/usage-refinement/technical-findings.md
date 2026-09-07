# 技术调查与验证边界

日期：2026-09-07。范围：候选 delivery 工作树 `d3fd199`、`package.json` 版本 0.2.0。未确认它与实际安装脚本完全一致。本文是 discovery 证据，不是已批准实现规格；没有修改生产代码，没有操作真实剪贴板。

## 通用图文剪贴板

用户边界：只采用通用 Web 剪贴板能力，不按 Windows、macOS、QQ 或笔记应用编写特例。实际接收端可用于观察；难以可靠达到目标则可舍弃组合复制。

现状证据：`/Users/mikuhello/project/dev/bilibili-share-delivery/src/clipboard.ts` 的 `copyCombinedPosterAndText` 已经把 `image/png`、`text/plain`、包含 data URL 图片与文案的 `text/html` 放入同一个 ClipboardItem。`describeCombinedCopyResult` 已声明接收方可能只取其中一种。写入失败会额外尝试纯文本回退。因此当前问题不能简单归因为“尚未提供 HTML”，也不能把再次实现同样格式称为修复。

[W3C Clipboard API 模型](https://www.w3.org/TR/clipboard-apis/#model) 定义一个剪贴板项可有多个表示；[ClipboardItem](https://www.w3.org/TR/clipboard-apis/#clipboarditem) 暴露这些格式；[write 算法](https://www.w3.org/TR/clipboard-apis/#dom-clipboard-write) 描述写入。推论：写入多个表示并不等同于要求接收方把所有表示拼接成两段内容。HTML 本身可以包含图片与文字，但能否保留嵌入图片取决于实际接收过程。这些标准不构成 QQ 兼容性证明。该标准当前为工作草案。

独立探针：`clipboard-probe.html`。只在真实按钮点击事件中写入一个多格式项；PNG 来自预生成的合成 canvas，没有外部资源。无主动剪贴板读取，无自动写入，无软件检测，无专用适配。手动粘贴区不拦截或改造粘贴，仅读取该用户粘贴事件的格式名称并观察随后 DOM 中是否出现图文。原生图片数是辅助观察，不是通用接收端断言。

探针当前状态：已创建并通过 JavaScript 语法检查。隔离 headless 浏览器中用 mock writer 替换 navigator.clipboard 后点击按钮，确认初始写入次数为 0、点击后为 1、包含三个 MIME 类型且 HTML 内含 PNG 和独立文案（[验证记录](evidence/clipboard-probe-check.json)）。未写入真实系统剪贴板，未验证实际粘贴或 QQ。可通过 localhost/HTTPS 打开，手动点击复制后粘贴。对照记录应分别填写“API 是否接受写入”“粘贴后是否有图片”“是否有独立文字”。

建议：此时不能声称已修复，也没有充分证据断言所有标准方案不可用。保留为短期验证项；若同一标准路线仍不能达成预期，则依据用户授权移除组合入口，不扩展成平台适配项目。独立复制图片、文案与下载继续存在。

## 性能与模块职责：源码发现，不是计时结果

以下源码路径以 `/Users/mikuhello/project/dev/bilibili-share-delivery/` 为根。

| 证据 | 判断与下一步 |
| --- | --- |
| `src/bilibili.ts:268` 先请求视频元数据，再载入封面；`:331` 随后获取分享目标 | 初次生成存在串行资源依赖。实际网络与解码耗时尚未测量。 |
| `src/bilibili.ts:296` 短链 POST 后继续解析跳转；`src/ui/panel.ts:400` 标记变化再次调用 | 移除短链能明确删除这两段网络等待，但不能声称解决所有卡顿。 |
| `src/ui/panel.ts:376` applyOptions 与 `:400` rebuildPosterForOptions 管理状态、网络、海报重建、覆盖层和控件禁用；`:419` 等待 motion overlay（常规 140ms）才继续 renderReady | 这是明确的交互等待路径。应区分内容完成与动画结束，避免动画阻塞控件；保留旧上下文失效保护。 |
| `src/ui/posters.ts:70` 每次重建完整海报；`:103` 附近重新生成二维码，末尾重新 fitContent | 可评估保持控件和静态海报部分稳定、仅更新目标/二维码。需要先确认标记是否还改变可见文本。 |
| `src/ui/panel.ts:458` posterPngDataUrl 直接调用 exportPosterPng；`src/ui/posters.ts:121` 以 html-to-image 输出 1080×1440 PNG | 重复导出没有此处可见的 PNG 结果缓存。候选优化为按海报版本复用 Promise/结果，明确字体、图片、主题、选项变化时失效；失败结果不永久缓存。 |
| `src/ui/panel.ts:465` 导出期间冻结控件并检查上下文 | 当前有防止状态错配的保护；优化须保留，不能以“更快”为由导出旧画面。 |
| `package.json`：TypeScript + 原生 DOM + html-to-image + qrcode，esbuild 构建 | 尚无证据要求换框架。首先减去短链依赖并缩小更新范围；换 Canvas/SVG 引擎需额外验证字体、文本排版和导出一致性收益。 |

建议的局部职责边界：同步的分享目标/文案推导；封面派生颜色（按封面缓存）；海报呈现与测量；按版本导出；面板交互与临时反馈。先看现有函数能否承担这些边界，目录重排本身不算收益。页面深浅模式 token 与封面衍生海报 palette 分开管理，海报导出必须使用与预览相同的显式颜色及字体。

已完成隔离 headless 的实际 delivery 渲染基线（[条件与结果](evidence/render-baseline.md)、[原始记录](evidence/render-baseline.json)）：首轮 createPoster 39.5ms、PNG 75.2ms；后续 createPoster 3.4–4.9ms、PNG 46.7–48.9ms。该样本不包含实际网络、宿主页面竞争或真实安装脚本，不能代表用户总等待或 p95。下一步仍需测视频 API、封面读取/解码和短链链路，并观察标记切换的布局与控件冻结。取消短链后再对照，决定是否需要更深重构。
