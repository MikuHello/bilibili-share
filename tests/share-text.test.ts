import { describe, expect, it } from "vitest";

import { buildCompactShareText, buildShareText, formatExactStat } from "../src/share-text";

describe("compact share text", () => {
  it("keeps the original title unwrapped and puts uploader before the target line", () => {
    expect(buildCompactShareText("【测试】原味标题", "UP 主甲", "https://www.bilibili.com/video/BV1xx411c7mD/")).toBe(
      "【测试】原味标题（UP主：UP 主甲）\nhttps://www.bilibili.com/video/BV1xx411c7mD/",
    );
  });

  it("does not add or remove brackets from a title", () => {
    expect(buildCompactShareText("没有包裹的标题", "UP 主甲", "https://b23.tv/a7BomhP")).toBe(
      "没有包裹的标题（UP主：UP 主甲）\nhttps://b23.tv/a7BomhP",
    );
  });

  it("uses the same target for short and canonical fallback paths", () => {
    const short = buildCompactShareText("标题", "UP 主甲", "https://b23.tv/a7BomhP");
    const fallback = buildCompactShareText("标题", "UP 主甲", "https://www.bilibili.com/video/BV1xx411c7mD/");

    expect(short).toContain("\nhttps://b23.tv/a7BomhP");
    expect(fallback).toContain("\nhttps://www.bilibili.com/video/BV1xx411c7mD/");
  });

  it("preserves source-language title and uploader characters", () => {
    expect(buildCompactShareText("進撃の巨人 Season 3", "AnimeUp主", "https://b23.tv/a7BomhP")).toBe(
      "進撃の巨人 Season 3（UP主：AnimeUp主）\nhttps://b23.tv/a7BomhP",
    );
  });
});

describe("detailed and markdown share text", () => {
  const snapshot = {
    bvid: "BV1xx411c7mD",
    aid: 170001,
    coverDataUrl: "data:image/png;base64,cover",
  coverUnavailable: false,
    title: "【测试】详细文案标题",
    uploader: "UP 主甲",
    partNumber: 2,
    partTitle: "第二集",
    partIdentified: true,
    playbackSeconds: 3723,
    wasPlaying: true,
    stats: { views: 12_345_678, likes: 98_765, coins: 0, favorites: null },
  } as const;
  const target = "https://www.bilibili.com/video/BV1xx411c7mD/?p=2&t=3723";

  it("formats exact statistics with thousands separators and keeps --", () => {
    expect(formatExactStat(12_345_678)).toBe("12,345,678");
    expect(formatExactStat(null)).toBe("--");
  });

  it("builds plain detailed text with exact values and conditional fields", () => {
    expect(
      buildShareText(snapshot, target, {
          partShare: true,
        timestampShare: true,
        detailedText: true,
        markdownText: false,
      }),
    ).toBe(
      "【测试】详细文案标题\nUP主：UP 主甲\nBV/AV：BV1xx411c7mD · AV170001\n播放：12,345,678　点赞：98,765　投币：0　收藏：--\n分P：P2 · 第二集\n时间：01:02:03\nhttps://www.bilibili.com/video/BV1xx411c7mD/?p=2&t=3723",
    );
  });

  it("builds compact markdown with title, uploader and a bare link line", () => {
    expect(
      buildShareText(snapshot, target, {
          partShare: false,
        timestampShare: false,
        detailedText: false,
        markdownText: true,
      }),
    ).toBe("[【测试】详细文案标题](https://www.bilibili.com/video/BV1xx411c7mD/?p=2&t=3723)（UP主：UP 主甲）\nhttps://www.bilibili.com/video/BV1xx411c7mD/?p=2&t=3723");
  });

  it("builds detailed markdown as a field list with only enabled part and timestamp fields", () => {
    expect(
      buildShareText(snapshot, target, {
          partShare: true,
        timestampShare: true,
        detailedText: true,
        markdownText: true,
      }),
    ).toBe(
      "**【测试】详细文案标题**\n\n- UP主：UP 主甲\n- BV/AV：BV1xx411c7mD · AV170001\n- 播放：12,345,678 · 点赞：98,765 · 投币：0 · 收藏：--\n- 分P：P2 · 第二集\n- 时间：01:02:03\n- 链接：https://www.bilibili.com/video/BV1xx411c7mD/?p=2&t=3723",
    );
  });

  it("omits part and timestamp fields when their options are off", () => {
    const text = buildShareText(snapshot, target, {
      partShare: false,
      timestampShare: false,
      detailedText: true,
      markdownText: false,
    });

    expect(text).not.toContain("分P：");
    expect(text).not.toContain("时间：");
  });
});

