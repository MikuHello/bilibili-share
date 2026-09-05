import type { PosterTheme } from "../options";
import { posterIcon } from "./icons";
import { selectThemeSurfaceClasses } from "./tokens";

export const ENTRY_ID = "bsp-entry";

/**
 * Anchor selectors, most specific first. The spec mandates mounting the entry
 * as a sibling of `.toolbar-left-item-wrap` (the official toolbar item that
 * contains the share button), never inside `.video-share-wrap`.
 */
const TOOLBAR_ANCHOR_SELECTORS = [
  "#arc_toolbar_report .toolbar-left-item-wrap",
  ".video-toolbar-left .toolbar-left-item-wrap",
  ".video-toolbar-container .toolbar-left-item-wrap",
  "#arc_toolbar_report [class*='toolbar-left-item-wrap']",
];

const LEGACY_SHARE_WRAP_SELECTORS =
  "#arc_toolbar_report .video-share-wrap, .video-toolbar-left .video-share-wrap, .video-toolbar-container .video-share-wrap";

/**
 * Locates the toolbar item that should sit beside the entry. Falls back to the
 * legacy `.video-share-wrap` parent for pages that still render the older
 * structure, climbing back out to its toolbar-item wrapper so the entry is
 * always inserted as a sibling of the toolbar item, never inside the share wrap.
 */
function findToolbarAnchor(): HTMLElement | null {
  for (const selector of TOOLBAR_ANCHOR_SELECTORS) {
    const candidate = Array.from(document.querySelectorAll<HTMLElement>(selector))
      .find((item) => item.querySelector(".video-share-wrap"));
    if (candidate) return candidate;
  }
  const legacyShareWrap = document.querySelector<HTMLElement>(LEGACY_SHARE_WRAP_SELECTORS);
  return legacyShareWrap?.parentElement ?? null;
}

export function createSharePosterEntry(theme: PosterTheme, onOpen: () => void): HTMLButtonElement {
  const button = document.createElement("button");
  button.id = ENTRY_ID;
  button.type = "button";
  button.title = "生成分享海报";
  button.append(posterIcon(), document.createTextNode("生成海报"));
  button.addEventListener("click", onOpen);
  const surface = selectThemeSurfaceClasses(theme);
  if (surface.entry) button.classList.add(surface.entry);
  return button;
}

/**
 * Removes a mounted entry if present. No-op otherwise. Used on SPA navigation
 * so a stale entry never lingers across page reconstructions.
 */
export function removeSharePosterEntry(): void {
  document.getElementById(ENTRY_ID)?.remove();
}

/**
 * Mounts the entry as the next sibling of the toolbar anchor. Idempotent: a
 * repeat call while the entry is present is a no-op. Returns whether a mount
 * actually happened.
 */
export function mountSharePosterEntry(theme: PosterTheme, onOpen: () => void): boolean {
  if (document.getElementById(ENTRY_ID)) return false;
  const anchor = findToolbarAnchor();
  if (!anchor?.parentElement) return false;
  anchor.insertAdjacentElement("afterend", createSharePosterEntry(theme, onOpen));
  return true;
}

/**
 * Updates the mounted entry's theme surface class. No-op when the panel is open
 * on a page without the entry (e.g. SPA navigation). The entry owns its own
 * class so callers don't reach into its DOM.
 */
export function setEntryTheme(theme: PosterTheme): void {
  const entry = document.getElementById(ENTRY_ID);
  if (!entry) return;
  const surface = selectThemeSurfaceClasses(theme);
  entry.classList.toggle("bsp-entry-b", surface.entry !== null);
}
