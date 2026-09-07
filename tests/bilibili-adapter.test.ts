import { describe, expect, it } from "vitest";

import { isUsableCover, parseVideoApiResponse } from "../src/bilibili";
import { buildSharePoster } from "../src/domain";

const validResponse = {
  code: 0,
  message: "0",
  data: {
    aid: 170001,
    bvid: "BV1xx411c7mD",
    title: "一个用于测试的视频",
    pic: "https://i0.hdslb.com/bfs/archive/cover.jpg",
    owner: { name: "测试 UP 主" },
    stat: { view: 10, like: 9, coin: 8, favorite: 7 },
  },
};

describe("public video information adapter", () => {
  it.each([
    { honor_reply: { honor: [{ type: 9, desc: "未知" }, { type: 2, desc: "第389期每周必看" }] } },
    { honor_reply: { honor: [{ type: 2, desc: "第389期每周必看" }] }, argue_info: { argue_type: 1 } },
    { honor_reply: { honor: [{ type: 3, desc: "全站排行榜最高第4名" }] }, argue_info: { argue_type: 2 } },
    { honor_reply: { honor: [{ type: 1, desc: "  " }] } },
    { honor_reply: { honor: [{ type: 1, desc: { text: "不可字符串化" } }] } },
    { honor_reply: { honor: { 0: { type: 1, desc: "非数组" } } } },
    { honor_reply: null },
  ])("omits unusable or suppressed primary honors without losing video information: %j", (fields) => {
    const video = parseVideoApiResponse({ ...validResponse, data: { ...validResponse.data, ...fields } }, "BV1xx411c7mD");
    expect(video.title).toBe("一个用于测试的视频");
    expect(video.honor).toBeUndefined();
  });
  it("preserves the primary video honor through the poster snapshot", () => {
    const video = parseVideoApiResponse({ ...validResponse, data: { ...validResponse.data,
      honor_reply: { honor: [{ type: 2, desc: "第389期每周必看" }, { type: 3, desc: "全站排行榜最高第4名" }] },
    } }, "BV1xx411c7mD");
    const poster = buildSharePoster({ ...video, coverDataUrl: "data:image/png;base64,test", coverUnavailable: false,
      partNumber: 1, playbackSeconds: 0, wasPlaying: false,
    }, "https://www.bilibili.com/video/BV1xx411c7mD");
    expect(poster.honor).toBe("第389期每周必看");
  });
  it("rejects a metadata business error", () => {
    expect(() => parseVideoApiResponse({ code: -400, message: "请求错误" }, "BV1xx411c7mD")).toThrow(
      "Bilibili 视频信息请求失败：请求错误",
    );
  });

  it("rejects a successful response with a missing required field", () => {
    expect(() =>
      parseVideoApiResponse(
        { ...validResponse, data: { ...validResponse.data, title: "" } },
        "BV1xx411c7mD",
      ),
    ).toThrow("视频信息缺少视频标题");
  });

  it("normalizes a complete anonymous public response", () => {
    expect(parseVideoApiResponse(validResponse, "BV1xx411c7mD")).toEqual({
      aid: 170001,
      bvid: "BV1xx411c7mD",
      title: "一个用于测试的视频",
      coverUrl: "https://i0.hdslb.com/bfs/archive/cover.jpg",
      uploader: "测试 UP 主",
      partTitle: null,
      partIdentified: false,
      stats: { views: 10, likes: 9, coins: 8, favorites: 7 },
    });

    expect(
      parseVideoApiResponse(
        {
          ...validResponse,
          data: {
            ...validResponse.data,
            pages: [
              { page: 1, part: "P1 正片" },
              { page: 2, part: "P2 花絮" },
            ],
          },
        },
        "BV1xx411c7mD",
        2,
      ),
    ).toMatchObject({ partTitle: "P2 花絮", partIdentified: true });
  });

  it("allows metadata without a cover to reach the placeholder path", () => {
    expect(parseVideoApiResponse({ ...validResponse, data: { ...validResponse.data, pic: null } }, "BV1xx411c7mD").coverUrl).toBe("");
  });

  it("accepts usable cover dimensions and rejects degenerate placeholders", () => {
    expect(isUsableCover(160, 90)).toBe(true);
    expect(isUsableCover(1920, 1080)).toBe(true);
    expect(isUsableCover(1, 1)).toBe(false);
    expect(isUsableCover(159, 90)).toBe(false);
    expect(isUsableCover(160, 89)).toBe(false);
  });
});
