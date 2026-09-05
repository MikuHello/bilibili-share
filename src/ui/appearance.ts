/** Effective page appearance is independent from the fixed poster palette. */
export type PageAppearance = "light" | "dark";

function backgroundAppearance(node: Element): PageAppearance | null {
  const color = getComputedStyle(node).backgroundColor;
  if (!CSS.supports("color", color)) return null;
  // Browser color conversion also handles BewlyCat's computed oklab/color-mix.
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const [r, g, b, alpha] = context.getImageData(0, 0, 1, 1).data;
  if (alpha < 250) return null;
  const brightness = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  if (brightness < 0.4) return "dark";
  if (brightness > 0.65) return "light";
  return null;
}

export function readPageAppearance(): PageAppearance | null {
  const roots = [document.documentElement, document.body].filter((node): node is HTMLElement => node !== null);
  const dark = roots.some(node => node.classList.contains("dark") || node.classList.contains("bili_dark"));
  const light = roots.some(node => node.classList.contains("light"));
  if (dark && light) return null;
  if (dark) return "dark";
  if (light) return "light";
  // The visible body surface takes precedence over a root background behind it.
  for (const node of [...roots].reverse()) {
    const appearance = backgroundAppearance(node);
    if (appearance) return appearance;
  }
  return null;
}

/** Initial read plus DOM/style refresh hints; event payloads never choose a mode. */
export function observePageAppearance(onChange: (appearance: PageAppearance) => void): () => void {
  let current: PageAppearance = readPageAppearance() ?? "light";
  let frame = 0;
  let stopped = false;
  let body = document.body;
  const refresh = () => {
    frame = 0;
    if (stopped) return;
    if (body !== document.body) {
      body = document.body;
      if (body) observer.observe(body, { attributes: true, attributeFilter: ["class", "style"] });
    }
    const next = readPageAppearance() ?? current;
    if (next !== current) { current = next; onChange(current); }
  };
  const schedule = () => { if (!frame && !stopped) frame = requestAnimationFrame(refresh); };
  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"], childList: true });
  if (body) observer.observe(body, { attributes: true, attributeFilter: ["class", "style"] });
  if (document.head) observer.observe(document.head, { childList: true, subtree: true, attributes: true, characterData: true });
  const events = ["global.themeChange", "darkModeBaseColorChange", "pageshow"];
  for (const event of events) window.addEventListener(event, schedule);
  const stylesheetLoaded = (event: Event) => { if (event.target instanceof HTMLLinkElement) schedule(); };
  document.addEventListener("load", stylesheetLoaded, true);
  // This is only a refresh hint for page CSS using a media query, never a value.
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", schedule);
  onChange(current);
  return () => {
    stopped = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    for (const event of events) window.removeEventListener(event, schedule);
    document.removeEventListener("load", stylesheetLoaded, true);
    media.removeEventListener("change", schedule);
  };
}
