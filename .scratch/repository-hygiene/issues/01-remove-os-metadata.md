# 01 — 清理系统杂项文件

Status: done
Blocked by: none
Baseline: ca6132a64ef2ff3618a12623d99204dac33a59cc

主人指出 GitHub 的 docs/.DS_Store，要求清理这类文件。

- 已跟踪系统杂项扫描发现 docs/.DS_Store 一份，移除。
- 原有 .DS_Store 忽略规则不会自动取消已跟踪文件；补充 AppleDouble、__MACOSX、Thumbs.db 与 Desktop.ini 忽略规则。
- 不改产品代码；验证跟踪树无上述文件、忽略规则生效后提交并推送。

## Validation

跟踪树扫描确认无系统杂项；git check-ignore 验证根目录与嵌套目录规则生效；git diff --cached --check 通过。Standards / Spec 独立审查各 0 项。纯文件清理与忽略规则修改，无需产品测试。
