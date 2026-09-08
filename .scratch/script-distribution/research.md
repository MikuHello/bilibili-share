# 脚本分发调研

核查日期：2026-09-08。只使用 Greasy Fork、GitHub 官方文档及 Greasy Fork 官方源码。当前结论用于分发方案，不代表已配置账号、Webhook 或执行发布。

## 已核实的边界

- Greasy Fork 的 JSON API 是只读接口；官方明确没有更新 API。prefill 接口只是预填提交表单，仍需登录会话及用户检查、提交。不能设计一个假想的 `GREASYFORK_API_TOKEN` 通用发布流程。[官方 API](https://greasyfork.org/en/help/api)
- GitHub Actions artifact 适合保存 CI 构建结果。下载需要登录 GitHub 并有仓库读取权限；默认保留 90 天，可按仓库设置调整。删除 workflow run 也会删除对应 artifact，因此它不是持久、匿名可读取的脚本同步源。[下载产物](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/download-workflow-artifacts)、[产物概念](https://docs.github.com/en/actions/concepts/workflows-and-actions/workflow-artifacts)
- GitHub Release 自动附带对应 tag 的源码 ZIP、tarball。因此 Release 只发布说明和源码归档时，无需手工上传 `.user.js`，也无需增加打包附件步骤。[GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)
- Greasy Fork 会移除 `@updateURL`、`@installURL`、`@downloadURL`，使从该站安装的脚本从该站更新。`@name` 与 `@namespace` 共同标识安装身份，代码更新时需提升 `@version`。[元信息规则](https://greasyfork.org/en/help/meta-keys)
- Greasy Fork 要求脚本主体功能包含在上传代码内；允许非压缩的工具打包输出，但禁止混淆或压缩，大小限 2 MB。不得用平台页面引导用户改用替代下载源。随包内联库应标注来源及版本；发布前需检查实际构建输出。[代码规则](https://greasyfork.org/en/help/code-rules)

## Greasy Fork 自动同步的真实配置

官方 API 页的 Webhook 说明链接是 [账号 Webhook 设置](https://greasyfork.org/en/users/webhook-info)，匿名访问会跳到登录页。其当前页面模板可在官方源码核查：[Webhook 设置模板](https://github.com/greasyfork-org/greasyfork/blob/803491d248b9485b042baba10df1508add21a2bc/app/views/users/webhook_info.html.erb)。

1. 先在 Greasy Fork 导入新脚本，或为已有脚本在 **Admin → Source syncing** 配置同步 URL。Webhook 不会自行创建新的脚本条目。[官方说明文案](https://github.com/greasyfork-org/greasyfork/blob/803491d248b9485b042baba10df1508add21a2bc/config/locales/en.yml)、[同步表单](https://github.com/greasyfork-org/greasyfork/blob/803491d248b9485b042baba10df1508add21a2bc/app/views/scripts/_sync.html.erb)
2. 同步源应是已存在的完整可读脚本，例如 `https://raw.githubusercontent.com/OWNER/REPO/BRANCH/path/script.user.js`。官方还支持 `raw/refs/heads/` 等格式。GitHub 仓库 **Settings → Webhooks → Add webhook** 填账号页面提供的 Payload URL，Content type 为 `application/json`，Secret 使用该页面生成的值，Active 勾选。[Webhook 设置模板](https://github.com/greasyfork-org/greasyfork/blob/803491d248b9485b042baba10df1508add21a2bc/app/views/users/webhook_info.html.erb)
3. 选择 **Just the push event** 可在匹配文件发生推送变更时同步。也支持 Releases 事件，但 Release assets 同步格式需要 `.user.js` 附件；本项目“GitHub Releases 仅源码”不采用该附件路线。首次成功 Webhook 才会把同步类型切换为 Webhook；Automatic/Manual 模式可先保存。[设置模板](https://github.com/greasyfork-org/greasyfork/blob/803491d248b9485b042baba10df1508add21a2bc/app/views/users/webhook_info.html.erb)、[处理实现](https://github.com/greasyfork-org/greasyfork/blob/803491d248b9485b042baba10df1508add21a2bc/app/controllers/concerns/webhooks.rb)
4. 需要检查 GitHub delivery 返回内容与 Greasy Fork 版本。当前实现返回 `updated_scripts`、`updated_failed`；HTTP 成功可能表示没有匹配脚本，不能单看状态码就宣称同步完成。当前 push 实现只遍历 `commits[].modified`，所以应在同步文件已存在后完成初始导入，再用后续文件修改验证链路。[Webhook 处理实现](https://github.com/greasyfork-org/greasyfork/blob/803491d248b9485b042baba10df1508add21a2bc/app/controllers/concerns/webhooks.rb)、[GitHub 事件解析](https://github.com/greasyfork-org/greasyfork/blob/803491d248b9485b042baba10df1508add21a2bc/lib/github.rb)

## 对本项目的建议（工程推论）

当前先完成 **CI 检查 → 构建 → Actions artifact**，将 artifact 标为开发/验证下载；正式安装入口只指向 Greasy Fork。GitHub Release 不附带脚本，只保留源码归档与发布说明。不要把 artifact URL 写入 Greasy Fork 同步设置。

未来若希望自动更新：由获准的正式发布流程把通过检查的完整、非压缩 `.user.js` 写入一个专用分发分支的固定路径，Greasy Fork 订阅该 raw 文件并使用 push Webhook。只有正式发布才更新此分支，从而避免每次源码 push 都触发正式脚本更新。该 raw 地址属于同步基础设施，不作为面向用户的安装入口；公开 raw 文件仍技术上可直接访问，因此“唯一安装入口”指产品支持与展示渠道，不能保证互联网上仅存在一份可下载字节。

若暂不需要增加分发分支，首次和后续版本可由维护者在 Greasy Fork 提交构建产物；这与现阶段仅做 CI artifact 的方案一致。自动同步不是交付 CI 的前置条件。

## 尚缺信息与后续验收

- Greasy Fork 脚本是否已经建立，以及真实脚本页 URL / ID；没有这些不能填写有效的安装链接。
- 未来采用手动发布还是 raw 文件同步；若同步，需确认持久文件位置、更新触发条件和对应写权限。
- Webhook 只在选择该方案后，从实际 Greasy Fork 账号页面取得 Payload URL / Secret 并配置仓库；本次不生成、不假设、不保存凭据。
- 首发前检查实际产物满足平台规则；同步后核验平台版本、代码和脚本管理器安装/更新结果。当前研究没有进行账号内操作或真实安装验收。

源码引用固定到核查时官方仓库提交 `803491d248b9485b042baba10df1508add21a2bc`；线上部署可能与 main 有差异，特别是字段匹配细节应以实际 delivery 验收为准。
