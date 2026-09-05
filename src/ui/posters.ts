import QRCode from "qrcode";
import { toPng } from "html-to-image";

import type { SharePoster } from "../domain";
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

function clampText(node: HTMLElement, lines: number): void {
  Object.assign(node.style, { display: "-webkit-box", webkitBoxOrient: "vertical", webkitLineClamp: String(lines), overflow: "hidden" });
}

/** Measure complete strings in the actual browser, after link height is settled. */
async function fitContent(poster: HTMLElement, title: HTMLElement, name: HTMLElement): Promise<void> {
  const host = element("div");
  Object.assign(host.style, { position: "fixed", left: "-12000px", top: "0", visibility: "hidden", width: "1080px" });
  host.append(poster);
  document.body.append(host);
  try {
    await document.fonts.ready;
    await Promise.all(Array.from(poster.querySelectorAll("img"), img => img.decode()));
    const available = title.parentElement!.clientHeight;
    let titleSize = 48;
    for (const size of [64, 60, 56, 52, 48]) {
      title.style.fontSize = `${size}px`;
      titleSize = size;
      if (title.scrollHeight <= available + 1) break;
    }
    if (title.scrollHeight > available + 1) clampText(title, Math.max(1, Math.floor(available / (titleSize * 1.28))));
    for (const size of [34, 32, 30]) {
      name.style.fontSize = `${size}px`;
      if (name.getBoundingClientRect().height <= size * 1.25 * 2 + 1) break;
    }
    clampText(name, 2);
  } finally {
    poster.remove();
    host.remove();
  }
}

export async function createPoster(model: SharePoster): Promise<HTMLElement> {
  if (model.coverUnavailable) throw new Error("封面暂时无法加载");
  const poster = element("article", "bsp-poster bsp-default-poster");
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
    cell.append(statIcons[index], document.createTextNode(statistic.value));
    stats.append(cell);
  });
  const ids = element("div", "bsp-d-ids");
  const bv = element("span"); bv.append(element("b", "", "BV"), document.createTextNode(model.bvid.slice(2)));
  const av = element("span"); av.append(element("b", "", "AV"), document.createTextNode(String(model.aid)));
  ids.append(bv, av);
  signature.append(author, stats, ids);
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
  await fitContent(poster, title, name);
  return poster;
}

/** Export the exact measured preview layout without its display transform. */
export function exportPosterPng(poster: HTMLElement): Promise<string> {
  return toPng(poster, { width: 1080, height: 1440, pixelRatio: 1, cacheBust: false, backgroundColor: "#dce8e7", style: { transform: "none" } });
}
