import QRCode from "qrcode";

import type { SharePoster } from "../domain";
import { element } from "./dom";

function posterQrDataUrl(shareTarget: string): Promise<string> {
  return QRCode.toDataURL(shareTarget, { width: 234, margin: 4, errorCorrectionLevel: "M", color: { dark: "#000000", light: "#ffffff" } });
}

export async function createPoster(model: SharePoster): Promise<HTMLElement> {
  if (model.theme === "B") return createPosterB(model);
  const poster = element("article", "bsp-poster");
  poster.setAttribute("aria-label", `${model.title} 分享海报`);

  const masthead = element("header", "bsp-masthead");
  masthead.append(element("strong", "", "BILIBILI 分享海报"), element("span", "", "SHARE CARD"));
  const cover = model.coverUnavailable
      ? element("div", "bsp-cover bsp-cover-missing", "COVER UNAVAILABLE")
      : Object.assign(element("img", "bsp-cover"), { src: model.coverDataUrl, alt: "" });
  const title = element("h4", "bsp-poster-title", model.title);
  title.style.setProperty("-webkit-line-clamp", model.titleLines.toString());
  const byline = element("div", "bsp-byline");
  byline.append(element("strong", "", `UP 主 · ${model.uploader}`), element("span", "bsp-identity", model.identity)); const partTimestamp = element("div", "bsp-part-timestamp"); if (model.partLabel) partTimestamp.append(element("span", "bsp-part-chip", model.partLabel)); if (model.timestampLabel) partTimestamp.append(element("span", "bsp-time-chip", model.timestampLabel));

  const stats = element("div", "bsp-stats");
  for (const statistic of model.stats) {
    const cell = element("div", "bsp-stat");
    cell.append(element("strong", "", statistic.value), element("span", "", statistic.label));
    stats.append(cell);
  }

  const destination = element("div", "bsp-destination");
  const qr = element("img", "bsp-qr");
  qr.alt = `二维码：${model.shareTarget}`;
  qr.src = await posterQrDataUrl(model.shareTarget);
  const linkArea = element("div");
  const visibleLink = element("span", "bsp-link", model.shareTarget);
  visibleLink.style.overflowWrap = model.linkWrap;
  linkArea.append(element("span", "bsp-link-label", "扫码观看 · SHARE TARGET"), visibleLink);
  destination.append(qr, linkArea);

  poster.classList.add(`bsp-theme-${model.theme.toLowerCase()}`);
  poster.append(masthead);
  const content = {
    cover,
    title,
    "uploader-identity": byline,
      "part-timestamp": partTimestamp,
    stats,
    destination,
  } satisfies Record<SharePoster["contentOrder"][number], HTMLElement>;
  for (const section of model.contentOrder) poster.append(content[section]);
  poster.append(element("span", "bsp-archive", `ARCHIVE · ${model.identity}`));
  return poster;
}

async function createPosterB(model: SharePoster): Promise<HTMLElement> {
  const poster = element("article", "bsp-poster bsp-poster-b");
  poster.setAttribute("aria-label", `${model.title} 分享海报`);

  if (model.coverUnavailable) {
    poster.classList.add("bsp-cover-missing");
    poster.append(element("div", "bsp-b-cover-missing", "COVER UNAVAILABLE"));
  } else {
    const cover = Object.assign(element("img", "bsp-cover-b"), { src: model.coverDataUrl, alt: "" });
    poster.append(cover);
  }

  const scrim = element("div", "bsp-b-scrim");
  const content = element("div", "bsp-b-content");
  poster.append(scrim);

  const topLine = element("div", "bsp-b-topline");
  if (model.partLabel) topLine.append(element("span", "bsp-b-part-chip", model.partLabel));
  if (model.timestampLabel) topLine.append(element("span", "bsp-b-time-chip", model.timestampLabel));
  content.append(topLine);

  const bottom = element("div", "bsp-b-bottom");
  const title = element("h4", "bsp-b-title", model.title);
  title.style.setProperty("-webkit-line-clamp", model.titleLines.toString());
  title.style.fontSize = `${model.titleFontSize}px`;
  bottom.append(title, element("div", "bsp-b-up", `UP 主 · ${model.uploader}`));

  const stats = element("div", "bsp-b-stats");
  for (const statistic of model.stats) {
    const cell = element("div", "bsp-b-stat");
    cell.append(element("strong", "", statistic.value), element("span", "", statistic.label));
    stats.append(cell);
  }
  bottom.append(stats, element("div", "bsp-b-identity", model.identity));

  const destination = element("div", "bsp-b-destination");
  const qr = element("img", "bsp-b-qr");
  qr.alt = `二维码：${model.shareTarget}`;
  qr.src = await posterQrDataUrl(model.shareTarget);
  const linkSide = element("div", "bsp-b-link-side");
  const visibleLink = element("span", "bsp-b-link", model.shareTarget);
  visibleLink.style.overflowWrap = model.linkWrap;
  linkSide.append(element("span", "bsp-b-link-label", "扫码观看 · SHARE TARGET"), visibleLink);
  destination.append(qr, linkSide);
  bottom.append(destination);
  content.append(bottom);
  poster.append(content);
  return poster;
}


