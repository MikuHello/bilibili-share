# 01 — README 与运行截图

Status: done
Blocked by: none
Baseline: 53f3e7d8da1816533019bb80fa0a95d5abe3399e

## Request and acceptance

- 主人已要求补写 README，取代首版仓库暂不放 README 的历史选择。
- 沿用当前审阅草稿：直接介绍功能，避免空泛比喻和项目故事。
- 显著保留「使用 GPT-6-Astra 完成的一个玩具项目」。
- BewlyCat 只在文末顺带推荐，加括号「开发全程使用了该扩展」。该信息由主人提供。
- 前两张截图按分享面板边缘精准裁剪；第三张入口截图尽量原样展示。
- 展示区大图纵排、同宽、简短居中图注，适配 GitHub README，点击可查看完整图片。
- 保留安装、开发、反馈、许可证说明；不修改产品代码。

## Assets

- share-panel-light.png：原图 2042 × 1376；裁剪框 x=122, y=69, width=1840, height=1218。
- share-panel-dark.png：原图 1924 × 1278；裁剪框 x=40, y=25, width=1840, height=1218。
- share-entry.png：原图 1094 × 146，直接复制，不裁剪、不改图。
- 面板截图按主人指定的裁剪操作处理，保留原像素，不缩放、不重绘文字或二维码。

## Validation

- README 9 处本地图片/文档引用均存在，git diff --cached --check 通过。
- Pillow 对比两张面板图与原图指定区域，RGBA 每个通道逐像素一致。
- 第三张入口图与原文件逐字节一致。
- 使用本地 Markdown 渲染与近似 GitHub 的样式进行 Chrome 排版预览；1120px 桌面三张图均正常加载，面板显示为 920 × 609；390px 窄屏显示宽度 350px，页面 scrollWidth=390，无横向溢出。这是本地排版验证，不宣称已验证线上 GitHub 页面；GitHub 专用 IMPORTANT 提示在近似预览中未特殊渲染。
- Standards 独立审查：0 项；Spec 独立审查：0 项。
- 纯文档与截图变更，未重跑产品测试。此轮保存并本地提交，供主人审阅。
