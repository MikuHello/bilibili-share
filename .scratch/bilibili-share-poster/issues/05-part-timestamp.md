# 05 — 分享当前分P与播放位置

**What to build:** 观看者可以从同一 generation snapshot 选择分P分享和时间戳分享；更新完成后，海报、二维码、链接、share text 和文件名共同表达同一个目标。

**Blocked by:** 02 — 使用已校验短链并诚实降级；03 — 复制海报并保留下载兜底；04 — 预览并复制默认分享文案

**Status:** complete

- [x] 分P分享和时间戳分享每次重新打开面板时均默认为关闭，切换选项不得重新捕获播放位置或重新获取视频信息。
- [x] 在 P2 或更后分P，启用时间戳会同时启用并要求分P分享；关闭分P分享会同时关闭时间戳分享。
- [x] 捕获位置低于一秒时无法启用时间戳分享，并继续使用不含 `t=0` 的默认目标。
- [x] 时间戳向下取整为整数秒；显示格式在一小时以下为 `MM:SS`，一小时及以上为 `HH:MM:SS`。
- [x] 启用分P时海报显示 `P<number> · <分P标题>`；标题不可用时只显示 `P<number>`，不发明占位标题。
- [x] 当前分P无法识别时仍允许默认分享，但禁用分P和时间戳选项并说明原因。
- [x] 选项变化期间保留旧预览并覆盖“正在更新…”状态，全部导出动作禁用；仅当海报、二维码、share target 和 share text 全部一致后重新启用。
- [x] 新目标的短链必须重新校验分P和时间戳；失败时所有输出统一降级到包含相同参数的规范长链接。
- [x] 下载文件名仅在启用分P分享时加入 `P<number>` 段。
- [x] 分P依赖、时间边界、缺少分P标题、选项重建与输出一致性均有自动化测试和真实多分P页面验证。
- [x] 若主人在本 ticket 的前端交互设计阶段要求切换 agent，每次切换前均由离场 agent 按 `handoff` 技能在操作系统临时目录交付上下文，包括前端设计 agent 切回 Codex 的交接；返回 Codex 后重新核对 ticket、实际文件和 Git 状态，不把 handoff 当作当前事实的替代品。

## Comments

### 2026-08-14 — in-progress implementation

- TDD seam：新增 `src/options.ts` 纯选项状态机（分P/时间戳依赖、P2 强制分P、关闭分P联动关闭时间戳、低于 1 秒禁启用）；`tests/options.test.ts` 覆盖这些规则。
- `share-target.ts` 新增 `buildCanonicalShareTarget`，按同一 snapshot/options 生成无参、`?p=`、`?t=`、`?p=&t=` 的规范长链；短链落点继续用既有 `selectShareTarget` 校验 p/t 保真。
- `bilibili.ts` 解析 `pages` 并产出 `partTitle` / `partIdentified`；`fetchValidatedShareTarget` 改为可复用导出函数，选项变更只重新生成/校验 share target，不重新获取元数据或封面。
- 面板新增“分P分享/时间戳”开关；分P不可识别或时间 <1 秒时禁用并说明。变更时保留旧预览、覆盖“正在更新…”，四个（当前三个）导出按钮禁用，重建完成后再启用。
- 海报新增条件 `P<number> · <分P标题>` / `P<number>` 与时间胶囊；下载文件名仅在分P分享启用时加入 `_P<number>`。
- 待执行：`npm test`、`npm run check`、`npm run build` 与真实多分P页面验证；当前执行环境无法启动 shell，尚未 claim complete。
### 2026-08-17 — final validation

- Real multi-P page `BV1FRgn6pEph/?p=2` in Chrome 151: enabling timestamp alone auto-enabled part share, poster showed `P2 · WasteTheFallen实机演示` + `00:05`, target became `?p=2&t=5`, and update state covered old preview while all export buttons were disabled.
- Disabling part share then disabled timestamp and returned to the default target; downloaded filename with part enabled was `bilibili_BV1FRgn6pEph_P2_20260817-001620.png`.
- P1 timestamp-independence, <1s disabling, missing part-title `P2`, and p/t short-link validation are covered by `options.test.ts`, `domain.test.ts`, and `share-target.test.ts`.
