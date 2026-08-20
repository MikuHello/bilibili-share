import type { PosterTheme, ShareOptions } from "./options";
import { isOpaqueShortUrl, parseCanonicalVideoIdentity } from "./share-target";

export type StatisticValue = number | null;

export interface GenerationSnapshot {
  bvid: string;
  aid: number;
  coverDataUrl: string;
  coverUnavailable: boolean;
  title: string;
  uploader: string;
  partNumber: number;
  partTitle: string | null;
  partIdentified: boolean;
  playbackSeconds: number;
  wasPlaying: boolean;
  stats: {
    views: StatisticValue;
    likes: StatisticValue;
    coins: StatisticValue;
    favorites: StatisticValue;
  };
}

export type PosterSection = "cover" | "title" | "uploader-identity" | "part-timestamp" | "stats" | "destination";

export interface SharePoster {
  theme: PosterTheme;
  dimensions: { width: 1080; height: 1440 };
  coverDataUrl: string;
  coverUnavailable: boolean;
  title: string;
  uploader: string;
  identity: string;
  shareTarget: string;
  titleLines: 2 | 3;
  titleFontSize: 19 | 17 | 15;
  linkWrap: "anywhere";
  contentOrder: readonly PosterSection[];
  partLabel: string | null;
  timestampLabel: string | null;
  stats: Array<{ label: string; value: string }>;
}

export type DefaultPoster = SharePoster;

export function getDefaultTheme(): { id: "A"; titleLines: 2 } {
  return { id: "A", titleLines: 2 };
}

export function posterTitleFontSize(theme: PosterTheme, title: string): 19 | 17 | 15 {
  if (theme === "A") return 19;
  const length = Array.from(title).length;
  if (length <= 20) return 19;
  if (length <= 32) return 17;
  return 15;
}

export function formatCompactStat(value: StatisticValue): string {
  if (value === null || !Number.isFinite(value)) return "--";
  if (value >= 100_000_000) return `${(value / 100_000_000).toFixed(1)}亿`;
  if (value >= 10_000) return `${(value / 10_000).toFixed(1)}万`;
  return Math.max(0, Math.trunc(value)).toString();
}

export function formatTimestamp(seconds: number): string {
  const wholeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(wholeSeconds / 3_600);
  const minutes = Math.floor((wholeSeconds % 3_600) / 60);
  const remainder = wholeSeconds % 60;
  const mm = minutes.toString().padStart(2, "0");
  const ss = remainder.toString().padStart(2, "0");
  return hours > 0 ? `${hours.toString().padStart(2, "0")}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function buildPosterFilename(bvid: string, generatedAt: Date, partNumber?: number | null): string {
  const twoDigits = (value: number) => value.toString().padStart(2, "0");
  const stamp = `${generatedAt.getFullYear()}${twoDigits(generatedAt.getMonth() + 1)}${twoDigits(generatedAt.getDate())}-${twoDigits(generatedAt.getHours())}${twoDigits(generatedAt.getMinutes())}${twoDigits(generatedAt.getSeconds())}`;
  const partSegment = partNumber && partNumber > 0 ? `_P${partNumber}` : "";
  return `bilibili_${bvid}${partSegment}_${stamp}.png`;
}

export function buildPartLabel(snapshot: GenerationSnapshot, options: ShareOptions): string | null {
  if (!options.partShare) return null;
  const title = snapshot.partTitle?.trim() ? snapshot.partTitle.trim() : "";
  return title ? `P${snapshot.partNumber} · ${title}` : `P${snapshot.partNumber}`;
}

export function buildTimestampLabel(snapshot: GenerationSnapshot, options: ShareOptions): string | null {
  return options.timestampShare && Math.floor(snapshot.playbackSeconds) >= 1
    ? formatTimestamp(snapshot.playbackSeconds)
    : null;
}

function requireText(value: string, label: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(`缺少${label}`);
  return normalized;
}

function validateShareTarget(shareTarget: string, bvid: string): string {
  let url: URL;
  try {
    url = new URL(shareTarget);
  } catch {
    throw new Error("分享链接无效");
  }

  const canonicalIdentity = parseCanonicalVideoIdentity(url.toString());
  const isCanonical = canonicalIdentity?.bvid.toUpperCase() === bvid.toUpperCase();
  const isOpaqueShort = isOpaqueShortUrl(url);
  if (url.protocol !== "https:" || (!isCanonical && !isOpaqueShort)) {
    throw new Error("分享链接无效");
  }
  return url.toString();
}

export function buildSharePoster(snapshot: GenerationSnapshot, shareTarget: string, options: ShareOptions): SharePoster {
  const title = requireText(snapshot.title, "视频标题");
  const coverDataUrl = snapshot.coverUnavailable ? "" : requireText(snapshot.coverDataUrl, "视频封面");
  const uploader = requireText(snapshot.uploader, "UP 主");
  const bvid = requireText(snapshot.bvid, "BV 标识");
  if (!Number.isSafeInteger(snapshot.aid) || snapshot.aid <= 0) throw new Error("缺少AV 标识");
  const validatedShareTarget = validateShareTarget(shareTarget, bvid);
  const theme: PosterTheme = options.theme === "B" ? "B" : "A";
  const titleLines = theme === "A" ? (2 as const) : (3 as const);
  const contentOrder =
    theme === "A"
      ? (["cover", "title", "uploader-identity", "part-timestamp", "stats", "destination"] as const)
      : (["cover", "part-timestamp", "title", "uploader-identity", "stats", "destination"] as const);

  return {
    theme,
    dimensions: { width: 1080, height: 1440 },
    coverDataUrl,
    coverUnavailable: snapshot.coverUnavailable,
    title,
    uploader,
    identity: `${bvid} · AV${snapshot.aid}`,
    shareTarget: validatedShareTarget,
    titleLines,
    titleFontSize: posterTitleFontSize(theme, title),
    linkWrap: "anywhere",
    contentOrder,
    partLabel: buildPartLabel(snapshot, options),
    timestampLabel: buildTimestampLabel(snapshot, options),
    stats: [
      { label: "播放", value: formatCompactStat(snapshot.stats.views) },
      { label: "点赞", value: formatCompactStat(snapshot.stats.likes) },
      { label: "投币", value: formatCompactStat(snapshot.stats.coins) },
      { label: "收藏", value: formatCompactStat(snapshot.stats.favorites) },
    ],
  };
}

export function buildDefaultPoster(snapshot: GenerationSnapshot, shareTarget: string): DefaultPoster {
  return buildSharePoster(snapshot, shareTarget, {
    theme: "A",
    partShare: false,
    timestampShare: false,
    detailedText: false,
    markdownText: false,
  });
}
