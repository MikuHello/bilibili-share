# Ticket 05 — 标准图文剪贴板实测与去留

日期：2026-09-07。基线 fea0e66。输入为 ticket02 的真实生产 B3 1080×1440 导出 `real-BV1GJ411x7h7.png`；封面为真实公开视频封面，标题/统计来自明确的集成夹具，不将其称为该视频实时元数据。

## 实际接收结果

| 方案 | API 写入 | 浏览器默认 contenteditable | macOS QQ 空白自聊草稿 | macOS TextEdit 新建富文本文稿 |
| --- | --- | --- | --- | --- |
| 候选现有 PNG + text/plain + text/html | 成功 | 图片 1 张 + 独立文字 | 只有图片，没有独立文字 | 图片附件 + 独立文字，可选中替换文字而图片保留 |
| HTML + text/plain（排除 PNG 优先选取的可能） | 成功 | 未重复测试 | 仍只有图片，没有独立文字 | 图片附件 + 独立文字 |

浏览器为实际 Edge 用户配置（152 系列），系统为 macOS；QQ 客户端确切版本未读取。未覆盖 Windows QQ，也没有把 TextEdit 结果推广为全部笔记软件兼容。全部粘贴通过原生应用 `super+v`，没有脚本模拟 paste 事件、修改接收区补图或注入文字。浏览器工具自身的虚拟粘贴曾提示无数据，这次操作不计入证据；之后实际系统剪贴板写入/粘贴均由原生 Edge/接收应用操作完成。

- `browser-three-format.png`：浏览器默认粘贴图文。
- `textedit-three-format-edited.png` / `textedit-three-format-ax.txt`：原生图像附件仍在，选中的“可编辑文字”被替换为 `x`，证明不是烧入海报的文字。
- QQ 两种方案均通过截图观察：输入区只出现海报缩略图，AX 只有零宽字符和附件容器，没有测试文案/URL。为避免把真实聊天历史写入仓库，不保存整个 QQ 窗口截图或聊天 AX。
- 未发送任何消息。QQ 测试草稿已全选清空；TextEdit 两个新建测试文稿清空后保存在本证据目录并关闭，未修改已有文稿。
- `index.html`、`probe.js` 是可重新运行的冻结探针；`candidate-clipboard.ts` 保存基线代码，仅作测试档案，不进入生产。`probe.ts` 可由 esbuild 重新 bundle。

## 决定

移除组合复制入口及其专用写入、降级和图标代码。现有标准方案在浏览器/TextEdit能工作，不能据此称为不可能；但主人主要场景 QQ 的失败已真实复现，移除 PNG 表示仍不能使其同时接收可编辑文案。依已批准 spec 的条件授权，不继续发展应用或平台专用适配，也不把原有三格式写入重新包装成修复。保持独立海报、普通文案、Markdown复制和PNG下载；底部主动作通过既有 flex 填满可用宽度，下载位置由票06调整。

## 验证

- 新增 `verify-independent-exports.mjs`：修改前因组合按钮仍存在而失败；修改后验证四个独立动作、PNG-only协议、文案及Markdown、图片失败转下载、文字失败手动复制和实际下载。
- 删除仅针对已移除组合逻辑的四个单测；其余64测试通过，类型检查与构建通过。
- 目标一致性、生命周期、原生Chromium剪贴板/下载和面板键盘回归见随附结果。API协议断言与上表实际接收证据分开记录。

## Standards

独立审阅：硬性规范违规0，可操作代码异味0。条件移除证据明确，生产、图标、构建描述、术语与验证同步清理；冻结旧代码仅为探针档案，不进入生产。

## Spec

独立Spec审阅0项发现：条件移除符合QQ真实粘贴证据与批准范围，独立导出及失败恢复保留，无平台专用适配。

Regression results: targets 10 scenarios / 6 decoded PNGs; lifecycle 9 groups; text recovery 3 groups; panel keyboard, close paths, 320/390px, native Chromium clipboard and PNG download all passed. See targets/report.json and panel/report.json.
