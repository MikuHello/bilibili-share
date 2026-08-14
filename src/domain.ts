export type StatisticValue = number | null;

export interface GenerationSnapshot {
  bvid: string;
  aid: number;
  coverDataUrl: string;
  title: string;
  uploader: string;
  partNumber: number;
  playbackSeconds: number;
  wasPlaying: boolean;
  stats: {
    views: StatisticValue;
    likes: StatisticValue;
    coins: StatisticValue;
    favorites: StatisticValue;
  };
}

export interface DefaultPoster {
  theme: "A";
  dimensions: { width: 1080; height: 1440 };
  coverDataUrl: string;
  title: string;
  uploader: string;
  identity: string;
  shareTarget: string;
  qrTarget: string;
  titleLines: 2;
  linkWrap: "anywhere";
  contentOrder: readonly ["cover", "title", "uploader-identity", "stats", "destination"];
  stats: Array<{ label: string; value: string }>;
}

export function getDefaultTheme(): { id: "A"; titleLines: 2 } {
  return { id: "A", titleLines: 2 };
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

export function buildPosterFilename(bvid: string, generatedAt: Date): string {
  const twoDigits = (value: number) => value.toString().padStart(2, "0");
  const stamp = `${generatedAt.getFullYear()}${twoDigits(generatedAt.getMonth() + 1)}${twoDigits(generatedAt.getDate())}-${twoDigits(generatedAt.getHours())}${twoDigits(generatedAt.getMinutes())}${twoDigits(generatedAt.getSeconds())}`;
  return `bilibili_${bvid}_${stamp}.png`;
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

  const expectedPath = `/video/${bvid}/`;
  if (url.protocol !== "https:" || url.hostname !== "www.bilibili.com" || url.pathname !== expectedPath) {
    throw new Error("分享链接无效");
  }
  return url.toString();
}

export function buildDefaultPoster(snapshot: GenerationSnapshot, shareTarget: string): DefaultPoster {
  const title = requireText(snapshot.title, "视频标题");
  const coverDataUrl = requireText(snapshot.coverDataUrl, "视频封面");
  const uploader = requireText(snapshot.uploader, "UP 主");
  const bvid = requireText(snapshot.bvid, "BV 标识");
  if (!Number.isSafeInteger(snapshot.aid) || snapshot.aid <= 0) throw new Error("缺少AV 标识");
  const canonicalTarget = validateShareTarget(shareTarget, bvid);
  const defaultTheme = getDefaultTheme();

  return {
    theme: defaultTheme.id,
    dimensions: { width: 1080, height: 1440 },
    coverDataUrl,
    title,
    uploader,
    identity: `${bvid} · AV${snapshot.aid}`,
    shareTarget: canonicalTarget,
    qrTarget: canonicalTarget,
    titleLines: defaultTheme.titleLines,
    linkWrap: "anywhere",
    contentOrder: ["cover", "title", "uploader-identity", "stats", "destination"],
    stats: [
      { label: "播放", value: formatCompactStat(snapshot.stats.views) },
      { label: "点赞", value: formatCompactStat(snapshot.stats.likes) },
      { label: "投币", value: formatCompactStat(snapshot.stats.coins) },
      { label: "收藏", value: formatCompactStat(snapshot.stats.favorites) },
    ],
  };
}
