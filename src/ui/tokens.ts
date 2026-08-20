import type { PosterTheme } from "../options";

/**
 * Theme surface class names shared by the toolbar entry and the share panel.
 * `null` means "no extra class", i.e. the default A surface.
 *
 * Centralizing these keeps the entry button and the panel in lockstep when the
 * theme changes, so the two never drift to independent hard-coded strings.
 */
export interface ThemeSurfaceClasses {
  /** Class added to the backdrop and panel when theme B is active. */
  readonly panel: "bsp-theme-b" | null;
  /** Class added to the toolbar entry button when theme B is active. */
  readonly entry: "bsp-entry-b" | null;
}

export function selectThemeSurfaceClasses(theme: PosterTheme): ThemeSurfaceClasses {
  if (theme === "B") return { panel: "bsp-theme-b", entry: "bsp-entry-b" };
  return { panel: null, entry: null };
}
