export type PosterCopyOutcome = { status: "copied" } | { status: "failed"; reason: string };

export interface PngClipboardWriter {
  write(dataUrl: string): Promise<void>;
}

export interface PosterCopyFeedback {
  statusMessage: string;
  helpMessage: string;
  downloadGuidance: boolean;
}

function browserClipboard(): Clipboard | null {
  const clipboard = (navigator as Navigator & { clipboard?: Clipboard }).clipboard;
  return clipboard && typeof clipboard.write === "function" ? clipboard : null;
}

function clipboardItemConstructor(): typeof ClipboardItem | null {
  const constructor = (globalThis as { ClipboardItem?: typeof ClipboardItem }).ClipboardItem;
  return typeof constructor === "function" ? constructor : null;
}

export async function copyPng(dataUrl: string, writer: PngClipboardWriter): Promise<PosterCopyOutcome> {
  try {
    await writer.write(dataUrl);
    return { status: "copied" };
  } catch (error) {
    return {
      status: "failed",
      reason: error instanceof Error && error.message ? error.message : "浏览器拒绝写入图片剪贴板",
    };
  }
}

export function describePosterCopyResult(outcome: PosterCopyOutcome): PosterCopyFeedback {
  if (outcome.status === "copied") {
    return {
      statusMessage: "海报已复制到剪贴板。",
      helpMessage: "仅复制了海报图片，不包含分享文案。",
      downloadGuidance: false,
    };
  }
  return {
    statusMessage: "海报复制失败。",
    helpMessage: "请使用海报下方的下载图标保存 PNG。",
    downloadGuidance: true,
  };
}

export type TextCopyOutcome = { status: "copied" } | { status: "failed"; reason: string };

export interface TextClipboardWriter {
  write(text: string): Promise<void>;
}

export interface TextCopyFeedback {
  statusMessage: string;
  helpMessage: string;
  manualCopy: boolean;
}

export async function copyText(text: string, writer: TextClipboardWriter): Promise<TextCopyOutcome> {
  try {
    await writer.write(text);
    return { status: "copied" };
  } catch (error) {
    return {
      status: "failed",
      reason: error instanceof Error && error.message ? error.message : "浏览器拒绝写入文本剪贴板",
    };
  }
}

export function describeTextCopyResult(outcome: TextCopyOutcome): TextCopyFeedback {
  if (outcome.status === "copied") {
    return {
      statusMessage: "文案已复制。",
      helpMessage: "仅复制了分享文案，不包含海报图片。",
      manualCopy: false,
    };
  }
  return {
    statusMessage: "文案复制失败。",
    helpMessage: `${outcome.reason} 文案仍在上方，可手动全选复制。`,
    manualCopy: true,
  };
}

export async function copyShareTextToClipboard(text: string): Promise<TextCopyOutcome> {
  const clipboard = browserClipboard();
  if (clipboard && typeof clipboard.writeText === "function") {
    return copyText(text, {
      async write(value) {
        await clipboard.writeText(value);
      },
    });
  }
  if (typeof GM_setClipboard === "function") {
    return copyText(text, {
      async write(value) {
        GM_setClipboard(value, "text");
      },
    });
  }
  return { status: "failed", reason: "当前浏览器不支持文本剪贴板写入" };
}

export type CombinedCopyOutcome =
  | { status: "copied" }
  | { status: "text-fallback"; reason: string }
  | { status: "failed"; reason: string };

export interface CombinedClipboardPorts {
  writeCombined(dataUrl: string, text: string, html: string): Promise<void>;
  writeText(text: string): Promise<void>;
}

export interface CombinedCopyFeedback {
  statusMessage: string;
  helpMessage: string;
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function buildCombinedHtml(posterDataUrl: string, shareText: string): string {
  return `<img src="${escapeHtml(posterDataUrl)}" alt="分享海报"><br><pre>${escapeHtml(shareText)}</pre>`;
}

export async function copyCombined(
  posterDataUrl: string,
  shareText: string,
  ports: CombinedClipboardPorts,
): Promise<CombinedCopyOutcome> {
  const html = buildCombinedHtml(posterDataUrl, shareText);
  try {
    await ports.writeCombined(posterDataUrl, shareText, html);
    return { status: "copied" };
  } catch (combinedError) {
    const combinedReason = combinedError instanceof Error && combinedError.message ? combinedError.message : "组合写入失败";
    try {
      await ports.writeText(shareText);
      return { status: "text-fallback", reason: combinedReason };
    } catch (textError) {
      return {
        status: "failed",
        reason: textError instanceof Error && textError.message ? textError.message : "文案写入失败",
      };
    }
  }
}

export function describeCombinedCopyResult(outcome: CombinedCopyOutcome): CombinedCopyFeedback {
  if (outcome.status === "copied") {
    return {
      statusMessage: "已写入兼容格式。",
      helpMessage: "接收方可能只取其中一种；不保证粘贴时图与文同时出现。",
    };
  }
  if (outcome.status === "text-fallback") {
    return {
      statusMessage: "组合复制失败，已改为仅复制文案。",
      helpMessage: "海报仍需单独复制或下载 PNG。",
    };
  }
  return {
    statusMessage: "组合复制失败。",
    helpMessage: "文案仍在上方，可手动全选复制；海报请使用“复制海报”或“下载 PNG”。",
  };
}

export async function copyCombinedPosterAndText(
  posterDataUrl: string,
  shareText: string,
  canContinue: () => boolean = () => true,
): Promise<CombinedCopyOutcome> {
  const clipboardItemCtor = clipboardItemConstructor();
  const clipboard = browserClipboard();
  if (clipboardItemCtor && clipboard) {
    const textBlob = new Blob([shareText], { type: "text/plain" });
    const htmlBlob = new Blob([buildCombinedHtml(posterDataUrl, shareText)], { type: "text/html" });
    const ports: CombinedClipboardPorts = {
      async writeCombined(dataUrl, _text, _html) {
        await clipboard.write([
          new clipboardItemCtor({
            "image/png": pngDataUrlToBlob(dataUrl),
            "text/plain": textBlob,
            "text/html": htmlBlob,
          }),
        ]);
      },
      writeText: async (text) => {
        if (!canContinue()) throw new Error("分享上下文已失效");
        const outcome = await copyShareTextToClipboard(text);
        if (outcome.status === "failed") throw new Error(outcome.reason);
      },
    };
    return copyCombined(posterDataUrl, shareText, ports);
  }
  if (!canContinue()) return { status: "failed", reason: "分享上下文已失效" };
  const textOutcome = await copyShareTextToClipboard(shareText);
  return textOutcome.status === "copied"
    ? { status: "text-fallback", reason: "当前浏览器不支持组合剪贴板写入" }
    : { status: "failed", reason: textOutcome.reason };
}



function pngDataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  if (!header?.startsWith("data:image/png") || !base64) throw new Error("海报 PNG 数据无效");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: "image/png" });
}

export async function copyPosterPngToClipboard(dataUrl: string): Promise<PosterCopyOutcome> {
  const clipboardItemCtor = clipboardItemConstructor();
  const clipboard = browserClipboard();
  if (!clipboardItemCtor || !clipboard) {
    return { status: "failed", reason: "当前浏览器不支持图片剪贴板写入" };
  }
  return copyPng(dataUrl, {
    async write(value) {
      await clipboard.write([new clipboardItemCtor({ "image/png": pngDataUrlToBlob(value) })]);
    },
  });
}
