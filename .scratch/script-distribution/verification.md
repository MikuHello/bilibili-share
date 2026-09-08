# 发行职责与候选构建验证

Status: verified — review pending
Baseline: 7fb4c75

- Greasy Fork 已由主人确认作为唯一正式脚本发行入口；当前无真实脚本页面/仓库连接，尚未发布。
- workflow仅监听main推送、面向main的PR和手动触发；不监听release或标签推送，只读contents权限。三项官方Actions均已核实并锁定提交。
- 本地通过npm ci、类型检查、95项Vitest测试、test:build与正式构建。未改变产品运行代码；没有重复产品浏览器矩阵。
- Ruby Psych YAML解析及事件/权限/动作锁校验通过。尚无仓库，因此无法声称GitHub托管runner已运行或artifact已上传。
- git archive --worktree-attributes验证源码归档排除整个dist目录，保留src、package/lock、build脚本和项目skills。提交后再验证HEAD归档。
- 本地文档链接及git diff --check通过；同步已跟踪SHA-256文件到当前0.1.0产物，CI运行时会重新计算校验值。
- GitHub Release使用自带源码zip/tar.gz，不挂载任何构建附件；Actions artifact只用于候选验证，14天过期，不是Greasy Fork同步URL。
- Greasy Fork首次提交、同步源及原生webhook方案详见research.md和docs/distribution.md；自动分发分支尚未配置，需要有效仓库和脚本页面。
