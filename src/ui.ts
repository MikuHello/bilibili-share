import { toPng } from "html-to-image";
import QRCode from "qrcode";

import {
  captureAndPausePlayback,
  fetchGenerationResources,
  readPageIdentity,
  restorePlayback,
  type PlaybackCapture,
} from "./bilibili";
import { buildDefaultPoster, buildPosterFilename, type DefaultPoster, type GenerationSnapshot } from "./domain";
import type { ShareTargetSelection } from "./share-target";

function element<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function appendRow(parent: HTMLElement, label: string, value: string): void {
  const row = element("div", "bsp-snapshot-row");
  row.append(element("span", "", label), element("strong", "", value));
  parent.append(row);
}

async function createPoster(model: DefaultPoster): Promise<HTMLElement> {
  const poster = element("article", "bsp-poster");
  poster.setAttribute("aria-label", `${model.title} 分享海报`);

  const masthead = element("header", "bsp-masthead");
  masthead.append(element("strong", "", "BILIBILI 分享海报"), element("span", "", "SHARE CARD"));
  const cover = element("img", "bsp-cover");
  cover.src = model.coverDataUrl;
  cover.alt = "";
  const title = element("h4", "bsp-poster-title", model.title);
  title.style.setProperty("-webkit-line-clamp", model.titleLines.toString());
  const byline = element("div", "bsp-byline");
  byline.append(element("strong", "", `UP 主 · ${model.uploader}`), element("span", "bsp-identity", model.identity));

  const stats = element("div", "bsp-stats");
  for (const statistic of model.stats) {
    const cell = element("div", "bsp-stat");
    cell.append(element("strong", "", statistic.value), element("span", "", statistic.label));
    stats.append(cell);
  }

  const destination = element("div", "bsp-destination");
  const qr = element("img", "bsp-qr");
  qr.alt = `二维码：${model.qrTarget}`;
  qr.src = await QRCode.toDataURL(model.qrTarget, { width: 234, margin: 4, errorCorrectionLevel: "M", color: { dark: "#000000", light: "#ffffff" } });
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
    stats,
    destination,
  } satisfies Record<DefaultPoster["contentOrder"][number], HTMLElement>;
  for (const section of model.contentOrder) poster.append(content[section]);
  poster.append(element("span", "bsp-archive", `ARCHIVE · ${model.identity}`));
  return poster;
}

export class SharePanel {
  private readonly backdrop = element("div", "bsp-backdrop");
  private readonly panel = element("section", "bsp-panel");
  private readonly previewPane = element("div", "bsp-preview-pane");
  private readonly controls = element("div", "bsp-controls");
  private capture: PlaybackCapture | null = null;
  private snapshot: GenerationSnapshot | null = null;
  private model: DefaultPoster | null = null;
  private poster: HTMLElement | null = null;
  private closed = false;
  private loading = false;
  private readonly onClosed: () => void;

  constructor(onClosed: () => void) {
    this.onClosed = onClosed;
    this.backdrop.setAttribute("role", "presentation");
    this.panel.setAttribute("role", "dialog");
    this.panel.setAttribute("aria-modal", "true");
    this.panel.setAttribute("aria-labelledby", "bsp-dialog-title");
    this.panel.tabIndex = -1;

    const heading = element("header", "bsp-panel-head");
    const headingText = element("div");
    headingText.append(element("p", "bsp-kicker", "BILIBILI · POSTER WORKSPACE"));
    const title = element("h2", "bsp-panel-title", "生成分享海报");
    title.id = "bsp-dialog-title";
    headingText.append(title);
    const close = element("button", "bsp-close", "×");
    close.type = "button";
    close.setAttribute("aria-label", "关闭分享面板");
    close.addEventListener("click", () => this.close(true));
    heading.append(headingText, close);

    const workspace = element("div", "bsp-workspace");
    workspace.append(this.previewPane, this.controls);
    this.panel.append(heading, workspace);
    this.backdrop.append(this.panel);
    this.backdrop.addEventListener("click", (event) => {
      if (event.target === this.backdrop) this.close(true);
    });
    this.onKeyDown = this.onKeyDown.bind(this);
  }

  open(): void {
    document.body.append(this.backdrop);
    document.addEventListener("keydown", this.onKeyDown, true);
    this.renderLoading();
    this.panel.focus();
    void this.captureThenLoad();
  }

  focus(): void {
    this.panel.focus();
  }

  matchesCurrentPage(): boolean {
    if (!this.capture) return true;
    const current = readPageIdentity();
    return Boolean(current && current.bvid.toUpperCase() === this.capture.bvid.toUpperCase() && current.partNumber === this.capture.partNumber);
  }

