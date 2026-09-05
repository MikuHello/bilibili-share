import { describe, expect, it } from "vitest";

import {
  buildCombinedHtml,
  copyCombined,
  copyPng,
  copyText,
  describeCombinedCopyResult,
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
      helpMessage: "请使用海报下方的下载图标保存 PNG。",
      downloadGuidance: true,
    });
  });

  it("reports a successful text copy without claiming a poster was copied", async () => {
    const outcome = await copyText("标题（UP主：甲）\nhttps://b23.tv/a7BomhP", { async write() {} });

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

  it("orders the rich combined representation as poster then text", () => {
    const html = buildCombinedHtml("data:image/png;base64,<&", "标题 <&>");

    expect(html).toBe(
      '<img src="data:image/png;base64,&lt;&amp;" alt="分享海报"><br><pre>标题 &lt;&amp;&gt;</pre>',
    );
  });

  it("reports a successful combined copy with honest compatibility wording", async () => {
    const outcome = await copyCombined(png, "文案", {
      async writeCombined() {},
      async writeText() {},
    });

    expect(outcome).toEqual({ status: "copied" });
    expect(describeCombinedCopyResult(outcome)).toEqual({
      statusMessage: "已写入兼容格式。",
      helpMessage: "接收方可能只取其中一种；不保证粘贴时图与文同时出现。",
    });
  });

  it("falls back to the selected text when combined writing fails", async () => {
    let textWritten = "";
    const outcome = await copyCombined(png, "文案", {
      async writeCombined() {
        throw new Error("组合写入被拒绝");
      },
      async writeText(text) {
        textWritten = text;
      },
    });

    expect(outcome).toEqual({ status: "text-fallback", reason: "组合写入被拒绝" });
    expect(textWritten).toBe("文案");
    expect(describeCombinedCopyResult(outcome).helpMessage).not.toContain("组合写入被拒绝");
    expect(describeCombinedCopyResult(outcome).helpMessage).toContain("海报仍需单独复制或下载 PNG");
  });

  it("reports failure without hiding that both combined and text writes failed", async () => {
    const outcome = await copyCombined(png, "文案", {
      async writeCombined() {
        throw new Error("组合写入被拒绝");
      },
      async writeText() {
        throw new Error("文案写入被拒绝");
      },
    });

    expect(outcome).toEqual({ status: "failed", reason: "文案写入被拒绝" });
    expect(describeCombinedCopyResult(outcome).helpMessage).toContain("海报请使用“复制海报”或“下载 PNG”");
  });

});
