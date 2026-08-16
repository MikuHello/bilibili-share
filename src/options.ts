export type PosterTheme = "A" | "B";

export interface ShareOptions {
  theme: PosterTheme;
  partShare: boolean;
  timestampShare: boolean;
  detailedText: boolean;
  markdownText: boolean;
}

export interface PartShareContext {
  partNumber: number;
  playbackSeconds: number;
  partIdentified: boolean;
}

export function createDefaultShareOptions(): ShareOptions {
  return {
    theme: "A",
    partShare: false,
    timestampShare: false,
    detailedText: false,
    markdownText: false,
  };
}

export interface RememberedPanelPreferences {
  theme: PosterTheme;
  detailedText: boolean;
  markdownText: boolean;
}

export function resolveRememberedPreferences(stored: unknown): RememberedPanelPreferences {
  const record = typeof stored === "object" && stored !== null ? (stored as Record<string, unknown>) : {};
  return {
    theme: record.theme === "B" ? "B" : "A",
    detailedText: record.detailedText === true,
    markdownText: record.markdownText === true,
  };
}

export function createPanelShareOptions(storedPreferences: unknown = null): ShareOptions {
  const remembered = resolveRememberedPreferences(storedPreferences);
  return {
    theme: remembered.theme,
    partShare: false,
    timestampShare: false,
    detailedText: remembered.detailedText,
    markdownText: remembered.markdownText,
  };
}

export function canEnablePartShare(context: PartShareContext): boolean {
  return context.partIdentified;
}

export function canEnableTimestampShare(context: PartShareContext): boolean {
  return context.partIdentified && Math.floor(context.playbackSeconds) >= 1;
}

export function togglePartShare(options: ShareOptions, context: PartShareContext): ShareOptions {
  if (!canEnablePartShare(context)) return options;
  const partShare = !options.partShare;
  return {
    ...options,
    partShare,
    timestampShare: partShare ? options.timestampShare : false,
  };
}

export function toggleTimestampShare(options: ShareOptions, context: PartShareContext): ShareOptions {
  if (!canEnableTimestampShare(context)) return options;
  const timestampShare = !options.timestampShare;
  return {
    ...options,
    timestampShare,
    partShare: timestampShare && context.partNumber > 1 ? true : options.partShare,
  };
}
