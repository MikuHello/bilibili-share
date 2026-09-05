# 05 — 封面缺失的安静占位

**What to build:** 当封面不可解码、自然尺寸小于 160×90 或为 1×1 透明占位图时，A/B 海报显示中性纹理 + 极小 `COVER UNAVAILABLE`，面板不报致命错误，复制/下载仍可用。真实缩略图生成明确留给后续 ticket。

**Blocked by:** 01 — 修正入口并建立海报舞台面板骨架

**Status:** complete

- [x] 纯逻辑 `isUsableCover(blob/image)` 或等价判定可测试：正常封面通过；1×1 透明图、过小图、解码失败不通过。
- [x] 封面不可用时不再阻止面板 ready 或导出；海报封面区域使用安静中性纹理占位。
- [x] 占位含极小 `COVER UNAVAILABLE` 标记，A/B 主题下均可读且不喧宾夺主。
- [x] 封面正常路径与降级提示、二维码、链接、复制/下载均不回归。
- [x] 生成视频帧缩略图不在本 ticket 实现，仅保留清晰 seam 供未来扩展。
- [x] 纯逻辑测试覆盖可用性判定；`npm test`、`npm run check`、`npm run build` 通过；真实旧视频页面 smoke 通过。

## Comments

### 2026-09-05 — implementation and verification

- 已按批准方案完成本 ticket 实现；自动化、真实页面适配验证及评审记录见 [本轮验收记录](../acceptance/2026-09-05-validation.md)。
- 完成状态指本 ticket 的实现与上述验证；不宣称完整 Tampermonkey / Chrome / Edge 矩阵已通过，最终视觉接受仍待主人确认。
