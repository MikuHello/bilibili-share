import QRCode from "qrcode";
import { toPng } from "html-to-image";

import type { GenerationSnapshot, SharePoster } from "../domain";
import { element } from "./dom";
import { posterAssets } from "./poster-assets";
import { posterStyles } from "./poster-styles";

function image(className: string, src: string, alt = ""): HTMLImageElement {
  return Object.assign(element("img", className), { src, alt });
}

function svg(className: string, markup: string): SVGElement {
  // Only fixed, local artwork reaches this parser; video text is always textContent.
  const parsed = new DOMParser().parseFromString(markup, "image/svg+xml").documentElement;
  parsed.setAttribute("class", className);
  return document.importNode(parsed, true) as unknown as SVGElement;
}

interface CoverAppearance { background: string; ink: string }
// Snapshot ownership bounds decoded cover work and releases it with the panel.
const appearances = new WeakMap<GenerationSnapshot, Promise<CoverAppearance>>();

async function deriveCoverAppearance(src: string): Promise<CoverAppearance> {
  const cover = image("", src);
  await cover.decode();
  const canvas = document.createElement("canvas");
  canvas.width = 240;
  canvas.height = 320;
  const context = canvas.getContext("2d")!;
  context.filter = "blur(18px)";
  const scale = Math.max(280 / cover.naturalWidth, 360 / cover.naturalHeight);
  context.drawImage(cover, (240 - cover.naturalWidth * scale) / 2, (320 - cover.naturalHeight * scale) / 2, cover.naturalWidth * scale, cover.naturalHeight * scale);
  context.filter = "none";
  const pixels = context.getImageData(0, 0, 240, 320).data;
  const average = [0, 0, 0];
  for (let i = 0; i < pixels.length; i += 4) {
    average.forEach((_, channel) => { average[channel] += pixels[i + channel] / (240 * 320); });
  }
  const ink = `rgb(${average.map((value, channel) => Math.round(value * .2 + [12, 16, 20][channel] * .8)).join(",")})`;
  const light = context.createLinearGradient(0, 0, 240, 320);
  light.addColorStop(0, "#ffffffc7");
  light.addColorStop(.52, "#ffffff88");
  light.addColorStop(1, "#ffffffa8");
  context.fillStyle = light;
  context.fillRect(0, 0, 240, 320);
  return { background: canvas.toDataURL(), ink };
}

function coverAppearance(snapshot: GenerationSnapshot): Promise<CoverAppearance> {
  let result = appearances.get(snapshot);
  if (!result) {
    result = deriveCoverAppearance(snapshot.coverDataUrl);
    appearances.set(snapshot, result);
    void result.catch(() => appearances.delete(snapshot));
  }
  return result;
}

function ellipsizeToHeight(node: HTMLElement, maxHeight: number): void {
  if (node.getBoundingClientRect().height <= maxHeight + 1) return;
  const characters = Array.from(node.textContent ?? "");
  let low = 0;
  let high = characters.length;
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    node.textContent = characters.slice(0, middle).join("") + "…";
    if (node.getBoundingClientRect().height <= maxHeight + 1) low = middle;
    else high = middle - 1;
  }
  // A literal glyph survives PNG foreignObject export, unlike CSS line-clamp.
  node.textContent = characters.slice(0, low).join("") + "…";
}

/** Trial layout stays invisible; only the final text and size enter the preview. */
async function fitContent(poster: HTMLElement, title: HTMLElement): Promise<void> {
  const host = element("div");
  Object.assign(host.style, { position: "fixed", left: "-12000px", top: "0", visibility: "hidden", width: "1080px" });
  host.append(poster);
  document.body.append(host);
  try {
    await document.fonts.ready;
    await Promise.all(Array.from(poster.querySelectorAll("img"), img => img.decode()));
    const probe = title.cloneNode(true) as HTMLElement;
    Object.assign(probe.style, { position: "absolute", width: "950.4px", visibility: "hidden" });
    title.parentElement!.append(probe);
    try {
      // B3's 26%-of-height limit includes the 4% + 3% horizontal-width padding.
      const available = 298.8;
      for (const size of [64.8, 60.48, 56.16, 51.84, 47.52]) {
        probe.style.fontSize = `${size}px`;
        if (probe.scrollHeight <= available + 1) break;
      }
      ellipsizeToHeight(probe, available);
      title.style.fontSize = probe.style.fontSize;
      title.textContent = probe.textContent;
    } finally { probe.remove(); }
    // Fit numbers independently so neither the icons nor the row can shrink.
    for (const value of poster.querySelectorAll<HTMLElement>(".bsp-d-stat-value")) {
      for (const size of [36.72, 34, 31, 28, 25]) {
        value.style.fontSize = `${size}px`;
        if (value.scrollWidth <= value.clientWidth + 1) break;
      }
    }
  } finally {
    poster.remove();
    host.remove();
  }
}

