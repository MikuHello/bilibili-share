import { afterEach, describe, expect, it, vi } from "vitest";

import {
  copyPng,
  copyText,
  copyShareTextToClipboard,
  describePosterCopyResult,
  describeTextCopyResult,
} from "../src/clipboard";

const png = "data:image/png;base64,test";

describe("poster clipboard adapter", () => {
  it("reports a successful image-only copy", async () => {
    const outcome = await copyPng(png, { async write() {} });

    expect(outcome).toEqual({ status: "copied" });
    expect(describePosterCopyResult(outcome)).toEqual({
      statusMessage: "海报已复制到剪贴板。",
      helpMessage: "仅复制了海报图片，不包含分享文案。",
      downloadGuidance: false,
    });
  });

  it("keeps the failure path available and points to download PNG", async () => {
    const outcome = await copyPng(png, {
        async write() {
          throw new Error("Clipboard API 写入被拒绝");
        },
      });

    expect(outcome).toEqual({ status: "failed", reason: "Clipboard API 写入被拒绝" });
    expect(describePosterCopyResult(outcome)).toEqual({
      statusMessage: "海报复制失败。",
      helpMessage: "请使用复制海报左侧的下载图标保存 PNG。",
      downloadGuidance: true,
    });
  });

  it("reports a successful text copy without claiming a poster was copied", async () => {
    const outcome = await copyText("标题（UP主：甲）\nhttps://www.bilibili.com/video/BV1xx411c7mD/", { async write() {} });

    expect(outcome).toEqual({ status: "copied" });
    expect(describeTextCopyResult(outcome)).toEqual({
      statusMessage: "文案已复制。",
      helpMessage: "仅复制了分享文案，不包含海报图片。",
      manualCopy: false,
    });
  });

  it("keeps the exact text selectable when text copy fails", async () => {
    const text = "标题（UP主：甲）\nhttps://www.bilibili.com/video/BV1xx411c7mD/";
    const outcome = await copyText(text, {
        async write() {
          throw new Error("文档未获焦点的剪贴板写入失败");
        },
      });

    expect(outcome).toEqual({ status: "failed", reason: "文档未获焦点的剪贴板写入失败" });
    expect(describeTextCopyResult(outcome)).toEqual({
      statusMessage: "文案复制失败。",
      helpMessage: "文档未获焦点的剪贴板写入失败 文案仍在上方，可手动全选复制。",
      manualCopy: true,
    });
  });

});


describe("userscript text clipboard boundary", () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

  it("keeps all text outside a page link cleaner and waits for completion", async () => {
    const text = "标题（UP主：甲）\nhttps://www.bilibili.com/video/BV1xx411c7mD/?p=2&t=83";
    let stored = "";
    let complete = () => {};
    vi.stubGlobal("navigator", { clipboard: { write() {}, async writeText(value: string) { stored = value.split("\n").at(-1)!; } } });
    vi.stubGlobal("GM_setClipboard", (value: string, _type: string, done: () => void) => { stored = value; complete = done; });
    let settled = false;
    const result = copyShareTextToClipboard(text).then(value => { settled = true; return value; });
    await Promise.resolve();
    expect(stored).toBe(text);
    expect(settled).toBe(false);
    complete();
    expect(await result).toEqual({ status: "copied" });
  });

  it("reports a missing completion callback as failure instead of success", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("GM_setClipboard", () => {});
    const result = copyShareTextToClipboard("完整文案");
    await vi.advanceTimersByTimeAsync(5000);
    expect(await result).toEqual({ status: "failed", reason: "文本剪贴板写入未完成，请重试" });
    expect(vi.getTimerCount()).toBe(0);
  });

  it("preserves the manual-copy failure path when the userscript writer throws", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("GM_setClipboard", () => { throw new Error("写入被拒绝"); });
    expect(await copyShareTextToClipboard("完整文案")).toEqual({ status: "failed", reason: "写入被拒绝" });
    expect(vi.getTimerCount()).toBe(0);
  });

  it("supports the browser writer when no userscript clipboard API is available", async () => {
    let stored = "";
    vi.stubGlobal("GM_setClipboard", undefined);
    vi.stubGlobal("navigator", { clipboard: { write() {}, async writeText(value: string) { stored = value; } } });
    expect(await copyShareTextToClipboard("完整文案")).toEqual({ status: "copied" });
    expect(stored).toBe("完整文案");
  });
});
