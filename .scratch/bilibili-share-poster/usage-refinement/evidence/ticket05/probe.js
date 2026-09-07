// src/clipboard.ts
function browserClipboard() {
  const clipboard = navigator.clipboard;
  return clipboard && typeof clipboard.write === "function" ? clipboard : null;
}
function clipboardItemConstructor() {
  const constructor = globalThis.ClipboardItem;
  return typeof constructor === "function" ? constructor : null;
}
async function copyText(text2, writer) {
  try {
    await writer.write(text2);
    return { status: "copied" };
  } catch (error) {
    return {
      status: "failed",
      reason: error instanceof Error && error.message ? error.message : "\u6D4F\u89C8\u5668\u62D2\u7EDD\u5199\u5165\u6587\u672C\u526A\u8D34\u677F"
    };
  }
}
async function copyShareTextToClipboard(text2) {
  const clipboard = browserClipboard();
  if (clipboard && typeof clipboard.writeText === "function") {
    return copyText(text2, {
      async write(value) {
        await clipboard.writeText(value);
      }
    });
  }
  if (typeof GM_setClipboard === "function") {
    return copyText(text2, {
      async write(value) {
        GM_setClipboard(value, "text");
      }
    });
  }
  return { status: "failed", reason: "\u5F53\u524D\u6D4F\u89C8\u5668\u4E0D\u652F\u6301\u6587\u672C\u526A\u8D34\u677F\u5199\u5165" };
}
function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
function buildCombinedHtml(posterDataUrl, shareText) {
  return `<img src="${escapeHtml(posterDataUrl)}" alt="\u5206\u4EAB\u6D77\u62A5"><br><pre>${escapeHtml(shareText)}</pre>`;
}
async function copyCombined(posterDataUrl, shareText, ports) {
  const html = buildCombinedHtml(posterDataUrl, shareText);
  try {
    await ports.writeCombined(posterDataUrl, shareText, html);
    return { status: "copied" };
  } catch (combinedError) {
    const combinedReason = combinedError instanceof Error && combinedError.message ? combinedError.message : "\u7EC4\u5408\u5199\u5165\u5931\u8D25";
    try {
      await ports.writeText(shareText);
      return { status: "text-fallback", reason: combinedReason };
    } catch (textError) {
      return {
        status: "failed",
        reason: textError instanceof Error && textError.message ? textError.message : "\u6587\u6848\u5199\u5165\u5931\u8D25"
      };
    }
  }
}
async function copyCombinedPosterAndText(posterDataUrl, shareText, canContinue = () => true) {
  const clipboardItemCtor = clipboardItemConstructor();
  const clipboard = browserClipboard();
  if (clipboardItemCtor && clipboard) {
    const textBlob = new Blob([shareText], { type: "text/plain" });
    const htmlBlob = new Blob([buildCombinedHtml(posterDataUrl, shareText)], { type: "text/html" });
    const ports = {
      async writeCombined(dataUrl, _text, _html) {
        await clipboard.write([
          new clipboardItemCtor({
            "image/png": pngDataUrlToBlob(dataUrl),
            "text/plain": textBlob,
            "text/html": htmlBlob
          })
        ]);
      },
      writeText: async (text2) => {
        if (!canContinue()) throw new Error("\u5206\u4EAB\u4E0A\u4E0B\u6587\u5DF2\u5931\u6548");
        const outcome = await copyShareTextToClipboard(text2);
        if (outcome.status === "failed") throw new Error(outcome.reason);
      }
    };
    return copyCombined(posterDataUrl, shareText, ports);
  }
  if (!canContinue()) return { status: "failed", reason: "\u5206\u4EAB\u4E0A\u4E0B\u6587\u5DF2\u5931\u6548" };
  const textOutcome = await copyShareTextToClipboard(shareText);
  return textOutcome.status === "copied" ? { status: "text-fallback", reason: "\u5F53\u524D\u6D4F\u89C8\u5668\u4E0D\u652F\u6301\u7EC4\u5408\u526A\u8D34\u677F\u5199\u5165" } : { status: "failed", reason: textOutcome.reason };
}
function pngDataUrlToBlob(dataUrl) {
  const [header, base64] = dataUrl.split(",");
  if (!header?.startsWith("data:image/png") || !base64) throw new Error("\u6D77\u62A5 PNG \u6570\u636E\u65E0\u6548");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: "image/png" });
}

// .scratch/bilibili-share-poster/usage-refinement/evidence/ticket05/probe.ts
var text = "\u7EC4\u5408\u7C98\u8D34\u9A8C\u8BC1 \xB7 \u53EF\u7F16\u8F91\u6587\u5B57\nhttps://www.bilibili.com/video/BV1GJ411x7h7/";
var png = await fetch("./poster.png").then((r) => r.blob()).then((b) => new Promise((resolve) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result));
  reader.readAsDataURL(b);
}));
for (const id of ["candidate", "html"]) document.getElementById(id).addEventListener("click", async () => {
  try {
    if (id === "candidate") {
      document.getElementById("status").textContent = JSON.stringify(await copyCombinedPosterAndText(png, text));
    } else {
      await navigator.clipboard.write([new ClipboardItem({ "text/html": new Blob([buildCombinedHtml(png, text)], { type: "text/html" }), "text/plain": new Blob([text], { type: "text/plain" }) })]);
      document.getElementById("status").textContent = "HTML-only API write succeeded";
    }
  } catch (e) {
    document.getElementById("status").textContent = String(e);
  }
});
document.getElementById("paste").addEventListener("paste", () => setTimeout(() => {
  const el = document.getElementById("paste");
  document.getElementById("result").textContent = JSON.stringify({ images: el.querySelectorAll("img").length, text: el.innerText, editable: el.isContentEditable });
}, 0));
