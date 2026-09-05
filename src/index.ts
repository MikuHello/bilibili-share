import { readPageIdentity } from "./bilibili";
import { observePageAppearance, type PageAppearance } from "./ui/appearance";
import { mountSharePosterEntry, removeSharePosterEntry, setEntryAppearance } from "./ui/entry";
import { SharePanel } from "./ui/panel";
import { STYLES } from "./ui/styles";

let activePanel: SharePanel | null = null;
let mountQueued = false;
let pageAppearance: PageAppearance = "light";

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
  activePanel.setAppearance(pageAppearance);
  activePanel.open();
}

function mountEntry(): void {
  mountQueued = false;
  if (activePanel && !activePanel.matchesCurrentPage()) activePanel.close(false);
  if (!readPageIdentity()) return;
  mountSharePosterEntry(pageAppearance, openPanel);
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
observePageAppearance((appearance) => {
  pageAppearance = appearance;
  setEntryAppearance(appearance);
  activePanel?.setAppearance(appearance);
});
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
