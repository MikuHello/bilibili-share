export interface ShareOptions {
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
    partShare: false,
    timestampShare: false,
    detailedText: false,
    markdownText: false,
  };
}

export interface RememberedPanelPreferences {
  detailedText: boolean;
  markdownText: boolean;
}

export function resolveRememberedPreferences(stored: unknown): RememberedPanelPreferences {
  const record = typeof stored === "object" && stored !== null ? (stored as Record<string, unknown>) : {};
  return {
    detailedText: record.detailedText === true,
    markdownText: false,
  };
}

export function createPanelShareOptions(storedPreferences: unknown = null): ShareOptions {
  const remembered = resolveRememberedPreferences(storedPreferences);
  return {
    partShare: false,
    timestampShare: false,
    detailedText: remembered.detailedText,
    markdownText: remembered.markdownText,
  };
}

/**
 * Reads the persisted panel preferences via Tampermonkey's GM_getValue when
 * available, falling back to defaults. Only the panel detail preference is restored; retired theme and Markdown
 * selections are ignored.
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
