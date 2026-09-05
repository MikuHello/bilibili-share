import { toPng } from "html-to-image";

import {
  captureAndPausePlayback,
  fetchGenerationResources,
  fetchValidatedShareTarget,
  readPageIdentity,
  restorePlayback,
  type PlaybackCapture,
} from "../bilibili";
import {
  copyCombinedPosterAndText,
  copyPosterPngToClipboard,
  copyShareTextToClipboard,
  describeCombinedCopyResult,
  describePosterCopyResult,
  describeTextCopyResult,
} from "../clipboard";
import { buildPosterFilename, buildSharePoster, type GenerationSnapshot, type SharePoster } from "../domain";
import {
  canEnablePartShare,
  canEnableTimestampShare,
  createDefaultShareOptions,
  createPanelShareOptions,
  loadRememberedPreferences,
  togglePartShare,
  toggleTimestampShare,
  type PosterTheme,
  type ShareOptions,
} from "../options";
import { buildShareText } from "../share-text";
import { buildCanonicalShareTarget, type ShareTargetSelection } from "../share-target";
import { element } from "./dom";
import { statusDismissDelay } from "./feedback";
import { MOTION, motionDelay } from "./motion";
import { setEntryTheme } from "./entry";
import { createIcon, type IconName } from "./icons";
import { createPoster } from "./posters";
import { selectThemeSurfaceClasses } from "./tokens";
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
  private statusTimer = 0;
  private readonly previewObserver = new ResizeObserver(() => this.fitPoster());
  private readonly onClosed: () => void;

  constructor(onClosed: () => void) {
    this.onClosed = onClosed;
    this.backdrop.setAttribute("role", "presentation");
    this.panel.setAttribute("role", "dialog");
    this.panel.setAttribute("aria-modal", "true");
    this.panel.setAttribute("aria-labelledby", "bsp-dialog-title");
    this.panel.tabIndex = -1;

    const heading = element("header", "bsp-panel-head");
    const eyebrow = element("span", "bsp-eyebrow", "BILIBILI SHARE");
    eyebrow.id = "bsp-dialog-title";
    const close = element("button", "bsp-close", "×");
    close.type = "button";
    close.setAttribute("aria-label", "关闭分享面板");
    close.addEventListener("click", () => this.close(true));
    heading.append(eyebrow, close);

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
    this.options = createPanelShareOptions(loadRememberedPreferences());
    this.applyThemeClasses(this.options.theme);
    document.body.append(this.backdrop);
    this.previewObserver.observe(this.previewPane);
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
    clearTimeout(this.statusTimer);
    this.previewObserver.disconnect();
    document.removeEventListener("keydown", this.onKeyDown, true);
    this.backdrop.classList.add("bsp-backdrop-closing");
    this.panel.classList.add("bsp-panel-closing");
    window.setTimeout(() => {
      this.backdrop.remove();
      if (restore && this.capture) restorePlayback(this.capture);
      this.onClosed();
    }, motionDelay(MOTION.fast));
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
      element("h3", "", "正在生成海报"),
      element("p", "", "正在读取封面与视频信息…"),
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
      this.targetSelection = targetSelection;
      this.renderReady(model, poster, targetSelection);
    } catch (error) {
      if (!this.closed) this.renderError(error, false);
    } finally {
      this.loading = false;
    }
  }

  private renderReady(model: SharePoster, poster: HTMLElement, targetSelection: ShareTargetSelection): void {
    if (!this.previewPane.contains(poster)) {
      const frame = element("div", "bsp-preview-frame");
      frame.append(poster);
      this.previewPane.replaceChildren(frame);
    }
    this.fitPoster();
    this.applyThemeClasses(model.theme);
    this.updating = false;
    this.exportButtons = [];
    clearTimeout(this.statusTimer);
    if (!this.snapshot) return;
    const snapshot = this.snapshot;

    const shareText = buildShareText(snapshot, model.shareTarget, this.options);
    const actions = element("div", "bsp-actions");
    const status: HTMLElement = element("p", "bsp-status");
    status.setAttribute("role", "status");
    const copy = this.actionButton("copy", "复制海报", "复制海报", true, () => void this.copyPoster(copy, status));
    const download = this.actionButton("download", "", "下载海报", false, () => void this.download(download, status));
    const copyTextButton = this.actionButton("copy-text", "", "复制文案", false, () => void this.copyShareText(copyTextButton, shareText, status));
    const combinedButton = this.actionButton("combined", "海报+文案", "复制海报与文案的兼容格式", false, () => void this.copyCombined(combinedButton, shareText, status));
    copyTextButton.classList.add("bsp-text-copy");
    const textPreview = this.renderTextPreview(shareText);
    textPreview.append(copyTextButton);
    actions.append(copy, download, combinedButton);
    this.exportButtons.push(copy, download, copyTextButton, combinedButton);

    const content: HTMLElement[] = [this.renderThemePicker(), this.renderShareOptions()];
    if (targetSelection.source === "canonical-fallback") {
      const fallback = element("div", "bsp-fallback");
      fallback.setAttribute("role", "status");
      fallback.append(
        element("strong", "", "短链不可用，已使用规范长链接"),
        element("span", "", `原因：${targetSelection.fallbackReason ?? "短链未通过校验"}。不会影响预览或下载。`),
      );
      content.push(fallback);
    }
    content.push(textPreview, actions, status);
    const focused = document.activeElement instanceof HTMLButtonElement && this.controls.contains(document.activeElement)
      ? document.activeElement.getAttribute("aria-label") ?? document.activeElement.textContent
      : null;
    this.controls.replaceChildren(...content);
    if (focused) {
      Array.from(this.controls.querySelectorAll("button"))
        .find((button) => (button.getAttribute("aria-label") ?? button.textContent) === focused)
        ?.focus({ preventScroll: true });
    }
  }

  private renderTextPreview(shareText: string): HTMLElement {
    const lines = shareText.split("\n");
    const link = lines.pop() ?? "";
    const body = lines.join("\n");
    const card = element("div", "bsp-text-card");
    const content = element("div", "bsp-text-content");
    content.setAttribute("aria-label", "分享文案预览");
    content.tabIndex = 0;
    content.append(
      element("span", "bsp-text-card-body", body + (lines.length ? "\n" : "")),
      element("span", "bsp-text-card-link", link),
    );
    card.append(content);
    return card;
  }

  private actionButton(
    iconName: IconName,
    label: string,
    tip: string,
    primary: boolean,
    onClick: () => void,
  ): HTMLButtonElement {
    const button = element("button", primary ? "bsp-action bsp-action-primary" : "bsp-action", label);
    button.type = "button";
    button.dataset.tip = tip;
    button.setAttribute("aria-label", tip);
    button.prepend(createIcon(iconName));
    button.addEventListener("click", onClick);
    return button;
  }

  private clearStatus(status: HTMLElement): void {
    clearTimeout(this.statusTimer);
    status.textContent = "";
    status.classList.remove("is-show", "is-error");
  }

  private showStatus(message: string, error = false): void {
    const status = this.controls.querySelector<HTMLElement>(".bsp-status");
    if (!status) return;
    clearTimeout(this.statusTimer);
    status.textContent = message;
    status.classList.toggle("is-error", error);
    status.classList.add("is-show");
    const delay = statusDismissDelay(error);
    if (delay !== null) this.statusTimer = window.setTimeout(() => status.classList.remove("is-show"), delay);
  }

  private optionToggle(
    iconName: IconName,
    labelText: string,
    checked: boolean,
    disabled: boolean,
    onChange: (checked: boolean) => void,
  ): HTMLButtonElement {
    const button = element("button", "bsp-option-pill", labelText);
    button.type = "button";
    button.disabled = disabled;
    button.setAttribute("aria-pressed", String(checked));
    button.classList.toggle("is-on", checked);
    button.addEventListener("click", () => onChange(button.getAttribute("aria-pressed") !== "true"));
    button.prepend(createIcon(iconName));
    return button;
  }

  private renderShareOptions(): HTMLElement {
    const container = element("div", "bsp-options");
    const snapshot = this.snapshot;
    if (!snapshot) return container;

    container.append(
      this.optionToggle("list", "分P", this.options.partShare, !canEnablePartShare(snapshot) || this.updating, (checked) => {
        void checked;
        this.applyOptions(togglePartShare(this.options, snapshot));
      }),
      this.optionToggle("clock", "时间戳", this.options.timestampShare, !canEnableTimestampShare(snapshot) || this.updating, (checked) => {
        void checked;
        this.applyOptions(toggleTimestampShare(this.options, snapshot));
      }),
      this.optionToggle("detail", "详细", this.options.detailedText, this.updating, (checked) => {
        this.applyOptions({ ...this.options, detailedText: checked });
      }),
      this.optionToggle("markdown", "Markdown", this.options.markdownText, this.updating, (checked) => {
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
    const picker = element("div", "bsp-theme-segment");
    picker.setAttribute("role", "group");
    picker.setAttribute("aria-label", "海报主题");
    const buttonA = element("button", "bsp-theme-option", "A 报刊");
    buttonA.type = "button";
    buttonA.disabled = this.updating;
    buttonA.setAttribute("aria-pressed", String(this.options.theme === "A"));
    buttonA.classList.toggle("is-active", this.options.theme === "A");
    buttonA.addEventListener("click", () => this.applyTheme("A"));
    const buttonB = element("button", "bsp-theme-option", "B 沉浸");
    buttonB.type = "button";
    buttonB.disabled = this.updating;
    buttonB.setAttribute("aria-pressed", String(this.options.theme === "B"));
    buttonB.classList.toggle("is-active", this.options.theme === "B");
    buttonB.addEventListener("click", () => this.applyTheme("B"));
    picker.append(buttonA, buttonB);
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
    try {
      const model = buildSharePoster(this.snapshot, this.targetSelection.shareTarget, this.options);
      const poster = await createPoster(model);
      if (this.closed) return;
      this.model = model;
      this.poster = poster;
      this.applyThemeClasses(model.theme);
      await this.crossfadePoster(poster);
      if (!this.closed) this.renderReady(model, poster, this.targetSelection);
    } catch (error) {
      if (!this.closed) this.renderError(error, false);
    }
  }

  private async crossfadePoster(nextPoster: HTMLElement): Promise<void> {
    const oldFrame = this.previewPane.querySelector<HTMLElement>(".bsp-preview-frame");
    const nextFrame = element("div", "bsp-preview-frame bsp-preview-frame-incoming");
    nextFrame.append(nextPoster);
    this.previewPane.append(nextFrame);
    this.fitPoster();
    if (motionDelay(MOTION.fast)) {
      // Establish the transparent layer before starting its CSS transition.
      nextFrame.getBoundingClientRect();
    }
    oldFrame?.classList.add("bsp-preview-frame-exit");
    nextFrame.classList.add("is-visible");
    await new Promise((resolve) => setTimeout(resolve, motionDelay(MOTION.fast)));
    oldFrame?.remove();
    nextFrame.classList.remove("bsp-preview-frame-incoming", "is-visible");
  }

  private fitPoster(): void {
    for (const frame of this.previewPane.querySelectorAll<HTMLElement>(".bsp-preview-frame")) {
      const poster = frame.querySelector<HTMLElement>(".bsp-poster");
      if (poster) poster.style.transform = `scale(${Math.min(1, frame.clientWidth / 360)})`;
    }
  }

  private applyThemeClasses(theme: PosterTheme): void {
    const surface = selectThemeSurfaceClasses(theme);
    this.backdrop.classList.toggle("bsp-theme-b", surface.panel !== null);
    this.panel.classList.toggle("bsp-theme-b", surface.panel !== null);
    setEntryTheme(theme);
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
      const overlay = this.previewPane.querySelector<HTMLElement>(".bsp-poster-updating");
      const frame = this.previewPane.querySelector<HTMLElement>(".bsp-preview-frame");
      if (frame && overlay) {
        frame.replaceChildren(poster, overlay);
        this.fitPoster();
        overlay.classList.add("is-leaving");
        await new Promise((resolve) => setTimeout(resolve, motionDelay(MOTION.overlay)));
        overlay.remove();
      }
      if (!this.closed) this.renderReady(model, poster, targetSelection);
    } catch (error) {
      if (!this.closed) this.renderError(error, false);
    }
  }

  private setExportButtonsDisabled(disabled: boolean): void {
    for (const button of this.exportButtons) button.disabled = disabled;
    for (const button of this.controls.querySelectorAll<HTMLButtonElement>(".bsp-option-pill, .bsp-theme-option")) {
      if (disabled) button.disabled = true;
    }
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
    return toPng(this.poster, { width: sourceWidth, height: sourceHeight, pixelRatio: sourcePixelRatio, cacheBust: false, backgroundColor, style: { transform: "none" } });
  }

  private async copyPoster(button: HTMLButtonElement, status: HTMLElement): Promise<void> {
    if (!this.poster || !this.model) return;
    button.disabled = true;
    this.clearStatus(status);
    try {
      const dataUrl = await this.posterPngDataUrl();
      const outcome = await copyPosterPngToClipboard(dataUrl);
      const feedback = describePosterCopyResult(outcome);
      this.showStatus(
        outcome.status === "copied" ? feedback.statusMessage : `${feedback.statusMessage} ${feedback.helpMessage}`,
        outcome.status !== "copied",
      );
    } catch {
      this.showStatus("海报复制失败。请改用“下载”保存图片。", true);
    } finally {
      button.disabled = this.updating;
    }
  }

  private async copyShareText(button: HTMLButtonElement, text: string, status: HTMLElement): Promise<void> {
    button.disabled = true;
    this.clearStatus(status);
    try {
      const outcome = await copyShareTextToClipboard(text);
      const feedback = describeTextCopyResult(outcome);
      this.showStatus(
        outcome.status === "copied" ? feedback.statusMessage : `${feedback.statusMessage} ${feedback.helpMessage}`,
        outcome.status !== "copied",
      );
    } catch {
      this.showStatus("文案复制失败。文案仍在上方，可手动全选复制。", true);
    } finally {
      button.disabled = this.updating;
    }
  }

  private async copyCombined(button: HTMLButtonElement, text: string, status: HTMLElement): Promise<void> {
    if (!this.poster || !this.model) return;
    button.disabled = true;
    this.clearStatus(status);
    try {
      const dataUrl = await this.posterPngDataUrl();
      const outcome = await copyCombinedPosterAndText(dataUrl, text);
      const feedback = describeCombinedCopyResult(outcome);
      this.showStatus(`${feedback.statusMessage} ${feedback.helpMessage}`, outcome.status === "failed");
    } catch {
      this.showStatus("组合复制失败。海报请使用“复制海报”或“下载”；文案仍在上方，可手动全选复制。", true);
    } finally {
      button.disabled = this.updating;
    }
  }




  private async download(button: HTMLButtonElement, status: HTMLElement): Promise<void> {
    if (!this.poster || !this.snapshot || !this.model) return;
    button.disabled = true;
    this.clearStatus(status);
    try {
      const dataUrl = await this.posterPngDataUrl();
      const link = document.createElement("a");
      link.download = buildPosterFilename(this.snapshot.bvid, new Date(), this.options.partShare ? this.snapshot.partNumber : null);
      link.href = dataUrl;
      link.click();
      this.showStatus("PNG 已下载。");
    } catch {
      this.showStatus("PNG 生成失败，预览仍保留；请重试下载。", true);
    } finally {
      button.disabled = this.updating;
    }
  }
}
