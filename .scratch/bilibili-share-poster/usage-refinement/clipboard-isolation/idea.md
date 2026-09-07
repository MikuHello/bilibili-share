# 复制完整文案：页面链接净化冲突

Status: implemented — 0.3.3回归通过，实际安装升级验证待完成。主人在0.3.2交付后报告普通文案与Markdown稳定只粘贴链接，标记分P/时间仍保留；明确重新要求排查，替代此前暂停决定。

## 真实复现与原因

2026-09-07，在主人Edge既有视频BV1QGbD6MEDg、实际安装0.3.2，点击普通及Markdown复制后，`pbpaste`均只有链接。面板完整文案存在；临时输入探针捕获传给writeText的完整标题、UP主、统计、标记、编号和链接。

实际navigator.clipboard.writeText被扩展资源`dist/contentScripts/inject.global.js`替换：启用enableCleanShareLink后匹配B站链接，cleanShareLinkIncludeTitle默认false，经净化函数后写入。未按扩展ID猜测产品名称。单变量临时改为原生prototype.writeText后，同一按钮系统剪贴板包含完整文案。接口和探针已恢复/清理；未修改扩展设置。

## 修复范围

沿用既有05独立文案输出要求及已批准领域/浏览器边界，优先已有授权GM_setClipboard纯文本写入，等待完成回调；异常或5秒无完成回调保留手动复制恢复路径。无GM环境保留浏览器API。无需关闭、改配或移除扩展。不增加平台专用剪贴板格式，不修改文案语法和海报构图。

真实脚本安装升级后仍需核验专用通道；原生单变量对照只证明净化函数是丢文案原因，不冒充修复包已实际安装。

## 回归

scripts/verify-text-isolation.mjs：真实Chromium剪贴板加受控外部净化/GM边界，旧实现先失败为仅链接，新实现通过。覆盖普通/Markdown、详细信息开关、标记打开/关闭。tests/clipboard.test.ts检查完整值、等待回调、异常与超时、无GM退回浏览器。

配套入口图标已通过独立设计对照，由主人批准B并完成实施。
