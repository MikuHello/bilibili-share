# 动效设计文档 — Bilibili Share 视觉打磨

Status: approved（2026-08-17，与 `visual-polish/spec.md` 配套）

## Principles

- 动效只服务两件事：解释状态变化、保持视觉连续。
- 默认克制，160–260ms；不使用 spring、回弹或位移过大的动画。
- 任何非必要动画必须尊重 `prefers-reduced-motion: reduce`。
- JS 只切换状态类；动画全部由 CSS 完成。

## Tokens

```css
--motion-fast: 160ms;
--motion-base: 200ms;
--motion-slow: 240ms;
--ease-out: cubic-bezier(0.22, 0.61, 0.36, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--motion-disabled: 0ms;
```

## Transitions

### 1. Panel open

- Backdrop: 200ms `ease-out` opacity 0→1.
- Panel: 240ms `ease-out`；opacity 0→1，translateY(10px)→0，scale(0.985)→1。
- 内容不逐项 stagger，避免干扰。

### 2. Panel close

- Backdrop: 160ms `ease-in-out` opacity 1→0。
- Panel: 160ms `ease-in-out` 反向，动画结束后从 DOM 移除。
- Esc / ✕ / 遮罩三条路径使用同一动画。

### 3. Theme switch

- 旧海报层：160ms 淡出，`translateY(0)` 保持不变。
- 新海报层：160ms 淡入，`translateY(4px)→0`。
- 两段时间上完全重叠，总时长 160ms；视觉为 crossfade。
- 面板颜色/token 过渡：180ms `ease-in-out`，只过渡 color/background/border-color。
- 布局尺寸在切换前后完全一致，禁止重建导致高度跳动。

### 4. Poster rebuilding（分P/时间戳）

- 旧预览保留。
- 遮罩 140ms 淡入；完成后新海报替换旧海报，遮罩 140ms 淡出。
- 导出动作在重建期间 `disabled`。

### 5. Actions and status

- Button hover/press：140ms color/border/background/translateY(-1px)。
- Status enter：180ms opacity 0→1 + translateY(3px)→0。
- Status success auto-dismiss：保持 3000ms 后 160ms 淡出。
- Status failure 不自动消失，直到下一次动作。

### 6. Entry

- Hover/color/border：140ms。
- A↔B 样式切换：180ms color/background/border。
- 入口挂载不播放入场动画，避免页面加载闪烁。

### 7. Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  * { transition-duration: 0ms !important; animation-duration: 0ms !important; }
}
```

- 主题切换退化为瞬时 crossfade（无位移）。
- 打开/关闭面板无位移动画，仅必要时保留即时显隐。

## Implementation notes

- `src/ui/` 中新增 `motion.css` 或等价 tokens，与组件样式分离。
- 不要在组件里写 magic duration 数字；统一引用 motion tokens。
- 动画只允许作用于 opacity、transform、color、background-color、border-color。
