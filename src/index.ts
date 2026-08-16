import { readPageIdentity } from "./bilibili";
import { createPanelShareOptions } from "./options";
import { STYLES } from "./styles";
import { SharePanel } from "./ui";

const ENTRY_ID = "bsp-entry";
let activePanel: SharePanel | null = null;
let mountQueued = false;

function installStyles(): void {
  if (document.getElementById("bsp-styles")) return;
  const style = document.createElement("style");
  style.id = "bsp-styles";
  style.textContent = STYLES;
  document.head.append(style);
}

function posterIcon(): SVGSVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  const frame = document.createElementNS(svg.namespaceURI, "rect");
  frame.setAttribute("x", "3");
  frame.setAttribute("y", "3");
  frame.setAttribute("width", "18");
  frame.setAttribute("height", "18");
  frame.setAttribute("rx", "1");
  frame.setAttribute("fill", "none");
  frame.setAttribute("stroke", "currentColor");
  frame.setAttribute("stroke-width", "1.8");
  const image = document.createElementNS(svg.namespaceURI, "path");
  image.setAttribute("d", "M6 17l4.2-4.4 2.7 2.6 2.1-2.1 3 3.1M8.2 8.2h.01");
  image.setAttribute("fill", "none");
  image.setAttribute("stroke", "currentColor");
  image.setAttribute("stroke-width", "1.8");
  image.setAttribute("stroke-linecap", "round");
  image.setAttribute("stroke-linejoin", "round");
  svg.append(frame, image);
  return svg;
}

function findShareAnchor(): HTMLElement | null {
  const selectors = [
    "#arc_toolbar_report .video-share-wrap",
    ".video-toolbar-left .video-share-wrap",
    ".video-toolbar-container .video-share-wrap",
    "#arc_toolbar_report [class*='video-share']",
  ];
  for (const selector of selectors) {
    const candidate = document.querySelector<HTMLElement>(selector);
    if (candidate) return candidate.closest<HTMLElement>(".video-share-wrap") ?? candidate;
  }
  return null;
}

function openPanel(): void {
  if (activePanel) {
    activePanel.focus();
    return;
  }
  activePanel = new SharePanel(() => {
    activePanel = null;
  });
  activePanel.open();
}

function mountEntry(): void {
  mountQueued = false;
  if (activePanel && !activePanel.matchesCurrentPage()) activePanel.close(false);
  if (!readPageIdentity() || document.getElementById(ENTRY_ID)) return;
  const anchor = findShareAnchor();
  if (!anchor?.parentElement) return;
  const button = document.createElement("button");
  button.id = ENTRY_ID;
  button.type = "button";
  const remembered = createPanelShareOptions(typeof GM_getValue === "function" ? GM_getValue("bsp-panel-preferences", null) : null); button.classList.toggle("bsp-entry-b", remembered.theme === "B"); button.title = "生成分享海报";
  button.append(posterIcon(), document.createTextNode("生成海报"));
  button.addEventListener("click", openPanel);
  anchor.insertAdjacentElement("afterend", button);
}

function queueMount(): void {
  if (mountQueued) return;
  mountQueued = true;
  window.requestAnimationFrame(mountEntry);
}

function handleLocationChange(): void {
  if (activePanel && !activePanel.matchesCurrentPage()) activePanel.close(false);
  document.getElementById(ENTRY_ID)?.remove();
  queueMount();
}

installStyles();
queueMount();
new MutationObserver(queueMount).observe(document.documentElement, { childList: true, subtree: true });
window.addEventListener("urlchange", handleLocationChange);
window.addEventListener("popstate", handleLocationChange);

if (typeof GM_registerMenuCommand === "function") {
  GM_registerMenuCommand("生成分享海报", () => {
    if (!readPageIdentity()) return;
    openPanel();
  });
}
