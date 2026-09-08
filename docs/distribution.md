# 发行流程

## 三个位置，各有一个用途

| 位置 | 用途 | 是否面向脚本使用者发行 |
| --- | --- | --- |
| Greasy Fork 脚本页面 | 正式安装、版本更新、用户反馈 | 是，唯一正式入口 |
| GitHub Actions Artifacts | 自动检查与构建，提供候选 `.user.js` 供维护者下载验证 | 否，不是安装首页或自动更新地址 |
| GitHub Release | 标签、更新说明，以及 GitHub 自动提供的源码 ZIP/tar.gz | 否，不上传脚本安装包，不执行构建 |

Tampermonkey 是浏览器中的脚本管理器；Greasy Fork 是脚本托管网站。使用者先安装 Tampermonkey，再到项目的 Greasy Fork 页面点击安装，由管理器确认安装。正式安装页面：[Bilibili 分享海报](https://greasyfork.org/zh-CN/scripts/594826)。源码仓库：[MikuHello/bilibili-share](https://github.com/MikuHello/bilibili-share)。首个已发布版本为 `0.1.0`。

## 已配置的自动构建

`.github/workflows/build.yml` 在 main 推送、面向 main 的 PR 和手动运行时检查并构建。它使用锁定依赖，运行类型检查、行为测试及构建隔离验证，并输出候选用户脚本、SHA-256 和提交号记录。

产物保存为 GitHub Actions artifact，保留14天，维护者可以下载解压使用。工作流不含 `release` 事件，push 仅匹配 main 分支，因此创建 Release 或推送标签不会自动运行构建。工作流没有写仓库或发布权限，不会自动把 main 或 PR 的代码送给脚本用户。

这些检查不取代海报/面板变更所需的完整浏览器验收。具体发布版本必须采用通过验收的提交；首次云端运行已通过：[Build candidate #34173903419](https://github.com/MikuHello/bilibili-share/actions/runs/34173903419)。

## 发布到 Greasy Fork

1. 维护者确定正式版本并完成验收，从相应提交的 Actions 运行下载候选产物，核对版本和提交号。也可对同一提交本地构建。
2. 在 Greasy Fork 登录账户，首次建立脚本页面；后续使用现有脚本页的“更新”，填写变更说明并提交完整、可读的 `.user.js`。按平台规则检查打包依赖和许可证；不要仅上传一个从别处加载主要代码的入口。
3. 确认脚本页面和安装按钮可用，将实际页面 URL 写入 README、本发行文档及 GitHub 仓库 About 信息。通过该页面在真实 Tampermonkey 中检查安装与更新行为。
4. 之后用户只从 Greasy Fork 安装和更新。不要把 Actions artifact 或 GitHub Release 附件写成 `@updateURL` / `@downloadURL`。

Greasy Fork 提供只读 API；代码预填接口仍需要在网页审核并提交。当前没有用脚本模拟一个不存在的公开写入 API，也没有自动发布。

## 分支与更新方式

本地只保留 `main` 分支，完成的修复合并后删除临时分支。Greasy Fork 继续通过现有脚本页面手动更新，不创建发行分支或自动同步配置。

每次发布核对 `@version`、`@license MIT`、作者、源码与反馈入口；许可证正文和第三方声明由构建写入完整脚本。提交后检查脚本页面版本与许可证，并核对平台代码中的修复内容。

## GitHub 源码 Release

维护者可以为相应源码提交创建 `vX.Y.Z` 标签和 Release，填写变更说明并指向 Greasy Fork 安装页。保留 GitHub 自动生成的 Source code (zip)/(tar.gz)，不另外编译、不上传 `.user.js` 或其他构建附件。

`.gitattributes` 将 `dist/` 标记为 `export-ignore`，避免已跟踪的构建文件混入新标签的源码归档。源码仍可自行构建；这不影响 Git clone 或本地 dist 文件，也不改变已有历史标签的归档。

## 参考

- [GitHub Actions artifacts](https://docs.github.com/en/actions/tutorials/store-and-share-data)：工作流产物及保留期限。
- [GitHub 源码归档](https://docs.github.com/en/repositories/working-with-files/using-files/downloading-source-code-archives)：标签和 Release 的源码下载。
- [Greasy Fork 发布代码规则](https://greasyfork.org/en/help/code-rules)：完整脚本、可读代码及依赖要求。
- [Greasy Fork API](https://greasyfork.org/en/help/api)：只读查询与网页代码预填。
