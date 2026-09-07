# 候选版本本地渲染基线

Status: measured isolated baseline; not real-page performance diagnosis

2026-09-07，使用delivery工作树fb79f0c的实际createPoster/exportPosterPng，esbuild临时内存打包，在独立headless Chromium中测量1080×1440样例。本地封面，不请求网络、不连接管理器、不操作剪贴板。可重复命令：`node .scratch/bilibili-share-poster/usage-refinement/evidence/measure.mjs`。

- 首次海报创建39.5ms，首次PNG导出75.2ms。
- 后续5次目标参数变化，创建3.4–4.9ms，导出46.7–48.9ms。
- 原始数据及浏览器版本见render-baseline.json。

这说明当前机器的隔离样例中，热态海报创建本身不是秒级耗时；不能据此排除真实页面竞争、网络、复杂封面/字体和管理器影响。候选代码另外固定等待140ms，并经过短链生成/解析网络流程；真实总延迟未测，不编造网络耗时。

优先调查顺序：移除已要求删除的短链网络依赖；拆开控件更新与海报更新；移除人为串行等待；以快照和目标版本复用封面/排版/PNG并定义失效；再测同样例和真实页面。以上是候选方案，非已批准架构。无证据要求整体换框架。
