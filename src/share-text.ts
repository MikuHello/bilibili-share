import { buildPartLabel, formatTimestamp, type GenerationSnapshot, type StatisticValue } from "./domain";
import type { ShareOptions } from "./options";

export function buildCompactShareText(title: string, uploader: string, shareTarget: string): string {
  return `${title}（UP主：${uploader}）\n${shareTarget}`;
}

export function formatExactStat(value: StatisticValue): string {
  if (value === null || !Number.isFinite(value)) return "--";
  const whole = Math.max(0, Math.trunc(value));
  return whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function plainDetailedText(snapshot: GenerationSnapshot, shareTarget: string, options: ShareOptions): string {
  const lines = [
    snapshot.title,
    `UP主：${snapshot.uploader}`,
    `BV/AV：${snapshot.bvid} · AV${snapshot.aid}`,
    `播放：${formatExactStat(snapshot.stats.views)}　点赞：${formatExactStat(snapshot.stats.likes)}　投币：${formatExactStat(snapshot.stats.coins)}　收藏：${formatExactStat(snapshot.stats.favorites)}`,
  ];
  const partLabel = buildPartLabel(snapshot, options);
  if (partLabel) lines.push(`分P：${partLabel}`);
  if (options.timestampShare && Math.floor(snapshot.playbackSeconds) >= 1) {
    lines.push(`时间：${formatTimestamp(snapshot.playbackSeconds)}`);
  }
  lines.push(shareTarget);
  return lines.join("\n");
}

function markdownDetailedText(snapshot: GenerationSnapshot, shareTarget: string, options: ShareOptions): string {
  const lines = [
    `**${snapshot.title}**`,
    "",
    `- UP主：${snapshot.uploader}`,
    `- BV/AV：${snapshot.bvid} · AV${snapshot.aid}`,
    `- 播放：${formatExactStat(snapshot.stats.views)} · 点赞：${formatExactStat(snapshot.stats.likes)} · 投币：${formatExactStat(snapshot.stats.coins)} · 收藏：${formatExactStat(snapshot.stats.favorites)}`,
  ];
  const partLabel = buildPartLabel(snapshot, options);
  if (partLabel) lines.push(`- 分P：${partLabel}`);
  if (options.timestampShare && Math.floor(snapshot.playbackSeconds) >= 1) {
    lines.push(`- 时间：${formatTimestamp(snapshot.playbackSeconds)}`);
  }
  lines.push(`- 链接：${shareTarget}`);
  return lines.join("\n");
}

export function buildShareText(snapshot: GenerationSnapshot, shareTarget: string, options: ShareOptions): string {
  if (options.detailedText) {
    return options.markdownText
      ? markdownDetailedText(snapshot, shareTarget, options)
      : plainDetailedText(snapshot, shareTarget, options);
  }
  if (options.markdownText) {
    return `[${snapshot.title}](${shareTarget})\n${shareTarget}`;
  }
  return buildCompactShareText(snapshot.title, snapshot.uploader, shareTarget);
}
