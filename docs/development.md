# 开发规范

## 版本：正式发布与开发迭代分开

正式版本以 `package.json` 为单一来源，由维护者决定；以下以 `0.1.1` 为例。

| 用途 | 示例 | 规则 |
| --- | --- | --- |
| GitHub 正式 Release 标题 | `V0.1.1` | 面向使用者的展示名 |
| GitHub 正式标签 | `v0.1.1` | 对应一次批准的正式发布；发布后不移动或覆盖 |
| package 与正式脚本 `@version` | `0.1.1` | `package.json` 是发布基线的单一来源，lock 同步 |
| 本地原型建议版本 | `0.1.1-dev.1`、`0.1.1-dev.2` | 直接使用开发版本，不附加 R 编号；私人实验自由管理 |
| 开发脚本 `@version` | `0.1.1-dev.1` | 由基线与可选开发序号生成，默认 dev.1 |
| 共享开发包 | `0.1.1-dev.2` + Git 提交号 | 标明目标版本和具体代码，不能冒充正式 Release |

本地原型建议使用 `X.Y.Z-dev.N`。这是便于辨认的建议，不要求私人实验每次修改都递增，也不维护全仓库共享的序号。不同贡献者可以使用相同开发版本；共享或提交评审时附 Git 提交号（未提交变更另作说明），以准确识别内容。构建参数中的 `--revision` 仅表示 dev 后的数字，不是另一套 R 编号。

仓库拥有者管理 `0.1.1`、`0.1.2` 等正式版本。贡献者的本地原型、内部重构、单次提交和工单完成都不自动增加正式版本，也不擅自修改 package 中的发布基线。

预发布格式参考 [SemVer](https://semver.org/)。Tampermonkey 会使用 `@version` 检查更新，详见 [官方说明](https://www.tampermonkey.net/documentation.php?q=version)。正式和开发安装身份分开，不能只依赖不同版本解析器的排序规则来隔离两个通道。

## 构建

```sh
npm install
npm run build
npm run build:dev
npm run build:dev -- --revision 2
```

- 正式产物：`dist/bilibili-share-poster.user.js`，名称 `Bilibili 分享海报`，用于正式交付。
- 开发产物：`dist/bilibili-share-poster.dev.user.js`，名称 `Bilibili 分享海报 · 开发调试`，包含调试抽屉；已被 Git 忽略。
- 两者沿用现有 namespace，以不同且固定的名称区分安装身份。开发版本写入头信息和描述，安装名称不随开发序号改变。测试时只启用所需通道，避免两个脚本同时注入入口。
- 开发构建可省略序号，默认生成 `dev.1`；需要区别原型时用正整数 `--revision` 指定 dev 后缀。`--revision` 不能用于正式构建；错误参数会在写入产物前被拒绝。
- 构建命令只生成文件，不创建 Git 标签、不推送、不创建 GitHub Release。若本地已安装更高的内部版本，需手动切回正式版本；不期待自动降级。

## 实现与验证

当前采用 TypeScript、原生 DOM/CSS 和 esbuild。先保持文案生成等可复用模块与面板解耦；引入前端框架属于新的架构取舍，通过 Matt 流程评估。

- 行为变更按 TDD 在已约定的公共接口验证输入、结果和错误，不测试文件拆分或内部调用细节。
- 常规检查：`npm run check`、`npm test`、`npm run build`。
- 构建/版本规则变更：额外运行 `npm run test:build`，验证正式/开发头信息、产物隔离与错误参数。
- 面板、海报、剪贴板或导航行为变更：运行相关浏览器用例；整批交付运行 `npm run test:browser`。使用 `BSP_PLAYWRIGHT_MODULE` 指定已安装的 Playwright 入口；macOS QR 解码等环境要求见验证脚本。
- 浏览器测试输入固定放在 `tests/fixtures/`。完整套件默认输出到 `artifacts/browser/delivery/`，单套件输出到 `artifacts/browser/<suite>/`；可用 `BSP_EVIDENCE_DIR` 覆盖为其他本地产物目录。这些输出不提交，最终结论写入提交或发行说明，临时工作项在交付后清理。报告区分受控浏览器、真实剪贴板、真实脚本管理器安装与线上网络结果。
- 纯文档/技能同步不需要重跑产品浏览器矩阵；验证本地链接、技能来源锁和实际改动范围。只改 userscript 版本头时可比较正文是否完全相同。
- 每票开始提交为该票审查基准；整批审查以整批实施开始提交为基准。记录具体 SHA 并运行 Standards / Spec 两项独立审查。

## 工作目录与提交

`bilibili-share` 是日常主目录。仅在需要隔离并行工作或原型时创建 worktree，并在工单记录用途、路径和基准。新上下文可以由同一目录的新 agent 上下文实现，不要求复制项目目录。

工作完成后检查未提交文件、独有提交、忽略项和进程占用，确认工作成果已保存，再使用 `git worktree remove` 清理临时工作目录。保留 Git 历史，合并后清理已合并的临时分支与原型目录。不要把本机凭据、依赖目录或外部仓库的 `.git` 纳入提交。

## 正式发布

根据维护者确定的目标同步 package/lock 版本，完成验收并记录提交和产物校验值。脚本唯一正式安装与更新入口是 Greasy Fork；GitHub Actions 构建候选包，GitHub Release 仅提供源码归档和说明，不构建或上传 `.user.js`。具体操作以 [发行流程](distribution.md) 为准。

私人本地实验无需逐次登记版本；有必要评审或复现的结果记录到工单与 Git 提交中。确需外部分发开发包时单独获得授权，使用明确的预发布标签/状态，不能冒充正式 Release。项目 skills 的版本由 `.agents/matt-skills.lock.json` 管理，与产品发布版本独立。
