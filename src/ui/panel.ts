import type { PageAppearance } from "./appearance";
import {
  captureAndPausePlayback,
  fetchGenerationSnapshot,
  readPageIdentity,
  restorePlayback,
  type PlaybackCapture,
} from "../bilibili";
import {
  copyPosterPngToClipboard,
  copyShareTextToClipboard,
  describePosterCopyResult,
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
  type ShareOptions,
} from "../options";
import { buildShareText } from "../share-text";
import { buildCanonicalShareTarget } from "../share-target";
import { element } from "./dom";
import { statusDismissDelay } from "./feedback";
import { MOTION, motionDelay } from "./motion";
import { createIcon, type IconName } from "./icons";
import { createPoster, exportPosterPng, updatePosterTarget } from "./posters";
export class SharePanel {
  private readonly backdrop = element("div", "bsp-backdrop");
  private readonly panel = element("section", "bsp-panel");
  private readonly previewPane = element("div", "bsp-preview-pane");
  private readonly controls = element("div", "bsp-controls");
  private readonly openedIdentity = readPageIdentity();
  private capture: PlaybackCapture | null = null;
  private snapshot: GenerationSnapshot | null = null;
  private model: SharePoster | null = null;
  private poster: HTMLElement | null = null;
  private options: ShareOptions = createDefaultShareOptions();
  private shareTarget: string | null = null;
  private closed = false;
  private loading = false;
  private updating = false;
  private exporting = false;
  private targetVersion = 0;
  private shareText = "";
  private markdownText = "";
  private exportButtons: { button: HTMLButtonElement; requiresPoster: boolean }[] = [];
  private statusTimer = 0;
  private readonly previewObserver = new ResizeObserver(() => this.fitPoster());
  private readonly onClosed: () => void;

  setAppearance(appearance: PageAppearance): void {
    this.backdrop.classList.toggle("bsp-appearance-dark", appearance === "dark");
  }

  constructor(onClosed: () => void) {
    this.onClosed = onClosed;
    this.backdrop.setAttribute("role", "presentation");
    this.panel.setAttribute("role", "dialog");
    this.panel.setAttribute("aria-modal", "true");
    this.panel.setAttribute("aria-labelledby", "bsp-dialog-title");
    this.panel.tabIndex = -1;

    const heading = element("header", "bsp-panel-head");
    const title = element("h2", "", "分享海报");
    title.id = "bsp-dialog-title";
    const close = element("button", "bsp-close");
    close.append(createIcon("close"));
    close.type = "button";
    close.setAttribute("aria-label", "关闭分享面板");
    close.addEventListener("click", () => this.close(true));
    heading.append(title, close);

    const workspace = element("div", "bsp-workspace");
    workspace.append(this.previewPane, this.controls);
    this.panel.append(heading, workspace);
    this.backdrop.append(this.panel);
    this.backdrop.addEventListener("click", (event) => {
      if (event.target === this.backdrop) this.close(true);
    });
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onFocusIn = this.onFocusIn.bind(this);
    this.previewPane.setAttribute("aria-label", "海报预览");
  }

  open(): void {
    this.options = createPanelShareOptions(loadRememberedPreferences());
    document.body.append(this.backdrop);
    this.previewObserver.observe(this.previewPane);
    document.addEventListener("keydown", this.onKeyDown, true);
    document.addEventListener("focusin", this.onFocusIn, true);
    this.renderLoading();
    this.panel.focus();
    void this.captureThenLoad();
  }

  focus(): void {
    this.panel.focus();
  }

  matchesCurrentPage(): boolean {
    const identity = this.capture ?? this.openedIdentity;
    const current = readPageIdentity();
    return Boolean(current && identity && current.bvid.toUpperCase() === identity.bvid.toUpperCase() && current.partNumber === identity.partNumber);
  }

  private ensureCurrentContext(): boolean {
    if (this.closed) return false;
    if (this.matchesCurrentPage()) return true;
    this.close(false);
    return false;
  }

