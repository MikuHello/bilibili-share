import { describe, expect, it } from "vitest";

import { parseShortLinkResponse, selectShareTarget } from "../src/share-target";

describe("validated share target", () => {
  it("rejects a short-link business error", () => {
    expect(() => parseShortLinkResponse({ code: -400, message: "request error" })).toThrow(
      "Bilibili 短链请求失败：request error",
    );
  });

  it("rejects a successful response without a short-link field", () => {
    expect(() => parseShortLinkResponse({ code: 0, message: "OK", data: { count: 0 } })).toThrow(
      "Bilibili 短链响应缺少有效链接",
    );
  });

  it("extracts the opaque HTTPS b23.tv URL from Bilibili share content", () => {
    expect(
      parseShortLinkResponse({
        code: 0,
        message: "OK",
        data: { content: "【一个视频标题-哔哩哔哩】 https://b23.tv/a7BomhP", count: 0 },
      }),
    ).toBe("https://b23.tv/a7BomhP");
  });

  it("rejects content that only contains a lookalike short-link token", () => {
    expect(() =>
      parseShortLinkResponse({
        code: 0,
        message: "OK",
        data: { content: "【一个视频标题】 https://b23.tv/a7BomhP.evil" },
      }),
    ).toThrow("Bilibili 短链响应缺少有效链接");
  });

  it("uses a short URL whose resolved BVID matches despite tracking parameters", () => {
    expect(
      selectShareTarget("https://www.bilibili.com/video/BV1xx411c7mD/", {
        status: "resolved",
        shortUrl: "https://b23.tv/a7BomhP",
        resolvedUrl:
          "https://www.bilibili.com/video/BV1xx411c7mD?buvid=public-check&share_source=COPY&unique_k=a7BomhP",
      }),
    ).toEqual({
      shareTarget: "https://b23.tv/a7BomhP",
      source: "short",
    });
  });

  it("falls back to the canonical target when the short URL resolves to another BVID", () => {
    expect(
      selectShareTarget("https://www.bilibili.com/video/BV1xx411c7mD/", {
        status: "resolved",
        shortUrl: "https://b23.tv/untrusted",
        resolvedUrl: "https://www.bilibili.com/video/BV1XoTEzrEiL/?share_source=COPY",
      }),
    ).toEqual({
      shareTarget: "https://www.bilibili.com/video/BV1xx411c7mD/",
      source: "canonical-fallback",
      fallbackReason: "短链落点与本次生成快照不一致",
    });
  });

  it("keeps one canonical fallback target when short-link generation fails", () => {
    expect(
      selectShareTarget("https://www.bilibili.com/video/BV1xx411c7mD/", {
        status: "failed",
        reason: "短链请求超时，请稍后重试",
      }),
    ).toEqual({
      shareTarget: "https://www.bilibili.com/video/BV1xx411c7mD/",
      source: "canonical-fallback",
      fallbackReason: "短链请求超时，请稍后重试",
    });
  });

  it("accepts a resolved short URL only when enabled part and timestamp parameters are preserved", () => {
    expect(
      selectShareTarget("https://www.bilibili.com/video/BV1xx411c7mD/?p=2&t=61", {
        status: "resolved",
        shortUrl: "https://b23.tv/partTime",
        resolvedUrl:
          "https://www.bilibili.com/video/BV1xx411c7mD/?share_source=COPY&t=61&p=2&unique_k=partTime",
      }),
    ).toEqual({
      shareTarget: "https://b23.tv/partTime",
      source: "short",
    });
  });

  it("falls back when an enabled timestamp disappears from the resolved short URL", () => {
    expect(
      selectShareTarget("https://www.bilibili.com/video/BV1xx411c7mD/?p=2&t=61", {
        status: "resolved",
        shortUrl: "https://b23.tv/missingTime",
        resolvedUrl: "https://www.bilibili.com/video/BV1xx411c7mD/?p=2&share_source=COPY",
      }),
    ).toMatchObject({
      shareTarget: "https://www.bilibili.com/video/BV1xx411c7mD/?p=2&t=61",
      source: "canonical-fallback",
    });
  });

  it("falls back instead of blocking when the short-link resolver returns an invalid destination", () => {
    expect(
      selectShareTarget("https://www.bilibili.com/video/BV1xx411c7mD/", {
        status: "resolved",
        shortUrl: "https://b23.tv/broken",
        resolvedUrl: "javascript:alert(1)",
      }),
    ).toEqual({
      shareTarget: "https://www.bilibili.com/video/BV1xx411c7mD/",
      source: "canonical-fallback",
      fallbackReason: "短链落点无效",
    });
  });
});
