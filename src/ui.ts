import { toPng } from "html-to-image";
import QRCode from "qrcode";

import {
  captureAndPausePlayback,
  fetchGenerationResources,
  fetchValidatedShareTarget,
  readPageIdentity,
  restorePlayback,
  type PlaybackCapture,
} from "./bilibili";
import {
  copyCombinedPosterAndText,
  copyPosterPngToClipboard,
  copyShareTextToClipboard,
  describeCombinedCopyResult,
  describePosterCopyResult,
  describeTextCopyResult,
} from "./clipboard";
import { buildPosterFilename, buildSharePoster, type GenerationSnapshot, type SharePoster } from "./domain";
import {
  canEnablePartShare,
  canEnableTimestampShare,
  createDefaultShareOptions,
  createPanelShareOptions,
  togglePartShare,
  toggleTimestampShare,
  type PosterTheme,
  type ShareOptions,
} from "./options";
import { buildShareText } from "./share-text";
import { buildCanonicalShareTarget, type ShareTargetSelection } from "./share-target";

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

function posterQrDataUrl(shareTarget: string): Promise<string> {
  return QRCode.toDataURL(shareTarget, { width: 234, margin: 4, errorCorrectionLevel: "M", color: { dark: "#000000", light: "#ffffff" } });
}

async function createPoster(model: SharePoster): Promise<HTMLElement> {
  if (model.theme === "B") return createPosterB(model);
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

  const cover = element("img", "bsp-cover-b");
  cover.src = model.coverDataUrl;
  cover.alt = "";
  poster.append(cover);

  const scrim = element("div", "bsp-b-scrim");
  const content = element("div", "bsp-b-content");
  content.append(scrim);

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


export class SharePanel {
  private readonly backdrop = element("div", "bsp-backdrop");
  private readonly panel = element("section", "bsp-panel");
  private readonly previewPane = element("div", "bsp-preview-pane");
  private readonly controls = element("div", "bsp-controls");
  private capture: PlaybackCapture | null = null;
  private snapshot: GenerationSnapshot | null = null;
  private model: SharePoster | null = null;
  private poster: HTMLElement | null = null;
  private options: ShareOptions = createDefaultShareOptions();
  private targetSelection: ShareTargetSelection | null = null;
  private closed = false;
  private loading = false;
  private updating = false;
  private exportButtons: HTMLButtonElement[] = [];
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
    this.options = createPanelShareOptions(
      typeof GM_getValue === "function" ? GM_getValue("bsp-panel-preferences", null) : null,
    );
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
      const model = buildSharePoster(snapshot, targetSelection.shareTarget, this.options);
      const poster = await createPoster(model);
      if (this.closed) return;
      this.snapshot = snapshot;
      this.model = model;
      this.poster = poster;
      this.targetSelection = targetSelection; this.renderReady(model, poster, targetSelection);
    } catch (error) {
      if (!this.closed) this.renderError(error, false);
    } finally {
      this.loading = false;
    }
  }

  private renderReady(model: SharePoster, poster: HTMLElement, targetSelection: ShareTargetSelection): void {
    const frame = element("div", "bsp-preview-frame");
    frame.append(poster);
    this.previewPane.replaceChildren(frame); this.applyThemeClasses(model.theme); this.updating = false; this.exportButtons = []; if (!this.snapshot) return; const snapshot = this.snapshot;

    const snapshotBox = element("div", "bsp-snapshot");
    appendRow(snapshotBox, "主题", model.theme === "A" ? "A · 报刊信息卡" : "B · 沉浸封面");
    appendRow(snapshotBox, "链接", targetSelection.source === "short" ? "已校验短链" : "规范长链接（降级）");
    appendRow(snapshotBox, "落点", model.shareTarget);
    appendRow(snapshotBox, "画布", "1080 × 1440 PNG");
    appendRow(snapshotBox, "播放状态", "已为生成暂停"); const shareText = buildShareText(snapshot, model.shareTarget, this.options); const textPreview = element("pre", "bsp-text-preview", shareText); textPreview.setAttribute("aria-label", "分享文案预览");
    const actions = element("div", "bsp-actions"); const help = element("p", "bsp-help", "预览、复制和下载使用同一已生成海报；关闭面板后，仅恢复此前正在播放的同一视频。"); const status: HTMLElement = element("p", "bsp-status");
    const download = element("button", "bsp-button bsp-button-secondary", "下载 PNG");
    download.type = "button";
    download.addEventListener("click", () => void this.download(download, status));
    status.setAttribute("role", "status");
    const copy = element("button", "bsp-button bsp-button-primary", "复制海报"); copy.type = "button"; copy.addEventListener("click", () => void this.copyPoster(copy, status, help)); const copyTextButton = element("button", "bsp-button bsp-button-secondary", "复制文案"); copyTextButton.type = "button"; copyTextButton.addEventListener("click", () => void this.copyShareText(copyTextButton, shareText, status, help)); const combinedButton = element("button", "bsp-button bsp-button-secondary", "组合复制"); combinedButton.type = "button"; combinedButton.addEventListener("click", () => void this.copyCombined(combinedButton, shareText, status, help));
    actions.append(copy, download, copyTextButton, combinedButton, help, status); this.exportButtons.push(copy, download, copyTextButton, combinedButton); const themePicker = this.renderThemePicker(); const optionControls = this.renderShareOptions();
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
    content.push(themePicker, optionControls, textPreview, snapshotBox, actions);
    this.controls.replaceChildren(...content);
  }

  private optionToggle(
    labelText: string,
    description: string,
    checked: boolean,
    disabled: boolean,
    onChange: (checked: boolean) => void,
  ): HTMLLabelElement {
    const label = element("label", "bsp-option");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = checked;
    input.disabled = disabled;
    input.addEventListener("change", () => onChange(input.checked));
    label.append(input, element("span", "bsp-option-label", labelText), element("small", "", description));
    return label;
  }

  private renderShareOptions(): HTMLElement {
    const container = element("div", "bsp-options");
    const snapshot = this.snapshot;
    if (!snapshot) return container;

    container.append(
      this.optionToggle("分P分享", "分享当前分P", this.options.partShare, !canEnablePartShare(snapshot) || this.updating, (checked) => {
        void checked;
        this.applyOptions(togglePartShare(this.options, snapshot));
      }),
      this.optionToggle("时间戳", "从当前播放位置开始", this.options.timestampShare, !canEnableTimestampShare(snapshot) || this.updating, (checked) => {
        void checked;
        this.applyOptions(toggleTimestampShare(this.options, snapshot));
      }),
      this.optionToggle("详细文案", "统计与身份信息", this.options.detailedText, this.updating, (checked) => {
        this.applyOptions({ ...this.options, detailedText: checked });
      }),
      this.optionToggle("Markdown", "Markdown 格式文案", this.options.markdownText, this.updating, (checked) => {
        this.applyOptions({ ...this.options, markdownText: checked });
      }),
    );

    if (!snapshot.partIdentified) {
      const notice = element("p", "bsp-option-notice", "当前分P无法识别，已禁用分P与时间戳分享；默认分享仍可用。");
      container.append(notice);
    } else if (Math.floor(snapshot.playbackSeconds) < 1) {
      const notice = element("p", "bsp-option-notice", "当前播放位置不足 1 秒，时间戳分享不可用。");
      container.append(notice);
    }

    return container;
  }

  private renderThemePicker(): HTMLElement {
    const picker = element("div", "bsp-theme-picker");
    picker.setAttribute("role", "group");
    picker.setAttribute("aria-label", "海报主题");
    const label = element("span", "bsp-theme-picker-label", "海报主题");
    const buttonA = element("button", "bsp-theme-button", "A 报刊信息卡");
    buttonA.type = "button";
    buttonA.disabled = this.updating;
    buttonA.classList.toggle("is-active", this.options.theme === "A");
    buttonA.addEventListener("click", () => this.applyTheme("A"));
    const buttonB = element("button", "bsp-theme-button", "B 沉浸封面");
    buttonB.type = "button";
    buttonB.disabled = this.updating;
    buttonB.classList.toggle("is-active", this.options.theme === "B");
    buttonB.addEventListener("click", () => this.applyTheme("B"));
    picker.append(label, buttonA, buttonB);
    return picker;
  }

  private applyTheme(theme: PosterTheme): void {
    if (this.updating || this.options.theme === theme || !this.model || !this.poster || !this.targetSelection) return;
    this.options = { ...this.options, theme };
    this.persistPreferences();
    void this.rebuildPosterForTheme();
  }

  private async rebuildPosterForTheme(): Promise<void> {
    if (!this.snapshot || !this.targetSelection || this.updating) return;
    this.updating = true;
    this.setExportButtonsDisabled(true);
    this.showUpdatingOverlay();
    try {
      const model = buildSharePoster(this.snapshot, this.targetSelection.shareTarget, this.options);
      const poster = await createPoster(model);
      if (this.closed) return;
      this.model = model;
      this.poster = poster;
      this.renderReady(model, poster, this.targetSelection);
    } catch (error) {
      if (!this.closed) this.renderError(error, false);
    }
  }

  private applyThemeClasses(theme: PosterTheme): void {
    const isB = theme === "B";
    this.backdrop.classList.toggle("bsp-theme-b", isB);
    this.panel.classList.toggle("bsp-theme-b", isB);
    document.getElementById("bsp-entry")?.classList.toggle("bsp-entry-b", isB);
  }


  private applyOptions(next: ShareOptions): void {
    if (!this.snapshot || this.updating) return;
    const previous = this.options;
    const targetChanged = previous.partShare !== next.partShare || previous.timestampShare !== next.timestampShare;
    const textChanged = previous.detailedText !== next.detailedText || previous.markdownText !== next.markdownText;
    this.options = next;
    if (textChanged) this.persistPreferences();
    if (targetChanged) {
      void this.rebuildPosterForOptions();
      return;
    }
    if (textChanged && this.model && this.poster && this.targetSelection) {
      this.renderReady(this.model, this.poster, this.targetSelection);
    }
  }

  private persistPreferences(): void {
    if (typeof GM_setValue !== "function") return;
    GM_setValue("bsp-panel-preferences", {
      theme: this.options.theme,
      detailedText: this.options.detailedText,
      markdownText: this.options.markdownText,
    });
  }

  private async rebuildPosterForOptions(): Promise<void> {
    if (!this.snapshot || this.updating) return;
    this.updating = true;
    this.setExportButtonsDisabled(true);
    this.showUpdatingOverlay();
    try {
      const canonicalTarget = buildCanonicalShareTarget(this.snapshot.bvid, this.snapshot, this.options);
      const targetSelection = await fetchValidatedShareTarget(this.snapshot, canonicalTarget);
      const model = buildSharePoster(this.snapshot, targetSelection.shareTarget, this.options);
      const poster = await createPoster(model);
      if (this.closed) return;
      this.model = model;
      this.poster = poster;
      this.targetSelection = targetSelection;
      this.renderReady(model, poster, targetSelection);
    } catch (error) {
      if (!this.closed) this.renderError(error, false);
    }
  }

  private setExportButtonsDisabled(disabled: boolean): void {
    for (const button of this.exportButtons) button.disabled = disabled;
  }

  private showUpdatingOverlay(): void {
    const frame = this.previewPane.querySelector(".bsp-preview-frame");
    if (!frame || frame.querySelector(".bsp-poster-updating")) return;
    frame.append(element("div", "bsp-poster-updating", "正在更新…"));
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

  private async posterPngDataUrl(): Promise<string> {
    if (!this.poster || !this.model) throw new Error("海报预览尚未生成");
    const sourceWidth = this.poster.offsetWidth;
    const sourceHeight = this.poster.offsetHeight;
    const sourcePixelRatio = this.model.dimensions.width / sourceWidth;
    if (Math.round(sourceHeight * sourcePixelRatio) !== this.model.dimensions.height) throw new Error("海报画布比例不一致");
    const backgroundColor = this.model.theme === "B" ? "#000000" : "#f7f5f0";
    return toPng(this.poster, { width: sourceWidth, height: sourceHeight, pixelRatio: sourcePixelRatio, cacheBust: false, backgroundColor });
  }

  private async copyPoster(button: HTMLButtonElement, status: HTMLElement, help: HTMLElement): Promise<void> {
    if (!this.poster || !this.model) return;
    button.disabled = true;
    button.textContent = "正在复制海报…";
    status.textContent = "";
    try {
      const dataUrl = await this.posterPngDataUrl();
      const outcome = await copyPosterPngToClipboard(dataUrl);
      const feedback = describePosterCopyResult(outcome);
      status.textContent = feedback.statusMessage;
      help.textContent = feedback.helpMessage;
    } catch {
      status.textContent = "海报复制失败。";
      help.textContent = "请改用“下载 PNG”保存图片。";
    } finally {
      button.disabled = false;
      button.textContent = "复制海报";
    }
  }

  private async copyShareText(button: HTMLButtonElement, text: string, status: HTMLElement, help: HTMLElement): Promise<void> {
    button.disabled = true;
    button.textContent = "正在复制文案…";
    status.textContent = "";
    try {
      const feedback = describeTextCopyResult(await copyShareTextToClipboard(text));
      status.textContent = feedback.statusMessage;
      help.textContent = feedback.helpMessage;
    } catch {
      status.textContent = "文案复制失败。";
      help.textContent = "文案仍在上方，可手动全选复制。";
    } finally {
      button.disabled = false;
      button.textContent = "复制文案";
    }
  }

  private async copyCombined(button: HTMLButtonElement, text: string, status: HTMLElement, help: HTMLElement): Promise<void> {
    if (!this.poster || !this.model) return;
    button.disabled = true;
    button.textContent = "正在组合复制…";
    status.textContent = "";
    try {
      const dataUrl = await this.posterPngDataUrl();
      const feedback = describeCombinedCopyResult(await copyCombinedPosterAndText(dataUrl, text));
      status.textContent = feedback.statusMessage;
      help.textContent = feedback.helpMessage;
    } catch {
      status.textContent = "组合复制失败。";
      help.textContent = "海报请使用“复制海报”或“下载 PNG”；文案仍在上方，可手动全选复制。";
    } finally {
      button.disabled = false;
      button.textContent = "组合复制";
    }
  }




  private async download(button: HTMLButtonElement, status: HTMLElement): Promise<void> {
    if (!this.poster || !this.snapshot || !this.model) return;
    button.disabled = true;
    button.textContent = "正在生成 PNG…";
    status.textContent = "";
    try {
      const dataUrl = await this.posterPngDataUrl();
      // 尺寸与导出比例统一由 posterPngDataUrl 解析。
      // 海报画布比例校验与 toPng 导出集中在 posterPngDataUrl。
      // 复制与下载均从同一 poster 节点生成同一尺寸 PNG。
      // dataUrl 来自共享的 posterPngDataUrl。
      const link = document.createElement("a");
      link.download = buildPosterFilename(this.snapshot.bvid, new Date(), this.options.partShare ? this.snapshot.partNumber : null);
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
