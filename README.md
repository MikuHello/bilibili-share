<h1 align="center">Bilibili 分享海报</h1>

<p align="center">在 Bilibili 视频页生成分享海报，支持复制图片、普通文案和 Markdown。</p>

<p align="center">
  <a href="https://greasyfork.org/zh-CN/scripts/594826">安装脚本</a>
  ·
  <a href="https://github.com/MikuHello/bilibili-share/issues">反馈问题</a>
</p>

> [!IMPORTANT]
> **使用 GPT-6-Astra 完成的一个玩具项目**

## 运行展示

<p align="center">
  <a href="docs/images/share-panel-light.png"><img src="docs/images/share-panel-light.png" width="920" alt="浅色分享面板：左侧预览海报，右侧选择分享选项、查看简洁文案并复制或下载"></a>
  <br>
  <sub>浅色模式 · 简洁文案</sub>
</p>

<br>

<p align="center">
  <a href="docs/images/share-panel-dark.png"><img src="docs/images/share-panel-dark.png" width="920" alt="深色分享面板：开启详细信息后，文案包含 UP 主、统计数据、荣誉和视频编号"></a>
  <br>
  <sub>深色模式 · 详细文案</sub>
</p>

## 功能

- 使用视频封面、标题、UP 主和统计信息生成海报。
- 复制海报，或下载为 **1080 × 1440 PNG**。
- 分享链接与二维码可包含当前分 P、播放时间。
- 单独复制普通文案或 Markdown，可选择是否包含详细信息。
- 分享面板跟随页面明暗模式。

## 安装与使用

1. 安装并启用 **Tampermonkey** 等用户脚本管理器。
2. 前往 [Greasy Fork](https://greasyfork.org/zh-CN/scripts/594826) 安装脚本。
3. 打开 Bilibili 视频页，点击官方分享控件附近的 **「分享海报」**。
4. 调整分享选项，复制图片、下载海报或复制文案。

<p align="center">
  <a href="docs/images/share-entry.png"><img src="docs/images/share-entry.png" width="920" alt="视频操作栏中的分享海报入口，位于官方分享按钮右侧"></a>
</p>

正式安装与更新统一通过 Greasy Fork。

## 使用范围

目前支持标准 BV 视频页，暂不支持番剧、直播等页面。

文案模板可以在开发配置中修改，暂时没有图形化编辑界面。Bilibili 页面改版后，脚本可能需要跟着调整。

## 本地开发

使用 TypeScript、原生 DOM/CSS 和 esbuild。

```bash
git clone https://github.com/MikuHello/bilibili-share.git
cd bilibili-share
npm ci

# 类型检查与测试
npm run check
npm test

# 正式构建
npm run build

# 开发构建，包含调试功能
npm run build:dev
```

构建产物位于 `dist/`。正式脚本与开发脚本使用不同名称，调试时只启用其中一个，避免重复出现入口。

详细说明见 [开发规范](docs/development.md) 和 [发行流程](docs/distribution.md)。

## 反馈与贡献

遇到问题欢迎提 [Issue](https://github.com/MikuHello/bilibili-share/issues)。请附上视频链接、浏览器和脚本管理器版本，以及复现步骤；界面问题最好带一张截图，方便咱排查。

想参与修改，可以先看 [贡献指南](CONTRIBUTING.md)。

## 许可证

本项目代码采用 [MIT](LICENSE) 许可证；第三方依赖见 [许可证声明](THIRD_PARTY_NOTICES.md)，截图中的第三方内容权利归原权利人所有。

---

顺便推荐一个 Bilibili 扩展：[BewlyCat](https://github.com/keleus/BewlyCat)，感兴趣可以看看。（开发全程使用了该扩展。）
