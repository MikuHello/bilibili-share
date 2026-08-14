interface ShortLinkApiResponse {
  code?: unknown;
  message?: unknown;
  data?: { content?: unknown };
}

export interface ShareTargetSelection {
  shareTarget: string;
  source: "short" | "canonical-fallback";
  fallbackReason?: string;
}

interface ResolvedShortLink {
  status: "resolved";
  shortUrl: string;
  resolvedUrl: string;
}

interface FailedShortLink {
  status: "failed";
  reason: string;
}

export function isOpaqueShortUrl(url: URL): boolean {
  return (
    url.protocol === "https:" &&
    url.hostname === "b23.tv" &&
    /^\/[0-9A-Za-z]+$/.test(url.pathname) &&
    !url.search &&
    !url.hash &&
    !url.username &&
    !url.password &&
    !url.port
  );
}

function shareIdentity(rawUrl: string): { bvid: string; part: string | null; timestamp: string | null } {
  const url = new URL(rawUrl);
  const match = url.pathname.match(/^\/video\/(BV[0-9A-Za-z]+)\/?$/i);
  if (url.protocol !== "https:" || url.hostname !== "www.bilibili.com" || !match) {
    throw new Error("分享链接无效");
  }
  return {
    bvid: match[1].toUpperCase(),
    part: url.searchParams.get("p"),
    timestamp: url.searchParams.get("t"),
  };
}

export function parseShortLinkResponse(payload: unknown): string {
  const response = payload as ShortLinkApiResponse;
  if (response?.code !== 0) {
    const detail = typeof response?.message === "string" && response.message ? `：${response.message}` : "";
    throw new Error(`Bilibili 短链请求失败${detail}`);
  }
  if (typeof response.data?.content !== "string" || !response.data.content.trim()) {
    throw new Error("Bilibili 短链响应缺少有效链接");
  }
  for (const token of response.data.content.split(/\s+/)) {
    try {
      const url = new URL(token);
      if (isOpaqueShortUrl(url)) return url.toString();
    } catch {
      // Non-URL title text is expected before the short link.
    }
  }
  throw new Error("Bilibili 短链响应缺少有效链接");
}

export function selectShareTarget(
  canonicalTarget: string,
  attempt: ResolvedShortLink | FailedShortLink,
): ShareTargetSelection {
  const expected = shareIdentity(canonicalTarget);
  if (attempt.status === "failed") {
    return {
      shareTarget: canonicalTarget,
      source: "canonical-fallback",
      fallbackReason: attempt.reason,
    };
  }
  let resolved: ReturnType<typeof shareIdentity>;
  try {
    resolved = shareIdentity(attempt.resolvedUrl);
  } catch {
    return {
      shareTarget: canonicalTarget,
      source: "canonical-fallback",
      fallbackReason: "短链落点无效",
    };
  }
  if (
    resolved.bvid !== expected.bvid ||
    resolved.part !== expected.part ||
    resolved.timestamp !== expected.timestamp
  ) {
    return {
      shareTarget: canonicalTarget,
      source: "canonical-fallback",
      fallbackReason: "短链落点与本次生成快照不一致",
    };
  }
  return { shareTarget: attempt.shortUrl, source: "short" };
}
