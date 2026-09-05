# 06 — 跟随实际页面外观并融入原生入口

**What to build:** 最终面板随B站/BewlyCat实际浅深模式切换；工具栏入口采用原生层级，保持官方分享与菜单备用入口、SPA重挂载。

**Blocked by:** 05。

**Status:** implemented and reviewed — controlled integration passed; actual manager/version acceptance limited

- [x] 官方分享右侧入口采用相近行高、灰色图标文字、蓝色hover及无独立矩形描边；官方分享不被替代。
- [x] 保留脚本菜单备用入口和SPA重挂载，入口可键盘访问。
- [x] 识别标准B站及BewlyCat实际浅深模式，打开初始化及打开期间切换都有效；不只依赖可能错过的事件。
- [x] 识别失效保留上次有效模式、首次未知浅色；不以系统偏好替代页面设置，不新增选择器或持久主题缓存。
- [ ] 面板统一配色且海报保持固定色已验证；实际设置切换与恢复已验证。Edge reduced UA 已记录，BewlyCat/管理器精确版本及新脚本管理器运行仍未验证，见 implementation-evidence/live-theme-signals.md。
- [x] 按批准规格的领域核心/浏览器副作用接缝执行适当TDD、类型检查和集成验证；完成code-review及提交，记录真实证据和未验证项。

**规格覆盖：** 1–4、50–52；54的入口可访问性。

**交付约定：** 本票属于已批准的默认主题与分享面板整批改版。遵守本计划spec与整批交付约定；可内部独立验证和提交，不向主人逐票交付或要求安装中间版本。全部完成后统一提供最终构建与验收结果。
