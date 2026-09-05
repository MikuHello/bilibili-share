import { readPageIdentity } from "./bilibili";
import { loadRememberedPreferences, type PosterTheme } from "./options";
import { mountSharePosterEntry, removeSharePosterEntry } from "./ui/entry";
import { SharePanel } from "./ui/panel";
import { STYLES } from "./ui/styles";

let activePanel: SharePanel | null = null;
let mountQueued = false;

function installStyles(): void {
  if (document.getElementById("bsp-styles")) return;
  const style = document.createElement("style");
  style.id = "bsp-styles";
  style.textContent = STYLES;
  document.head.append(style);
}

function openPanel(): void {
  if (activePanel && !activePanel.matchesCurrentPage()) activePanel.close(false);
  if (activePanel) {
    activePanel.focus();
    return;
  }
  activePanel = new SharePanel(() => {
    activePanel = null;
  });
  activePanel.open();
}

function rememberedTheme(): PosterTheme {
  return loadRememberedPreferences().theme;
}

function mountEntry(): void {
  mountQueued = false;
  if (activePanel && !activePanel.matchesCurrentPage()) activePanel.close(false);
  if (!readPageIdentity()) return;
  mountSharePosterEntry(rememberedTheme(), openPanel);
}

function queueMount(): void {
  if (mountQueued) return;
  mountQueued = true;
  window.requestAnimationFrame(mountEntry);
}

function handleLocationChange(): void {
  if (activePanel && !activePanel.matchesCurrentPage()) activePanel.close(false);
  removeSharePosterEntry();
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
