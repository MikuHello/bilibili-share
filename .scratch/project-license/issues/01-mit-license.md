# 01 — Adopt MIT

Status: done
Blocked by: none
Baseline: 3b83153e6b8f7deebfbbd2e54abccd34023dcead

## Request

主人确认采用 MIT，要求添加项目许可证、最小修改 README 并提交。

## Acceptance

- 根 LICENSE 使用完整 MIT 文本，版权署名 2026 MikuHello。
- README 仅替换许可证段落，保持其余文字和图片排版不变。
- package/lock 和用户脚本 metadata 标明 MIT。
- 保留打包的 html-to-image、qrcode、dijkstrajs 的原始许可证声明。
- 正式与开发单文件脚本包含项目及第三方完整声明；不修改产品逻辑、正式版本，不发布新的 Greasy Fork 版本。
- 提交主作者为 MikuHello，Co-authored-by 标明 Codex 并关联其 bot 头像。

## Validation

- 先扩展现有构建验证，确认因缺少 @license MIT 失败，再加入 metadata 和完整许可 banner。
- npm run check、95 项测试、npm run test:build 均通过。
- 产物从 "use strict" 开始的执行正文与基线逐字符一致。
- Standards 审查 0 项，Spec 审查 0 项；三个依赖原许可证与声明逐项核对一致。
- README 仅替换许可证一段；未推送远端或更新 Greasy Fork，后续发布仍按发行流程执行。