export async function createPoster(model: SharePoster, snapshot: GenerationSnapshot): Promise<HTMLElement> {
  if (model.coverUnavailable) throw new Error("封面暂时无法加载");
  const poster = element("article", "bsp-poster bsp-default-poster");
  const appearance = await coverAppearance(snapshot);
  poster.style.backgroundImage = `url("${appearance.background}")`;
  poster.style.backgroundSize = "100% 100%";
  poster.style.color = appearance.ink;
  poster.setAttribute("aria-label", `${model.title} 分享海报`);
  const style = element("style", "", posterStyles);
  const mast = element("header", "bsp-d-mast");
  mast.append(image("bsp-d-brand", posterAssets.brand, "哔哩哔哩"));
  const cover = image("bsp-d-cover", model.coverDataUrl, "原视频完整封面");
  const editorial = element("div", "bsp-d-editorial");
  const titleSpace = element("div", "bsp-d-title-space");
  const title = element("h4", "bsp-d-title", model.title);
  titleSpace.append(title);
  editorial.append(titleSpace);

  const footer = element("footer", "bsp-d-footer");
  const signature = element("div", "bsp-d-signature");
  const author = element("div", "bsp-d-author");
  const name = element("span", "bsp-d-name", model.uploader);
  author.append(image("bsp-d-up", posterAssets.up, "UP 主"), name);
  const stats = element("div", "bsp-d-stats");
  const statIcons = [
    svg("", '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3z"/></svg>'),
    image("", posterAssets.like), image("", posterAssets.coin), image("", posterAssets.favorite),
  ];
  model.stats.forEach((statistic, index) => {
    const cell = element("span", "bsp-d-stat");
    cell.setAttribute("aria-label", `${statistic.label} ${statistic.value}`);
    cell.append(statIcons[index], element("span", "bsp-d-stat-value", statistic.value));
    stats.append(cell);
  });
  const ids = element("div", "bsp-d-ids");
  const bv = element("span"); bv.append(element("b", "", "BV"), document.createTextNode(model.bvid.slice(2)));
  const av = element("span"); av.append(element("b", "", "av"), document.createTextNode(String(model.aid)));
  ids.append(bv, av);
  mast.append(ids);
  signature.append(author, stats);
  const qr = element("div", "bsp-d-qr");
  const frame = element("div", "bsp-d-qr-frame");
  const qrData = await QRCode.toDataURL(model.shareTarget, { width: 564, margin: 4, errorCorrectionLevel: "M", color: { dark: "#000000", light: "#ffffff" } });
  frame.append(image("bsp-d-qr-image", qrData, `二维码：${model.shareTarget}`));
  qr.append(frame, element("div", "bsp-d-qr-caption", "扫码观看"));
  footer.append(signature, qr);
  const linkFooter = element("div", "bsp-d-link-footer");
  const address = element("div", "bsp-d-address");
  address.append(svg("bsp-d-address-icon", '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M4.3 7.5h15.4M4.3 16.5h15.4"/></svg>'), element("span", "bsp-d-link", model.shareTarget));
  linkFooter.append(address);
  poster.append(style, mast, cover, editorial, footer, linkFooter);
  await fitContent(poster, title);
  return poster;
}

/** Export the exact measured preview layout without its display transform. */
export function exportPosterPng(poster: HTMLElement): Promise<string> {
  return toPng(poster, { width: 1080, height: 1440, pixelRatio: 1, cacheBust: false, style: { transform: "none" } });
}
