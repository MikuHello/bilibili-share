# 项目命名与分享生成扩展能力

Status: IMPLEMENTED — 0.4.0 batch complete

## 主人提出的需求

- 检查 GitHub API 是否可访问。
- 讨论项目定名：当前 bilibili-share，候选 bilibili-share-post。
- 说明当前源码技术栈与二次开发结构。
- 分享文案希望支持默认格式与带变量的自定义格式；第一阶段可以没有 GUI，但底层按未来可配置的逻辑组织。
- 检查海报生成的模块化程度，使后续扩展更方便。
- 按 Matt skills 流程推进。

## 本轮核实的事实

- 2026-09-08：GET https://api.github.com/ 返回 HTTP 200；gh api user 成功返回登录名 MikuHello。
- gh api repos/mikuhello/bilibili-share 返回 HTTP 404；不能据此断定仓库不存在，也可能是当前身份无读取权限。该路径来自 scripts/build.mjs 的 userscript namespace。
- 本地 git remote -v 无输出。未验证仓库写权限，也未创建或修改远端资源。
- package.json 名称为 bilibili-share-poster，版本 0.3.5；README 标题为 Bilibili Share，构建产物名为 bilibili-share-poster.user.js。
- TypeScript、原生 DOM/CSS、Tampermonkey GM 接口；esbuild 打包浏览器 IIFE；html-to-image 导出 PNG；qrcode 生成二维码；Vitest 与独立浏览器验证脚本。
- src/share-text.ts 已提供 buildShareText，支持普通/Markdown 与简洁/详细组合，但文本格式和条件逻辑硬编码，未提供变量模板或自定义配置入口。
- src/options.ts 有分P、时间、详细信息等选项及详细信息偏好恢复，不是文案模板配置。
- src/ui/panel.ts:276-285 会拆分生成文本并把最后一行当链接；自定义模板允许链接改变位置时必须消除该隐含约束，不能仅替换 share-text.ts 内部字符串。
- src/ui/posters.ts 已提供 createPoster/updatePosterTarget/exportPosterPng；布局、测量、封面处理、二维码更新和导出缓存仍集中在该文件；src/ui/panel.ts 直接调用具体实现。
- src/domain.ts 的 SharePoster 含固定尺寸与格式化统计信息，未来多布局是否需要调整由本轮范围决定。

## 已确认的方向

- 主人认可本轮整体需求：保留默认体验、文案模板化与变量能力、海报职责整理、GUI 后补。
- 项目名确定为 bilibili-share。
- 首期先面向开发者，把模板做成可复用模块；无 GUI。
- 海报采用首期建议范围：整理现有默认海报职责，保持视觉一致，不新增第二套布局。
- 第二轮第一项已确认：首期采用 {{变量名}}，覆盖标题、UP主、链接、BV/AV、统计、荣誉、分P与时间；支持“有值才显示整段”的简单条件块。
- 主人经通俗说明后确认：普通文案与 Markdown 都模板化，模板分别配置，共用视频数据与变量生成能力。
- 已解释并获认可的配套规则：保留普通/Markdown 各自简洁/详细预设；Markdown 变量自动转义；正常缺失沿用默认规则；模板错误向开发者明确报告，面板回退内置文案。主人不需要逐项研究底层实现细节。

## 实现建议，细节尚待收敛

- 展示名、package 名、产物名、userscript namespace 和持久化键的实际调整范围需区别处理，避免因统一名称破坏安装身份或偏好兼容。
- 优先让现有文案真正通过“生成上下文 + 模板配置 → 文本”的接口生成，默认格式成为内置预设；未来 GUI 只负责编辑配置。
- 第一阶段优先源码内集中配置并重新构建，无 GUI；未来配置界面复用同一模板模块。
- 海报按数据准备、默认布局、预览/导出职责改善模块；不预设通用插件系统或新渲染引擎。
- 建议现有默认文案、海报视觉、统一分享目标和导出行为保持兼容；新增视觉设计另走设计流程。

## 需求收敛结果

1. 模板方向与配套规则已达成共同理解，进入 to-spec；条件语法和空值语义由规格明确，作为工程默认方案供整体验收。
2. 项目名使用 bilibili-share；本期不额外迁移已有安装身份、产物路径或偏好键，避免扩展任务夹带不必要的改名迁移。
3. 本期沿用已有技术栈；目录关系已解释，删除 worktree 不包含在本次模板规格内。

## 目录核查与框架建议（2026-09-08）

- 三个目录共享主目录内的 .git；delivery 和 refinement 是已注册的 linked worktree。
- bilibili-share：main，6f5eca4；含本轮未跟踪需求草案。
- bilibili-share-delivery：detached HEAD d3fd199；main 比它多 56 个提交，它没有 main 未包含的提交；无未提交/未跟踪文件，忽略项仅 node_modules/。
- bilibili-share-refinement：detached HEAD 6f5eca4，与 main 同提交；无未提交/未跟踪文件，忽略项仅 node_modules。
- delivery 对应旧版整批交付隔离目录，refinement 对应后续打磨目录。历史开发隔离有用途，交付后工作树未收尾造成目录堆积。
- 从版本数据看，可只保留主目录，另两个工作树没有独有源码需要合并。移除前仍应结束引用它们的任务/进程，用 git worktree remove 管理，不直接在 Finder 删除；本轮尚未删除目录。
- 框架建议：本期保留原生 DOM/CSS，先把模板/生成逻辑与面板解耦。若未来有复杂模板编辑器、多设置页或大量联动表单，再评估局部引入框架。此建议不等于主人已批准技术栈变更。

## 后续流程

按 grill-with-docs 收敛决策；确有视觉或运行问题才使用 handoff/prototype。主人确认已达成共同理解后生成 spec；规格与拆票获批后发布 tickets；每个已批准 ticket 使用 fresh implement 上下文、TDD 与 code-review。

本文件只记录探索，不授权实现，不恢复历史父工单。
