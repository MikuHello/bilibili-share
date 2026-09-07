import { renderShareTextTemplate } from "./share-text-template";
import { buildPartLabel, formatTimestamp, type GenerationSnapshot, type StatisticValue } from "./domain";
import { canEnablePartShare, canEnableTimestampShare, type ShareOptions } from "./options";

export function buildCompactShareText(title: string, uploader: string, shareTarget: string): string {
  return `${title}（UP主：${uploader}）\n${shareTarget}`;
}

export function formatExactStat(value: StatisticValue): string {
  if (value === null || !Number.isFinite(value)) return "--";
  const whole = Math.max(0, Math.trunc(value));
  return whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function escapeMarkdown(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replace(/([\\`*_[\]{}()#+.!|>~-])/g, "\\$1");
}

function markdownDetailedText(snapshot: GenerationSnapshot, shareTarget: string, options: ShareOptions): string {
  const lines = [
    `**${escapeMarkdown(snapshot.title)}**`,
    "",
    `- UP主：${escapeMarkdown(snapshot.uploader)}`,
    `- 播放：${formatExactStat(snapshot.stats.views)} · 点赞：${formatExactStat(snapshot.stats.likes)} · 投币：${formatExactStat(snapshot.stats.coins)} · 收藏：${formatExactStat(snapshot.stats.favorites)}`,
  ];
  if (snapshot.honor) lines.push(`- ${escapeMarkdown(snapshot.honor)}`);
  const partLabel = buildPartLabel(snapshot, options);
  if (partLabel) lines.push(`- 分P：${escapeMarkdown(partLabel)}`);
  if (options.timestampShare && Math.floor(snapshot.playbackSeconds) >= 1) {
    lines.push(`- 时间：${formatTimestamp(snapshot.playbackSeconds)}`);
  }
  lines.push(`- ${snapshot.bvid} · av${snapshot.aid}`, `- 链接：${shareTarget}`);
  return lines.join("\n");
}

export const DEFAULT_PLAIN_TEMPLATES = {
  compact: "{{title}}（UP主：{{uploader}}）\n{{url}}",
  detailed: "{{title}}\nUP主：{{uploader}}\n播放：{{views}}　点赞：{{likes}}　投币：{{coins}}　收藏：{{favorites}}\n{{#if honor}}{{honor}}\n{{/if}}{{#if part}}分P：{{part}}\n{{/if}}{{#if timestamp}}时间：{{timestamp}}\n{{/if}}{{bvid}} · av{{aid}}\n{{url}}",
};

export interface ShareTextTemplates {
  plain?: Partial<Record<"compact" | "detailed", string>>;
}

export function buildShareText(snapshot: GenerationSnapshot, shareTarget: string, options: ShareOptions, templates: ShareTextTemplates = {}): string {
  if (!options.markdownText) {
    const preset = options.detailedText ? "detailed" : "compact";
    const values: Record<string, string | number | null | undefined> = {
      title: snapshot.title, uploader: snapshot.uploader, url: shareTarget,
      bvid: snapshot.bvid, aid: snapshot.aid, ...snapshot.stats,
      honor: snapshot.honor?.trim() ? snapshot.honor : null,
      part: canEnablePartShare(snapshot) ? buildPartLabel(snapshot, options) : null,
      timestamp: options.timestampShare && canEnableTimestampShare(snapshot)
        ? formatTimestamp(snapshot.playbackSeconds) : null,
    };
    const available = (name: string) => values[name] !== null && values[name] !== undefined &&
      (typeof values[name] === "number" ? Number.isFinite(values[name]) : String(values[name]).trim() !== "");
    const template = templates.plain?.[preset] ?? DEFAULT_PLAIN_TEMPLATES[preset];
    const variables = Object.fromEntries(Object.entries(values).map(([name, value]) => [name, {
      available: available(name),
      text: ["views", "likes", "coins", "favorites"].includes(name)
        ? formatExactStat(value as StatisticValue) : String(value ?? ""),
    }]));
    return renderShareTextTemplate(template, `plain.${preset}`, variables);
  }
  if (options.detailedText) return markdownDetailedText(snapshot, shareTarget, options);
  return `[${escapeMarkdown(snapshot.title)}](${shareTarget})（UP主：${escapeMarkdown(snapshot.uploader)}）\n${shareTarget}`;
}
