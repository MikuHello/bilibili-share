import type { GenerationSnapshot, StatisticValue } from "./domain";
import {
  buildCanonicalShareTarget,
  parseCanonicalVideoIdentity,
  parseShortLinkResponse,
  selectShareTarget,
  type ShareTargetSelection,
} from "./share-target";

interface CapturedPlayback {
  bvid: string;
  partNumber: number;
  playbackSeconds: number;
  wasPlaying: boolean;
  player: HTMLVideoElement;
}

interface VideoApiData {
  aid?: unknown;
  bvid?: unknown;
  title?: unknown;
  pic?: unknown;
  owner?: { name?: unknown };
  stat?: { view?: unknown; like?: unknown; coin?: unknown; favorite?: unknown };
  pages?: Array<{ page?: unknown; part?: unknown }>;
}

interface VideoApiResponse {
  code?: unknown;
  message?: unknown;
  data?: VideoApiData;
}

interface PublicVideoInformation {
  aid: number;
  bvid: string;
  title: string;
  coverUrl: string;
  uploader: string;
  partTitle: string | null;
  partIdentified: boolean;
  stats: GenerationSnapshot["stats"];
}

export interface GenerationResources {
  snapshot: GenerationSnapshot;
  targetSelection: ShareTargetSelection;
}

export type PlaybackCapture = CapturedPlayback;

export function readPageIdentity(url = location.href): { bvid: string; partNumber: number } | null {
  const identity = parseCanonicalVideoIdentity(url);
  if (!identity) return null;
  const rawPart = Number.parseInt(identity.part ?? "1", 10);
  return { bvid: identity.bvid, partNumber: Number.isSafeInteger(rawPart) && rawPart > 0 ? rawPart : 1 };
}

function findMainPlayer(): HTMLVideoElement | null {
  const candidates = Array.from(document.querySelectorAll<HTMLVideoElement>(
    ".bpx-player-video-wrap video, .bilibili-player-video video, video",
  ));
  return candidates
    .filter((video) => video.isConnected)
    .sort((left, right) => right.clientWidth * right.clientHeight - left.clientWidth * left.clientHeight)[0] ?? null;
}

export function captureAndPausePlayback(): PlaybackCapture {
  const player = findMainPlayer();
  if (!player) throw new Error("未找到主播放器。Bilibili 页面结构可能已变化，请刷新页面后重试。");

  const wasPlaying = !player.paused && !player.ended;
  try {
    player.pause();
  } catch {
    throw new Error("无法暂停主播放器，请检查页面播放状态后重试。");
  }
  if (!player.paused) throw new Error("主播放器未能稳定暂停，请重试。");

  const identity = readPageIdentity();
  if (!identity) {
    if (wasPlaying) void player.play().catch(() => undefined);
    throw new Error("当前页面不是受支持的标准视频页，请打开 /video/BV... 页面后重试。");
  }
  const playbackSeconds = Math.max(0, Math.floor(player.currentTime || 0));

  return { ...identity, playbackSeconds, wasPlaying, player };
}

function gmTextRequest(
  url: string,
  options: { method?: "GET" | "POST"; data?: string; headers?: Record<string, string> } = {},
): Promise<string> {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: options.method ?? "GET",
      url,
      data: options.data,
      timeout: 15_000,
      anonymous: true,
      headers: { Referer: "https://www.bilibili.com/", ...options.headers },
      onload(response) {
        if (response.status < 200 || response.status >= 300) {
          reject(new Error(`请求失败（HTTP ${response.status}）`));
          return;
        }
        resolve(response.responseText);
      },
      ontimeout: () => reject(new Error("请求超时，请稍后重试。")),
      onerror: () => reject(new Error("网络请求失败，请检查网络后重试。")),
    });
  });
}

function gmBlobRequest(url: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "GET",
      url,
      responseType: "blob",
      timeout: 15_000,
      anonymous: true,
      headers: { Referer: "https://www.bilibili.com/" },
      onload(response) {
        if (response.status < 200 || response.status >= 300) {
          reject(new Error(`请求失败（HTTP ${response.status}）`));
          return;
        }
        resolve(response.response as Blob);
      },
      ontimeout: () => reject(new Error("请求超时，请稍后重试。")),
      onerror: () => reject(new Error("网络请求失败，请检查网络后重试。")),
    });
  });
}

function gmResolvedUrlRequest(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "HEAD",
      url,
      redirect: "follow",
      timeout: 15_000,
      anonymous: true,
      headers: { Referer: "https://www.bilibili.com/" },
      onload(response) {
        if (response.status < 200 || response.status >= 300) {
          reject(new Error(`短链解析失败（HTTP ${response.status}）`));
          return;
        }
        if (!response.finalUrl) {
          reject(new Error("短链解析未返回落点"));
          return;
        }
        resolve(response.finalUrl);
      },
      ontimeout: () => reject(new Error("短链解析超时，请稍后重试")),
      onerror: () => reject(new Error("短链解析失败，请稍后重试")),
    });
  });
}

function requiredText(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) throw new Error(`视频信息缺少${label}。`);
  return value.trim();
}

function requiredPositiveInteger(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`视频信息缺少${label}。`);
  }
  return value;
}

function statistic(value: unknown): StatisticValue {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.trunc(value) : null;
}

function parsePartInformation(
  pages: unknown,
  expectedPartNumber: number,
): { partTitle: string | null; partIdentified: boolean } {
  if (!Array.isArray(pages)) return { partTitle: null, partIdentified: false };
  const current = pages.find(
    (page): page is { page?: unknown; part?: unknown } =>
      typeof page === "object" && page !== null && (page as { page?: unknown }).page === expectedPartNumber,
  );
  if (!current) return { partTitle: null, partIdentified: false };
  const partTitle = typeof current.part === "string" && current.part.trim() ? current.part.trim() : null;
  return { partTitle, partIdentified: true };
}

