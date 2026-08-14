import { describe, expect, it } from "vitest";

import {
  buildDefaultPoster,
  buildPosterFilename,
  formatCompactStat,
  formatTimestamp,
  getDefaultTheme,
  type GenerationSnapshot,
} from "../src/domain";

const completeSnapshot: GenerationSnapshot = {
  bvid: "BV1xx411c7mD",
  aid: 170001,
  coverDataUrl: "data:image/png;base64,cover",
  title: "一个用于测试的标准视频标题",
  uploader: "测试 UP 主",
  partNumber: 1,
  playbackSeconds: 62,
  wasPlaying: true,
  stats: {
    views: 12_345_678,
    likes: 98_765,
    coins: null,
    favorites: 123,
  },
};

describe("default A poster domain", () => {
  it("uses theme A on first use", () => {
    expect(getDefaultTheme()).toEqual({ id: "A", titleLines: 2 });
  });

  it.each([
    [0, "0"],
    [9_999, "9999"],
    [10_000, "1.0万"],
    [12_345_678, "1234.6万"],
    [100_000_000, "1.0亿"],
    [null, "--"],
  ])("formats snapshot statistic %s as %s", (value, expected) => {
    expect(formatCompactStat(value)).toBe(expected);
  });

  it.each([
    [0, "00:00"],
    [62, "01:02"],
    [3_723, "01:02:03"],
  ])("formats playback second %s as %s", (seconds, expected) => {
    expect(formatTimestamp(seconds)).toBe(expected);
  });

  it("assembles one canonical target into every poster destination", () => {
    const shareTarget = "https://www.bilibili.com/video/BV1xx411c7mD/";
    const poster = buildDefaultPoster(completeSnapshot, shareTarget);

    expect(poster).toMatchObject({
      theme: "A",
      dimensions: { width: 1080, height: 1440 },
      title: completeSnapshot.title,
      uploader: completeSnapshot.uploader,
      identity: "BV1xx411c7mD · AV170001",
      shareTarget,
      titleLines: 2,
      linkWrap: "anywhere",
      contentOrder: ["cover", "title", "uploader-identity", "stats", "destination"],
      stats: [
        { label: "播放", value: "1234.6万" },
        { label: "点赞", value: "9.9万" },
        { label: "投币", value: "--" },
        { label: "收藏", value: "123" },
      ],
    });
  });

  it("assembles one validated short target into every poster destination", () => {
    const poster = buildDefaultPoster(completeSnapshot, "https://b23.tv/a7BomhP");

    expect(poster.shareTarget).toBe("https://b23.tv/a7BomhP");
  });

  it.each([
    ["title", { title: "" }, "视频标题"],
    ["cover", { coverDataUrl: "" }, "视频封面"],
    ["uploader", { uploader: "" }, "UP 主"],
    ["bvid", { bvid: "" }, "BV 标识"],
    ["aid", { aid: 0 }, "AV 标识"],
  ])("blocks export when %s is missing", (_name, replacement, label) => {
    expect(() =>
      buildDefaultPoster({ ...completeSnapshot, ...replacement }, "https://www.bilibili.com/video/BV1xx411c7mD/"),
    ).toThrow(`缺少${label}`);
  });

  it("blocks export when the share target is not a canonical Bilibili video URL", () => {
    expect(() => buildDefaultPoster(completeSnapshot, "javascript:alert(1)")).toThrow("分享链接无效");
  });

  it("names a default-share download without a part segment", () => {
    expect(buildPosterFilename("BV1xx411c7mD", new Date(2026, 7, 14, 9, 5, 12))).toBe(
      "bilibili_BV1xx411c7mD_20260814-090512.png",
    );
  });
});
