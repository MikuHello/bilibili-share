import { describe, expect, it } from "vitest";

import { isUsableCover, parseVideoApiResponse } from "../src/bilibili";

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
