export interface CanonicalVideoIdentity {
  bvid: string;
  part: string | null;
  timestamp: string | null;
}

export function parseCanonicalVideoIdentity(rawUrl: string): CanonicalVideoIdentity | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }
  const match = url.pathname.match(/^\/video\/(BV[0-9A-Za-z]+)\/?$/i);
  if (url.protocol !== "https:" || url.hostname !== "www.bilibili.com" || url.username || url.password || url.port || !match) {
    return null;
  }
  return {
    bvid: match[1],
    part: url.searchParams.get("p"),
    timestamp: url.searchParams.get("t"),
  };
}

export interface ShareTargetContext {
  partNumber: number;
  playbackSeconds: number;
}

export interface ShareTargetOptions {
  partShare: boolean;
  timestampShare: boolean;
}

export function buildCanonicalShareTarget(
  bvid: string,
  context: ShareTargetContext,
  options: ShareTargetOptions,
): string {
  if (!/^BV[0-9A-Za-z]+$/i.test(bvid)) throw new Error("分享链接无效");
  const params: string[] = [];
  if (options.partShare) params.push(`p=${context.partNumber}`);
  if (options.timestampShare && (context.partNumber === 1 || options.partShare) && Math.floor(context.playbackSeconds) >= 1) {
    params.push(`t=${Math.floor(context.playbackSeconds)}`);
  }
  const query = params.length > 0 ? `?${params.join("&")}` : "";
  return `https://www.bilibili.com/video/${bvid}/${query}`;
}
