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

export const DEFAULT_PLAIN_TEMPLATES = {
  compact: "{{title}}（UP主：{{uploader}}）\n{{url}}",
  detailed: "{{title}}\nUP主：{{uploader}}\n播放：{{views}}　点赞：{{likes}}　投币：{{coins}}　收藏：{{favorites}}\n{{#if honor}}{{honor}}\n{{/if}}{{#if part}}分P：{{part}}\n{{/if}}{{#if timestamp}}时间：{{timestamp}}\n{{/if}}{{bvid}} · av{{aid}}\n{{url}}",
};

export const DEFAULT_MARKDOWN_TEMPLATES = {
  compact: "[{{title}}]({{url}})（UP主：{{uploader}}）\n{{url}}",
  detailed: "**{{title}}**\n\n- UP主：{{uploader}}\n- 播放：{{views}} · 点赞：{{likes}} · 投币：{{coins}} · 收藏：{{favorites}}\n{{#if honor}}- {{honor}}\n{{/if}}{{#if part}}- 分P：{{part}}\n{{/if}}{{#if timestamp}}- 时间：{{timestamp}}\n{{/if}}- {{bvid}} · av{{aid}}\n- 链接：{{url}}",
};

export interface ShareTextTemplates {
  plain?: Partial<Record<"compact" | "detailed", string>>;
  markdown?: Partial<Record<"compact" | "detailed", string>>;
}

export function buildShareText(snapshot: GenerationSnapshot, shareTarget: string, options: ShareOptions, templates: ShareTextTemplates = {}): string {
  const format = options.markdownText ? "markdown" : "plain";
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
  const defaults = options.markdownText ? DEFAULT_MARKDOWN_TEMPLATES : DEFAULT_PLAIN_TEMPLATES;
  const template = templates[format]?.[preset] ?? defaults[preset];
  const variables = Object.fromEntries(Object.entries(values).map(([name, value]) => [name, {
    available: available(name),
    text: ["views", "likes", "coins", "favorites"].includes(name)
      ? formatExactStat(value as StatisticValue)
      : options.markdownText && name !== "url" ? escapeMarkdown(String(value ?? "")) : String(value ?? ""),
  }]));
  return renderShareTextTemplate(template, `${format}.${preset}`, variables);
}
