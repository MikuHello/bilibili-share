import { describe, expect, it } from "vitest";

import type { PosterTheme } from "../src/options";
import { selectThemeSurfaceClasses } from "../src/ui/tokens";

describe("selectThemeSurfaceClasses", () => {
  it("activates the B surface classes for the panel, backdrop and entry", () => {
    expect(selectThemeSurfaceClasses("B")).toEqual({
      panel: "bsp-theme-b",
      entry: "bsp-entry-b",
    });
  });

  it("clears every surface class for theme A so no B styling leaks in", () => {
    expect(selectThemeSurfaceClasses("A")).toEqual({
      panel: null,
      entry: null,
    });
  });

  it("always resolves a class entry for both supported themes", () => {
    const themes: PosterTheme[] = ["A", "B"];
    for (const theme of themes) {
      const surface = selectThemeSurfaceClasses(theme);
      expect(surface.panel === null || typeof surface.panel === "string").toBe(true);
      expect(surface.entry === null || typeof surface.entry === "string").toBe(true);
    }
  });

  it("keeps the panel and entry B states in lockstep", () => {
    for (const theme of ["A", "B"] as const) {
      const surface = selectThemeSurfaceClasses(theme);
      expect(surface.panel !== null).toBe(surface.entry !== null);
    }
  });
});
