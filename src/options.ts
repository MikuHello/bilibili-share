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
    theme: "A",
    detailedText: record.detailedText === true,
    markdownText: false,
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

/**
 * Reads the persisted panel preferences via Tampermonkey's GM_getValue when
 * available, falling back to defaults. Centralised so the entry mount and the
 * panel open path read the same source instead of duplicating the GM_getValue
 * guard.
 */
export function loadRememberedPreferences(): RememberedPanelPreferences {
  const stored = typeof GM_getValue === "function" ? GM_getValue("bsp-panel-preferences", null) : null;
  return resolveRememberedPreferences(stored);
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