  close(restore: boolean): void {
    if (this.closed) return;
    this.closed = true;
    document.removeEventListener("keydown", this.onKeyDown, true);
    this.backdrop.remove();
    if (restore && this.capture) restorePlayback(this.capture);
    this.onClosed();
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      event.preventDefault();
      this.close(true);
    }
  }

  private renderLoading(): void {
    this.previewPane.replaceChildren();
    const loading = element("div", "bsp-loading-card");
    const message = element("div");
    message.append(element("div", "bsp-spinner"), element("div", "", "正在捕获视频信息…"));
    loading.append(message);
    this.previewPane.append(loading);

    this.controls.replaceChildren(
      element("p", "bsp-step", "01 / GENERATION SNAPSHOT"),
      element("h3", "", "正在建立稳定快照"),
      element("p", "", "播放器暂停后，视频身份、播放位置与公开统计会固定在这一次生成中。"),
    );
  }

  private async captureThenLoad(): Promise<void> {
    try {
      this.capture = captureAndPausePlayback();
    } catch (error) {
      this.renderError(error, true);
      return;
    }
    await this.loadSnapshot();
  }

  private async loadSnapshot(): Promise<void> {
    if (!this.capture || this.loading) return;
    this.loading = true;
    try {
      const { snapshot, targetSelection } = await fetchGenerationResources(this.capture);
      const model = buildDefaultPoster(snapshot, targetSelection.shareTarget);
      const poster = await createPoster(model);
      if (this.closed) return;
      this.snapshot = snapshot;
      this.model = model;
      this.poster = poster;
      this.renderReady(model, poster, targetSelection);
    } catch (error) {
      if (!this.closed) this.renderError(error, false);
    } finally {
      this.loading = false;
    }
  }

  private renderReady(model: DefaultPoster, poster: HTMLElement, targetSelection: ShareTargetSelection): void {
    const frame = element("div", "bsp-preview-frame");
    frame.append(poster);
    this.previewPane.replaceChildren(frame);

    const snapshotBox = element("div", "bsp-snapshot");
    appendRow(snapshotBox, "主题", "A · 报刊信息卡");
    appendRow(snapshotBox, "链接", targetSelection.source === "short" ? "已校验短链" : "规范长链接（降级）");
    appendRow(snapshotBox, "落点", model.shareTarget);
    appendRow(snapshotBox, "画布", "1080 × 1440 PNG");
    appendRow(snapshotBox, "播放状态", "已为生成暂停");
    const actions = element("div", "bsp-actions");
    const download = element("button", "bsp-button", "下载 PNG");
    download.type = "button";
    download.addEventListener("click", () => void this.download(download, status));
    const status = element("p", "bsp-status");
    status.setAttribute("role", "status");
    actions.append(download, element("p", "bsp-help", "预览与下载使用同一海报节点；关闭面板后，仅恢复此前正在播放的同一视频。"), status);
    const summary =
      targetSelection.source === "short"
        ? "本次使用经过落点校验的 b23.tv 短链接。二维码与可见链接指向完全相同的视频。"
        : "短链未通过校验，本次已统一改用规范长链接。二维码、可见链接与下载海报仍然可用。";
    const content: HTMLElement[] = [
      element("p", "bsp-step", "02 / DEFAULT SHARE"),
      element("h3", "", "海报已经生成"),
      element("p", "", summary),
    ];
    if (targetSelection.source === "canonical-fallback") {
      const fallback = element("div", "bsp-fallback");
      fallback.setAttribute("role", "status");
      fallback.append(
        element("strong", "", "短链不可用，已使用规范长链接"),
        element("span", "", `原因：${targetSelection.fallbackReason ?? "短链未通过校验"}。不会影响预览或下载。`),
      );
      content.push(fallback);
    }
    content.push(snapshotBox, actions);
    this.controls.replaceChildren(...content);
  }

  private renderError(error: unknown, retryCapture: boolean): void {
    const message = error instanceof Error ? error.message : "生成海报时发生未知错误。";
    this.previewPane.replaceChildren(element("div", "bsp-loading-card", "暂时无法生成预览"));
    const retry = element("button", "bsp-button", "重试");
    retry.type = "button";
    retry.addEventListener("click", () => {
      this.renderLoading();
      if (retryCapture) void this.captureThenLoad();
      else void this.loadSnapshot();
    });
    this.controls.replaceChildren(
      element("p", "bsp-step", "GENERATION BLOCKED"),
      element("h3", "", "海报尚未生成"),
      element("p", "bsp-error", message),
      retry,
      element("p", "bsp-help", retryCapture ? "请确认主播放器已经加载，再重试。" : "重试会保留最初捕获的视频、分P和播放位置，只重新获取生成所需资源。"),
    );
  }

  private async download(button: HTMLButtonElement, status: HTMLElement): Promise<void> {
    if (!this.poster || !this.snapshot || !this.model) return;
    button.disabled = true;
    button.textContent = "正在生成 PNG…";
    status.textContent = "";
    try {
      const width = this.poster.offsetWidth;
      const height = this.poster.offsetHeight;
      const pixelRatio = this.model.dimensions.width / width;
      if (Math.round(height * pixelRatio) !== this.model.dimensions.height) throw new Error("海报画布比例不一致");
      const dataUrl = await toPng(this.poster, { width, height, pixelRatio, cacheBust: false, backgroundColor: "#f7f5f0" });
      const link = document.createElement("a");
      link.download = buildPosterFilename(this.snapshot.bvid, new Date());
      link.href = dataUrl;
      link.click();
      status.textContent = "PNG 已下载。";
    } catch {
      status.textContent = "PNG 生成失败，预览仍保留；请重试下载。";
    } finally {
      button.disabled = false;
      button.textContent = "下载 PNG";
    }
  }
}
