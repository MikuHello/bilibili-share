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
    helpMessage: "请使用复制海报左侧的下载图标保存 PNG。",
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
