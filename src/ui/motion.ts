export const MOTION = { fast: 160, backdrop: 200, open: 240, color: 180, overlay: 140 } as const;

export function motionDelay(duration: number): number {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : duration;
}

export const MOTION_STYLES = `
.bsp-backdrop, #bsp-entry {
  --bsp-motion-fast:${MOTION.fast}ms;
  --bsp-motion-backdrop:${MOTION.backdrop}ms;
  --bsp-motion-open:${MOTION.open}ms;
  --bsp-motion-color:${MOTION.color}ms;
  --bsp-motion-overlay:${MOTION.overlay}ms;
  --bsp-ease-out:cubic-bezier(.22,.61,.36,1);
  --bsp-ease-in-out:cubic-bezier(.4,0,.2,1);
}
@media (prefers-reduced-motion:reduce) {
  .bsp-backdrop *, .bsp-backdrop *::before, .bsp-backdrop *::after, .bsp-backdrop, #bsp-entry {
    animation-duration:0ms !important;
    transition-duration:0ms !important;
  }
}`;
