# 01 — 创建仓库与 Greasy Fork 页面

Status: done
Blocked by: none

主人明确要求创建公开 GitHub 仓库与 Greasy Fork 脚本页（JsFiddle 是笔误），首版仓库不包含任何 README 文件，并授权使用 Edge 中已登录的 Greasy Fork 账户。

## Delivery

- 公开仓库：https://github.com/MikuHello/bilibili-share；main 已推送。
- Greasy Fork：https://greasyfork.org/zh-CN/scripts/594826；MikuHello 账户发布版本 0.1.0，附中文功能与使用说明。
- GitHub About 与发行文档链接正式安装页面。
- 删除根 README.md；8 份历史原型 README 改名 NOTES.md 并修正对应链接。当前跟踪树无 README 文件；未重写历史提交。
- GitHub 首次自动检查和候选构建成功：https://github.com/MikuHello/bilibili-share/actions/runs/34173903419。
- Greasy Fork 页面已确认版本、介绍与安装链接；本轮未在 Tampermonkey 中重新安装验收。浏览器已有较高版本时，平台会将安装按钮显示为降级到 0.1.0。
- 项目尚未选择许可证，因此保留不声明许可证的状态。未创建源码 Release，也未配置自动同步。

## Verification

- GitHub API 确认 visibility 为 PUBLIC，默认分支为 main。
- Greasy Fork 已接受完整脚本，并显示 198.5 KB、版本 0.1.0。
- 首次提交因浏览器 DOM 读取截断源码被平台拒绝；改用 GitHub 的 Copy raw file 获取完整源码后发布成功。正式发布内容来自 main 的 dist 文件。
