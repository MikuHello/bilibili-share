import { describe, expect, it } from "vitest";

import {
  canEnablePartShare,
  canEnableTimestampShare,
  createDefaultShareOptions,
  createPanelShareOptions,
  resolveRememberedPreferences,
  togglePartShare,
  toggleTimestampShare,
} from "../src/options";
import { buildCanonicalShareTarget } from "../src/share-target";

const p1 = { partNumber: 1, playbackSeconds: 61, partIdentified: true };
const p2 = { partNumber: 2, playbackSeconds: 61, partIdentified: true };
const belowOneSecond = { partNumber: 1, playbackSeconds: 0, partIdentified: true };
const unidentified = { partNumber: 2, playbackSeconds: 61, partIdentified: false };

describe("part and timestamp share options", () => {
  it("resets part and timestamp sharing to off for every reopened panel", () => {
    expect(createDefaultShareOptions()).toEqual({
      theme: "A",
      partShare: false,
      timestampShare: false,
      detailedText: false,
      markdownText: false,
    });
  });

  it("enables part sharing only when the current part is identified", () => {
    expect(canEnablePartShare(p2)).toBe(true);
    expect(canEnablePartShare(unidentified)).toBe(false);
  });

  it("enables timestamp sharing only at one second or later and only with an identified part", () => {
    expect(canEnableTimestampShare(p1)).toBe(true);
    expect(canEnableTimestampShare(p2)).toBe(true);
    expect(canEnableTimestampShare(belowOneSecond)).toBe(false);
    expect(canEnableTimestampShare(unidentified)).toBe(false);
  });

  it("turning on timestamp sharing on P2 also turns on part sharing", () => {
    const options = toggleTimestampShare(createDefaultShareOptions(), p2);

    expect(options).toMatchObject({ partShare: true, timestampShare: true });
  });

  it("turning off part sharing on P2 also turns off timestamp sharing", () => {
    const enabled = { ...createDefaultShareOptions(), partShare: true, timestampShare: true };
    const options = togglePartShare(enabled, p2);

    expect(options).toMatchObject({ partShare: false, timestampShare: false });
  });

  it("keeps timestamp sharing independent on P1", () => {
    const options = toggleTimestampShare(createDefaultShareOptions(), p1);

    expect(options).toMatchObject({ partShare: false, timestampShare: true });
  });

  it("does not enable a t=0 timestamp", () => {
    const options = toggleTimestampShare(createDefaultShareOptions(), belowOneSecond);

    expect(options).toEqual(createDefaultShareOptions());
  });
});

describe("canonical share target with part and timestamp", () => {
  it("uses the default beginning when neither option is enabled", () => {
    expect(buildCanonicalShareTarget("BV1xx411c7mD", { partNumber: 2, playbackSeconds: 61 }, createDefaultShareOptions())).toBe(
      "https://www.bilibili.com/video/BV1xx411c7mD/",
    );
  });

  it("adds only p when part sharing is enabled", () => {
    expect(
      buildCanonicalShareTarget(
        "BV1xx411c7mD",
        p2,
        { ...createDefaultShareOptions(), partShare: true },
      ),
    ).toBe("https://www.bilibili.com/video/BV1xx411c7mD/?p=2");
  });

  it("adds only floored t when timestamp sharing is enabled on P1", () => {
    expect(
      buildCanonicalShareTarget(
        "BV1xx411c7mD",
        { ...p1, playbackSeconds: 61.9 },
        { ...createDefaultShareOptions(), timestampShare: true },
      ),
    ).toBe("https://www.bilibili.com/video/BV1xx411c7mD/?t=61");
  });

  it("adds p and t together when both options are enabled", () => {
    expect(
      buildCanonicalShareTarget(
        "BV1xx411c7mD",
        p2,
        { ...createDefaultShareOptions(), partShare: true, timestampShare: true },
      ),
    ).toBe("https://www.bilibili.com/video/BV1xx411c7mD/?p=2&t=61");
  });
});

describe("remembered text and theme preferences", () => {
  it("falls back to safe defaults for missing or malformed storage", () => {
    expect(resolveRememberedPreferences(null)).toEqual({ theme: "A", detailedText: false, markdownText: false });
    expect(resolveRememberedPreferences({ theme: "C", detailedText: "yes", markdownText: 1 })).toEqual({
      theme: "A",
      detailedText: false,
      markdownText: false,
    });
  });

  it("restores valid remembered choices while resetting part and timestamp options", () => {
    const options = createPanelShareOptions({ theme: "B", detailedText: true, markdownText: true });

    expect(options).toEqual({
      theme: "B",
      partShare: false,
      timestampShare: false,
      detailedText: true,
      markdownText: true,
    });
  });
});