  close(restore: boolean): void {
    if (this.closed) return;
    this.closed = true;
    this.targetVersion++;
    this.snapshot = null;
    this.model = null;
    this.poster = null;
    clearTimeout(this.statusTimer);
    this.previewObserver.disconnect();
    document.removeEventListener("keydown", this.onKeyDown, true);
    document.removeEventListener("focusin", this.onFocusIn, true);
    this.backdrop.inert = true;
    this.backdrop.setAttribute("aria-hidden", "true");
    this.backdrop.classList.add("bsp-backdrop-closing");
    this.panel.classList.add("bsp-panel-closing");
    if (restore && this.capture) restorePlayback(this.capture);
    this.onClosed();
    if (restore) document.getElementById("bsp-entry")?.focus({ preventScroll: true });
    window.setTimeout(() => this.backdrop.remove(), motionDelay(MOTION.fast));
  }

  private onFocusIn(event: FocusEvent): void {
    if (!this.closed && event.target instanceof Node && !this.panel.contains(event.target)) this.panel.focus();
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      event.preventDefault();
      this.close(true);
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = Array.from(this.panel.querySelectorAll<HTMLElement>("button,input,textarea,a[href],[tabindex]"))
      .filter(node => node.tabIndex >= 0 && !node.matches(":disabled") && node.getClientRects().length > 0);
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) { event.preventDefault(); this.panel.focus(); return; }
    if (event.shiftKey && (document.activeElement === first || document.activeElement === this.panel)) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  }

  private previewState(message: string, retry?: HTMLButtonElement): HTMLElement {
    const state = element("div", "bsp-loading-card");
    if (!retry) state.append(element("div", "bsp-spinner"));
    state.append(element("p", "", message));
    if (retry) state.append(retry);
    return state;
  }

  private renderLoading(): void {
    this.previewPane.replaceChildren(this.previewState("正在生成海报"));
    this.controls.replaceChildren();
  }

  private async captureThenLoad(): Promise<void> {
    if (!this.ensureCurrentContext()) return;
    try {
      this.capture = captureAndPausePlayback();
    } catch (error) {
      this.renderError(error, true);
      return;
    }
    await this.loadSnapshot();
  }

  private async loadSnapshot(): Promise<void> {
    if (!this.ensureCurrentContext() || !this.capture || this.loading) return;
    this.loading = true;
    try {
      const snapshot = await fetchGenerationSnapshot(this.capture);
      const shareTarget = buildCanonicalShareTarget(snapshot.bvid, snapshot, this.options);
      const model = snapshot.coverUnavailable ? null : buildSharePoster(snapshot, shareTarget);
      const poster = model ? await createPoster(model, snapshot) : null;
      if (!this.ensureCurrentContext()) return;
      this.snapshot = snapshot;
      this.model = model;
      this.poster = poster;
      this.shareTarget = shareTarget;
      this.renderReady(poster, shareTarget);
    } catch (error) {
      if (this.ensureCurrentContext()) this.renderError(error, false);
    } finally {
      this.loading = false;
    }
  }

  private renderReady(poster: HTMLElement | null, shareTarget: string): void {
    if (!poster) {
      const retry = element("button", "bsp-button", "重试");
      retry.type = "button";
      retry.addEventListener("click", () => { this.renderLoading(); void this.loadSnapshot(); });
      this.previewPane.replaceChildren(this.previewState("封面暂时无法加载", retry));
    } else if (!this.previewPane.contains(poster)) {
      const frame = element("div", "bsp-preview-frame");
      frame.append(poster);
      this.previewPane.replaceChildren(frame);
    }
    this.fitPoster();
    this.updating = false;
    this.exportButtons = [];
    clearTimeout(this.statusTimer);
    if (!this.snapshot) return;
    const snapshot = this.snapshot;
    const shareText = buildShareText(snapshot, shareTarget, { ...this.options, markdownText: false });
    this.shareText = shareText;
    this.markdownText = buildShareText(snapshot, shareTarget, { ...this.options, markdownText: true });
    const status = element("p", "bsp-status");
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    const copy = this.actionButton("copy", "复制海报", "复制海报", true, () => void this.copyPoster(status));
    const download = this.actionButton("download", "", "下载海报 PNG", false, () => void this.download(status));
    download.classList.add("bsp-download");
    const copyText = this.actionButton(null, "复制文案", "复制文案", false, () => void this.copyShareText(copyText, this.shareText, status));
    const copyMarkdown = this.actionButton(null, "复制 Markdown", "复制 Markdown", false, () => void this.copyShareText(copyMarkdown, this.markdownText, status, "Markdown"));
    this.exportButtons = [copy, download, copyText, copyMarkdown].map(button => ({
      button, requiresPoster: [copy, download].includes(button),
    }));
    for (const button of [copy, download]) button.disabled = !poster;

    const textSection = this.renderTextPreview(shareText);
    const textHeading = element("div", "bsp-section-heading");
    const textActions = element("div", "bsp-text-copy-actions");
    textActions.append(copyText, copyMarkdown);
    textHeading.append(element("h3", "", "分享文案"), textActions);
    textSection.prepend(textHeading);
    const detail = element("input");
    detail.type = "checkbox";
    detail.checked = this.options.detailedText;
    detail.setAttribute("aria-label", "详细信息");
    detail.addEventListener("change", () => this.applyOptions({ ...this.options, detailedText: detail.checked }));
    const detailLabel = element("label");
    detailLabel.append(detail, document.createTextNode("详细信息"));
    const textOptions = element("div", "bsp-text-options");
    textOptions.append(detailLabel);
    textSection.append(textOptions);

    const actions = element("div", "bsp-actions");
    actions.append(download, copy);
    const actionGroup = element("div", "bsp-action-group");
    actionGroup.append(actions, status);
    this.controls.replaceChildren(this.renderShareOptions(), textSection, actionGroup);
  }

  private refreshText(): void {
    if (!this.snapshot || !this.shareTarget) return;
    this.shareText = buildShareText(this.snapshot, this.shareTarget, { ...this.options, markdownText: false });
    this.markdownText = buildShareText(this.snapshot, this.shareTarget, { ...this.options, markdownText: true });
    const lines = this.shareText.split("\n");
    const link = lines.pop() ?? "";
    const body = this.controls.querySelector(".bsp-text-card-body");
    const address = this.controls.querySelector(".bsp-text-card-link");
    if (body) body.textContent = lines.join("\n") + (lines.length ? "\n" : "");
    if (address) address.textContent = link;
    this.controls.querySelector(".bsp-manual-copy")?.remove();
  }

  private refreshOptionControls(): void {
    if (!this.snapshot) return;
    const pills = this.controls.querySelectorAll<HTMLButtonElement>(".bsp-option-pill");
    const values = [this.options.partShare, this.options.timestampShare];
    const allowed = [canEnablePartShare(this.snapshot), canEnableTimestampShare(this.snapshot)];
    pills.forEach((button, index) => {
      button.setAttribute("aria-pressed", String(values[index]));
      button.classList.toggle("is-on", values[index]);
      button.disabled = this.exporting || !allowed[index];
    });
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
    iconName: IconName | null,
    label: string,
    tip: string,
    primary: boolean,
    onClick: () => void,
  ): HTMLButtonElement {
    const button = element("button", primary ? "bsp-action bsp-action-primary" : "bsp-action", label);
    button.type = "button";
    button.title = tip;
    button.setAttribute("aria-label", tip);
    if (iconName) button.prepend(createIcon(iconName));
    button.addEventListener("click", onClick);
    return button;
  }

  private clearStatus(status: HTMLElement): void {
    clearTimeout(this.statusTimer);
    status.textContent = "";
    status.classList.remove("is-show", "is-error");
  }

  private showStatus(message: string, error = false): void {
    if (!this.ensureCurrentContext()) return;
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
      this.optionToggle("list", "标记当前分P", this.options.partShare, !canEnablePartShare(snapshot), (checked) => {
        void checked;
        this.applyOptions(togglePartShare(this.options, snapshot));
      }),
      this.optionToggle("clock", "标记当前时间", this.options.timestampShare, !canEnableTimestampShare(snapshot), (checked) => {
        void checked;
        this.applyOptions(toggleTimestampShare(this.options, snapshot));
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

  private fitPoster(): void {
    for (const frame of this.previewPane.querySelectorAll<HTMLElement>(".bsp-preview-frame")) {
      const poster = frame.querySelector<HTMLElement>(".bsp-poster");
      if (poster) poster.style.transform = `scale(${Math.min(1, frame.clientWidth / 1080)})`;
    }
  }

  private applyOptions(next: ShareOptions): void {
    if (!this.ensureCurrentContext() || !this.snapshot || this.exporting) return;
    const previous = this.options;
    const targetChanged = previous.partShare !== next.partShare || previous.timestampShare !== next.timestampShare;
    const textChanged = previous.detailedText !== next.detailedText || previous.markdownText !== next.markdownText;
    this.options = next;
    this.refreshOptionControls();
    if (textChanged) this.persistPreferences();
    if (targetChanged) {
      void this.updateShareTargetForOptions();
      return;
    }
    if (textChanged && this.shareTarget) {
      this.refreshText();
    }
  }

  private persistPreferences(): void {
    if (typeof GM_setValue !== "function") return;
    GM_setValue("bsp-panel-preferences", {
      detailedText: this.options.detailedText,
    });
  }

  private async updateShareTargetForOptions(): Promise<void> {
    if (!this.snapshot) return;
    const version = ++this.targetVersion;
    const isCurrent = () => this.ensureCurrentContext() && version === this.targetVersion;
    this.updating = true;
    this.setExportButtonsDisabled(true);
    this.showUpdatingOverlay();
    try {
      const shareTarget = buildCanonicalShareTarget(this.snapshot.bvid, this.snapshot, this.options);
      const model = this.snapshot.coverUnavailable ? null : buildSharePoster(this.snapshot, shareTarget);
      if (this.poster) await updatePosterTarget(this.poster, shareTarget, isCurrent);
      if (!isCurrent()) return;
      this.model = model;
      this.shareTarget = shareTarget;
      this.refreshText();
    } catch (error) {
      if (isCurrent()) this.renderError(error, false);
    } finally {
      if (isCurrent()) {
        this.updating = false;
        this.previewPane.querySelector(".bsp-poster-updating")?.remove();
        this.setExportButtonsDisabled(false);
      }
    }
  }

  private setExportButtonsDisabled(disabled: boolean): void {
    for (const { button, requiresPoster } of this.exportButtons) {
      button.disabled = disabled || (requiresPoster && !this.poster);
    }
    // Resource retry must not race a pending target update.
    for (const button of this.previewPane.querySelectorAll<HTMLButtonElement>("button:not(.bsp-download)")) button.disabled = disabled;
  }

  private showUpdatingOverlay(): void {
    const frame = this.previewPane.querySelector(".bsp-preview-frame");
    if (!frame || frame.querySelector(".bsp-poster-updating")) return;
    frame.append(element("div", "bsp-poster-updating", "正在更新标记"));
  }


  private renderError(error: unknown, retryCapture: boolean): void {
    const message = error instanceof Error ? error.message : "生成海报时发生未知错误。";
    const retry = element("button", "bsp-button", "重试");
    retry.type = "button";
    retry.addEventListener("click", () => {
      this.renderLoading();
      if (retryCapture) void this.captureThenLoad();
      else void this.loadSnapshot();
    });
    this.previewPane.replaceChildren(this.previewState("暂时无法生成海报", retry));
    this.controls.replaceChildren(element("p", "bsp-error", message));
    if (retryCapture) this.controls.append(element("p", "bsp-help", "请确认主播放器已经加载，再重试。"));
  }

  private async posterPngDataUrl(): Promise<string> {
    if (!this.poster || !this.model) throw new Error("海报预览尚未生成");
    return exportPosterPng(this.poster);
  }

  /** Keep the chosen output stable through asynchronous encoding and clipboard writes. */
  private beginExport(): (() => void) | null {
    if (!this.ensureCurrentContext() || this.loading || this.updating || this.exporting) return null;
    this.exporting = true;
    const controls = new Set<HTMLButtonElement | HTMLInputElement>([
      ...this.exportButtons.map(({ button }) => button),
      ...this.controls.querySelectorAll<HTMLButtonElement | HTMLInputElement>("button,input"),
      ...this.previewPane.querySelectorAll<HTMLButtonElement>("button"),
    ]);
    const states = Array.from(controls, control => ({ control, disabled: control.disabled }));
    for (const { control } of states) control.disabled = true;
    return () => {
      this.exporting = false;
      if (this.closed || this.loading || this.updating) return;
      for (const { control, disabled } of states) if (control.isConnected) control.disabled = disabled;
    };
  }

  private async copyPoster(status: HTMLElement): Promise<void> {
    if (!this.poster || !this.model) return;
    const finish = this.beginExport();
    if (!finish) return;
    this.clearStatus(status);
    try {
      const dataUrl = await this.posterPngDataUrl();
      if (!this.ensureCurrentContext()) return;
      const outcome = await copyPosterPngToClipboard(dataUrl);
      const feedback = describePosterCopyResult(outcome);
      this.showStatus(
        outcome.status === "copied" ? feedback.statusMessage : `${feedback.statusMessage} ${feedback.helpMessage}`,
        outcome.status !== "copied",
      );
    } catch {
      this.showStatus("海报复制失败。请使用海报下方的下载图标保存 PNG。", true);
    } finally {
      finish();
    }
  }

  private async copyShareText(button: HTMLButtonElement, text: string, status: HTMLElement, format = "普通文案"): Promise<void> {
    const finish = this.beginExport();
    if (!finish) return;
    this.clearStatus(status);
    this.controls.querySelector(".bsp-manual-copy")?.remove();
    try {
      const outcome = await copyShareTextToClipboard(text);
      if (!this.ensureCurrentContext() || !button.isConnected) return;
      if (outcome.status === "copied") this.showStatus(`${format}已复制。`);
      else this.offerManualCopy(text, format);
    } catch {
      if (this.ensureCurrentContext() && button.isConnected) this.offerManualCopy(text, format);
    } finally {
      finish();
    }
  }

  private offerManualCopy(text: string, format: string): void {
    console.warn("[Bilibili Share] clipboard", { stage: "text-write", format });
    const source = element("textarea", "bsp-manual-copy");
    source.readOnly = true;
    source.value = text;
    source.rows = 6;
    source.setAttribute("aria-label", `手动复制 ${format}`);
    this.controls.append(source);
    this.showStatus(`${format}复制失败。请在下方文本框中手动复制。`, true);
    source.focus();
    source.select();
  }

  private async download(status: HTMLElement): Promise<void> {
    if (!this.poster || !this.snapshot || !this.model) return;
    const finish = this.beginExport();
    if (!finish) return;
    this.clearStatus(status);
    try {
      const dataUrl = await this.posterPngDataUrl();
      if (!this.ensureCurrentContext()) return;
      const link = document.createElement("a");
      link.download = buildPosterFilename(this.snapshot.bvid, new Date(), this.options.partShare ? this.snapshot.partNumber : null);
      link.href = dataUrl;
      link.click();
      this.showStatus("PNG 已下载。");
    } catch {
      this.showStatus("PNG 生成失败，预览仍保留；请重试下载。", true);
    } finally {
      finish();
    }
  }
}
