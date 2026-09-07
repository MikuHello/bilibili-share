import { describe, expect, it } from "vitest";
import { buildCanonicalShareTarget, parseCanonicalVideoIdentity } from "../src/share-target";

describe("canonical share target", () => {
  it.each([
    [false, false, "https://www.bilibili.com/video/BV1xx411c7mD/"],
    [true, false, "https://www.bilibili.com/video/BV1xx411c7mD/?p=2"],
    [true, true, "https://www.bilibili.com/video/BV1xx411c7mD/?p=2&t=61"],
    [false, true, "https://www.bilibili.com/video/BV1xx411c7mD/"],
  ])("derives part=%s time=%s from the generation snapshot", (partShare, timestampShare, expected) => {
    expect(buildCanonicalShareTarget("BV1xx411c7mD", { partNumber: 2, playbackSeconds: 61.9 }, { partShare, timestampShare })).toBe(expected);
  });
  it("rejects invalid video identity before constructing a destination", () => {
    expect(() => buildCanonicalShareTarget("other/?evil=1", { partNumber: 1, playbackSeconds: 0 }, { partShare: false, timestampShare: false })).toThrow("分享链接无效");
  });
  it.each(["http://www.bilibili.com/video/BV1xx411c7mD/", "https://evil.test/video/BV1xx411c7mD/", "https://name:secret@www.bilibili.com/video/BV1xx411c7mD/", "https://www.bilibili.com:444/video/BV1xx411c7mD/"])("rejects noncanonical origin %s", (url) => {
    expect(parseCanonicalVideoIdentity(url)).toBeNull();
  });
});
