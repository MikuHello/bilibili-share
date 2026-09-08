# V0.1 版本与工程规范验证

Status: verified — code review pending

2026-09-08；本轮开始提交 d887910。

## 连接核查

- gh CLI 2.100.0 可执行；gh api user 成功识别 MikuHello。
- 项目 MikuHello/bilibili-share：仓库 API 返回404；Git ls-remote 返回 Repository not found；本地 git remote 无配置。不能确认不存在还是当前身份不可访问；没有创建、推送或发布。
- gh repo list MikuHello 的最多100条返回中未找到名称含 bili 的可见仓库；不把这个有上限的列表当作所有仓库都不存在的证明。
- 公共上游 mattpocock/skills API 与 HTTPS Git clone 均成功。

## Matt 更新

- 旧提交8b78b531ab965735c5dc74f6f7a219e1e37326df，新提交3cca18b368ae95cdbdebbff572ccafa662551015；上游多34个提交。
- 插件版本仍为1.2.3，更新依据是提交差异。旧15个本地技能逐文件匹配旧上游，没有本地修改被覆盖。
- 已同步上游稳定插件清单中的25个技能；74个文件逐文件匹配上游与来源锁，所有字面本地 Markdown 链接可解析。无全局技能安装或上游安装脚本执行。
- 保存上游MIT许可证与包含每个文件SHA-256的来源锁。项目适配规则放在AGENTS、CONTRIBUTING和docs内；补齐新安装triage所需的本地角色映射。

## 版本与构建

- 正式展示V0.1，package/lock/userscript为0.1.0；未来正式标签v0.1.0，尚未创建标签或Release。
- 开发构建明确指定R，生成0.1.0-dev.1/2；安装名称固定、与正式名称不同，文件分开。开发和正式均保持已有namespace。
- 红：新增实际构建验证发现旧开发产物仍为0.4.0，没有dev.1后缀。
- 绿：npm run test:build通过，验证正式构建、R1/R2、开发不覆盖正式、固定安装名称、调试代码隔离，以及9组错误参数在写入前拒绝。
- 类型检查及95项Vitest行为测试通过。
- 正式产物剥离userscript头后与已完整验证的内部0.4.0正文逐字节相同；本轮未重复运行15套产品浏览器矩阵，既有行为证据保留在上一批工作项。
- 开发迭代R1/R2是本次相同代码的构建验证样本，最高已用R2；后续发生代码变化时使用R3或新的正式目标基线。
- 实际产物校验值见verification.json。没有执行真实脚本管理器安装；由内部高版本改为V0.1时需要手动安装，不能期待自动降级。

## 文档入口

README负责使用与安装，CONTRIBUTING负责贡献导航，AGENTS是唯一agent入口，docs/development.md集中版本/构建/验证/工作目录规范，docs/agents/skills.md负责Matt路由与上游更新。保留CONTEXT作为纯领域词汇表，不复制工程规则。
