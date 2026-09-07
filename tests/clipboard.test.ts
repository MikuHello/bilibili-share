import { describe, expect, it } from "vitest";

import {
  copyPng,
  copyText,
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