export function parseVideoApiResponse(
  payload: unknown,
  expectedBvid: string,
  expectedPartNumber = 1,
): PublicVideoInformation {
  const response = payload as VideoApiResponse;
  if (response?.code !== 0 || !response.data) {
    const detail = typeof response?.message === "string" && response.message ? `：${response.message}` : "";
    throw new Error(`Bilibili 视频信息请求失败${detail}`);
  }

  const data = response.data;
  const bvid = requiredText(data.bvid, "BV 标识");
  if (bvid.toUpperCase() !== expectedBvid.toUpperCase()) throw new Error("视频身份校验失败，请重试。");
  const partInformation = parsePartInformation(data.pages, expectedPartNumber);
  return {
    bvid,
    aid: requiredPositiveInteger(data.aid, "AV 标识"),
    coverUrl: typeof data.pic === "string" ? data.pic.trim() : "",
    title: requiredText(data.title, "视频标题"),
    uploader: requiredText(data.owner?.name, "UP 主"),
    partTitle: partInformation.partTitle,
    partIdentified: partInformation.partIdentified,
    stats: {
      views: statistic(data.stat?.view),
      likes: statistic(data.stat?.like),
      coins: statistic(data.stat?.coin),
      favorites: statistic(data.stat?.favorite),
    },
  };
}

export function isUsableCover(width: number, height: number): boolean {
  return Number.isFinite(width) && Number.isFinite(height) && width >= 160 && height >= 90;
}

async function blobToImageDataUrl(blob: Blob): Promise<string> {
  if (blob.size === 0 || (blob.type && !blob.type.startsWith("image/"))) {
    throw new Error("Bilibili 返回的视频封面无效，请重试。");
  }
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("视频封面读取失败。"));
    reader.readAsDataURL(blob);
  });
  const image = new Image();
  image.src = dataUrl;
  try {
    await image.decode();
  } catch {
    throw new Error("Bilibili 返回的视频封面无法解码，请重试。");
  }
  if (!isUsableCover(image.naturalWidth, image.naturalHeight)) throw new Error("Bilibili 返回的视频封面尺寸不可用，请重试。");
  return dataUrl;
}

async function loadCover(coverUrl: string): Promise<{ dataUrl: string; unavailable: boolean }> {
  try {
    if (!coverUrl) return { dataUrl: "", unavailable: true };
    const blob = await gmBlobRequest(coverUrl.replace(/^http:/, "https:"));
    return { dataUrl: await blobToImageDataUrl(blob), unavailable: false };
  } catch {
    return { dataUrl: "", unavailable: true };
  }
}

export async function fetchGenerationSnapshot(capture: PlaybackCapture): Promise<GenerationSnapshot> {
  const endpoint = `https://api.bilibili.com/x/web-interface/view?bvid=${encodeURIComponent(capture.bvid)}`;
  let payload: unknown;
  try {
    payload = JSON.parse(await gmTextRequest(endpoint)) as VideoApiResponse;
  } catch (error) {
    if (error instanceof SyntaxError) throw new Error("Bilibili 返回了无法解析的视频信息，请重试。");
    throw error;
  }
  const video = parseVideoApiResponse(payload, capture.bvid, capture.partNumber);
  const cover = await loadCover(video.coverUrl);

  return {
    bvid: video.bvid,
    aid: video.aid,
    coverDataUrl: cover.dataUrl,
    coverUnavailable: cover.unavailable,
    title: video.title,
    uploader: video.uploader,
    partNumber: capture.partNumber,
    partTitle: video.partTitle,
    partIdentified: video.partIdentified,
    playbackSeconds: capture.playbackSeconds,
    wasPlaying: capture.wasPlaying,
    stats: video.stats,
  };
}

export async function fetchValidatedShareTarget(
  snapshot: GenerationSnapshot,
  canonicalTarget: string,
): Promise<ShareTargetSelection> {
  try {
    const form = new URLSearchParams({
      build: "6500300",
      buvid: "bsp-userscript-public",
      oid: snapshot.aid.toString(),
      platform: "web",
      share_channel: "COPY",
      share_id: "main.ugc-video-detail.0.0.pv",
      share_mode: "3",
      share_origin: "vinfo_share",
    });
    const responseText = await gmTextRequest("https://api.bilibili.com/x/share/click", {
      method: "POST",
      data: form.toString(),
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
    });
    let payload: unknown;
    try {
      payload = JSON.parse(responseText);
    } catch {
      throw new Error("Bilibili 返回了无法解析的短链响应");
    }
    const shortUrl = parseShortLinkResponse(payload);
    const resolvedUrl = await gmResolvedUrlRequest(shortUrl);
    return selectShareTarget(canonicalTarget, { status: "resolved", shortUrl, resolvedUrl });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "短链暂时不可用";
    return selectShareTarget(canonicalTarget, { status: "failed", reason });
  }
}

export async function fetchGenerationResources(capture: PlaybackCapture): Promise<GenerationResources> {
  const snapshot = await fetchGenerationSnapshot(capture);
  const canonicalTarget = buildCanonicalShareTarget(
    snapshot.bvid,
    snapshot,
    { partShare: false, timestampShare: false },
  );
  const targetSelection = await fetchValidatedShareTarget(snapshot, canonicalTarget);
  return { snapshot, targetSelection };
}

export function restorePlayback(capture: PlaybackCapture): void {
  if (!capture.wasPlaying || !capture.player.isConnected) return;
  const current = readPageIdentity();
  if (!current || current.bvid.toUpperCase() !== capture.bvid.toUpperCase() || current.partNumber !== capture.partNumber) return;
  void capture.player.play().catch(() => undefined);
}
