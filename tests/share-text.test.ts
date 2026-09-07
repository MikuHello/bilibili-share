import { describe, expect, it } from "vitest";

import { buildCompactShareText, buildShareText, formatExactStat } from "../src/share-text";

describe("compact share text", () => {
  it("keeps the original title unwrapped and puts uploader before the target line", () => {
    expect(buildCompactShareText("【测试】原味标题", "UP 主甲", "https://www.bilibili.com/video/BV1xx411c7mD/")).toBe(
      "【测试】原味标题（UP主：UP 主甲）\nhttps://www.bilibili.com/video/BV1xx411c7mD/",
    );
  });

  it("does not add or remove brackets from a title", () => {
    expect(buildCompactShareText("没有包裹的标题", "UP 主甲", "https://www.bilibili.com/video/BV1xx411c7mD/")).toBe(
      "没有包裹的标题（UP主：UP 主甲）\nhttps://www.bilibili.com/video/BV1xx411c7mD/",
    );
  });

  it("preserves source-language title and uploader characters", () => {
    expect(buildCompactShareText("進撃の巨人 Season 3", "AnimeUp主", "https://www.bilibili.com/video/BV1xx411c7mD/")).toBe(
      "進撃の巨人 Season 3（UP主：AnimeUp主）\nhttps://www.bilibili.com/video/BV1xx411c7mD/",
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

  it("overrides only plain compact wording through the public generation interface", () => {
    const options = { partShare: true, timestampShare: true, detailedText: false, markdownText: false };
    const templates = { plain: { compact: "{{url}}\n{{title}} / {{title}} — {{uploader}} 🐾\n结束" } };
    expect(buildShareText(snapshot, target, options, templates)).toBe(
      "https://www.bilibili.com/video/BV1xx411c7mD/?p=2&t=3723\n【测试】详细文案标题 / 【测试】详细文案标题 — UP 主甲 🐾\n结束",
    );
    expect(buildShareText(snapshot, target, { ...options, detailedText: true }, templates))
      .toBe(buildShareText(snapshot, target, { ...options, detailedText: true }));
    expect(buildShareText(snapshot, target, { ...options, markdownText: true }, templates))
      .toBe(buildShareText(snapshot, target, { ...options, markdownText: true }));
  });

  it("renders available conditions, zero statistics and missing placeholders without trimming whitespace", () => {
    const options = { partShare: true, timestampShare: true, detailedText: true, markdownText: false };
    const templates = { plain: { detailed: " {{bvid}} av{{aid}} {{views}} {{likes}} {{coins}} {{favorites}}\n{{#if coins}}zero={{coins}}\n{{/if}}{{#if favorites}}missing\n{{/if}}{{#if honor}}honor={{honor}}\n{{/if}}{{#if part}}{{part}}\n{{/if}}{{#if timestamp}}{{timestamp}}{{/if}} {{honor}} " } };
    expect(buildShareText({ ...snapshot, honor: "  " }, target, options, templates)).toBe(
      " BV1xx411c7mD av170001 12,345,678 98,765 0 --\nzero=0\nP2 · 第二集\n01:02:03  ",
    );
    expect(buildShareText(snapshot, target, { ...options, partShare: false, timestampShare: false },
      { plain: { detailed: "A{{#if part}}P={{part}}{{/if}}{{#if timestamp}}T={{timestamp}}{{/if}}Z" } })).toBe("AZ");
  });

  it.each([
    "{{unknown}}", "{{#if honor}}{{unknown}}{{/if}}", "{{#if unknown}}x{{/if}}",
    "{{title", "}}", "{{#if honor}}x", "{{/if}}", "{{else}}",
    "{{#if title}}{{#if honor}}x{{/if}}{{/if}}", "{{ title }}", "{{title()}}",
  ])("diagnoses invalid syntax even inside hidden blocks: %s", template => {
    expect(() => buildShareText(snapshot, target,
      { partShare: false, timestampShare: false, detailedText: false, markdownText: false },
      { plain: { compact: template } })).toThrow(/plain\.compact.*line \d+, column \d+/);
  });

  it("escapes literal delimiters and never interprets variable data as template syntax", () => {
    expect(buildShareText({ ...snapshot, title: "{{unknown}} {{#if title}}猫{{/if}}" }, target,
      { partShare: false, timestampShare: false, detailedText: false, markdownText: false },
      { plain: { compact: "\\{{title\\}}|{{title}}|\\\\" } })).toBe(
        "{{title}}|{{unknown}} {{#if title}}猫{{/if}}|\\",
      );
  });

  it("places the original honor after detailed statistics, escapes Markdown and excludes it from compact text", () => {
    const honored = { ...snapshot, honor: "第389期每周必看 [特别*篇]" };
    for (const markdownText of [false, true]) {
      const options = { partShare: true, timestampShare: true, detailedText: true, markdownText };
      const lines = buildShareText(honored, target, options).split("\n");
      const statsIndex = lines.findIndex(line => line.includes("播放："));
      expect(lines[statsIndex + 1]).toBe(markdownText ? "- 第389期每周必看 \\[特别\\*篇\\]" : honored.honor);
      expect(buildShareText(honored, target, { ...options, detailedText: false })).not.toContain("第389期");
    }
  });

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
      "【测试】详细文案标题\nUP主：UP 主甲\n播放：12,345,678　点赞：98,765　投币：0　收藏：--\n分P：P2 · 第二集\n时间：01:02:03\nBV1xx411c7mD · av170001\nhttps://www.bilibili.com/video/BV1xx411c7mD/?p=2&t=3723",
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
      "**【测试】详细文案标题**\n\n- UP主：UP 主甲\n- 播放：12,345,678 · 点赞：98,765 · 投币：0 · 收藏：--\n- 分P：P2 · 第二集\n- 时间：01:02:03\n- BV1xx411c7mD · av170001\n- 链接：https://www.bilibili.com/video/BV1xx411c7mD/?p=2&t=3723",
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
