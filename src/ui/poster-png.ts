import { toPng } from "html-to-image";

// Poster identity owns cover/layout; target changes invalidate this entry explicitly.
// Font availability may change without changing either the snapshot or its DOM.
let fontVersion = 0;
document.fonts.addEventListener("loadingdone", () => { fontVersion++; });
document.fonts.addEventListener("loadingerror", () => { fontVersion++; });
const exports = new WeakMap<HTMLElement, { fontVersion: number; png: Promise<string> }>();

/** Called synchronously with a committed preview mutation. */
export function invalidatePosterPng(poster: HTMLElement): void {
  exports.delete(poster);
}

/** Export the exact measured preview, reusing encoding work for its current version. */
export async function exportPosterPng(poster: HTMLElement): Promise<string> {
  await document.fonts.ready;
  let cached = exports.get(poster);
  if (!cached || cached.fontVersion !== fontVersion) {
    const png = toPng(poster, { width: 1080, height: 1440, pixelRatio: 1, cacheBust: false, style: { transform: "none" } });
    cached = { fontVersion, png };
    exports.set(poster, cached);
    const entry = cached;
    void png.catch(() => { if (exports.get(poster) === entry) exports.delete(poster); });
  }
  return cached.png;
}
