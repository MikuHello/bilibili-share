# 06 — 开发调试抽屉（仅开发构建）

**What to build:** 把方向选择期用于切换场景状态的 QA 脚手架（长/短链、缺失统计、多分P、封面缺失、窄视口、reduced-motion、B 最大化等）收进一个独立隔离、默认收起的 debug 抽屉，仅在开发构建中存在。**生产 userscript 完全不打包它。**

**Blocked by:** 01 — 修正入口并建立海报舞台面板骨架

**Status:** complete

- [x] debug 抽屉独立于产品面板，默认收起，明显标注 `DEBUG / 调试`，与产品 UI 视觉隔离。
- [x] 由构建/开发标志门控（如 `?debug=1` 或本地构建开关）；**生产 userscript 构建产物不含 debug 抽屉任何代码或控件**，真实用户不可达。
- [x] 产品面板内不含任何 debug 控件；产品面板与 debug 抽屉无耦合。
- [x] 抽屉覆盖方向选择期的全部场景状态切换（长/短链、缺失统计、多分P、封面缺失、窄视口、reduced-motion、B 最大化等），用于后续视觉与回归验证。
- [x] `npm run build`（生产）产物经校验不含 debug 抽屉；开发构建含抽屉且默认收起。

## Comments

### 2026-08-20 — origin

- 这些场景切换原本是 `prototype.html` 里用来选 A/B/C 方向的 QA 工具，方向已定（合并 A+B，C 删除），不应继续混进产品面板。
- grill 决议：独立隔离的 debug 抽屉，默认收起，生产构建完全不打包。调试脚手架与产品 UI 彻底分开。

### 2026-09-05 — implementation and verification

- 已按批准方案完成本 ticket 实现；自动化、真实页面适配验证及评审记录见 [本轮验收记录](../acceptance/2026-09-05-validation.md)。
- 完成状态指本 ticket 的实现与上述验证；不宣称完整 Tampermonkey / Chrome / Edge 矩阵已通过，最终视觉接受仍待主人确认。
