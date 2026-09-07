# Share-text templates

The production share panel reads `src/share-text-config.ts`. Change that file and run `npm run build` to customize wording without editing the panel. Omitted presets retain their built-in wording; an empty string intentionally produces empty text.

```ts
import type { ShareTextTemplates } from "./share-text";

export const shareTextTemplates: ShareTextTemplates = {
  plain: {
    compact: "{{url}}\n{{title}}（UP主：{{uploader}}）\n推荐观看",
    detailed: "{{title}}\n{{#if honor}}荣誉：{{honor}}\n{{/if}}播放：{{views}}\n{{url}}",
  },
};
```

The same public, DOM-free `buildShareText(snapshot, shareTarget, options, templates?)` interface accepts explicit overrides. Omitting `templates` uses built-ins, not the panel configuration. Direct callers receive `ShareTextTemplateError` (from `src/share-text-template.ts`) for invalid selected presets. The panel catches that error separately for each format, logs the preset plus one-based line/column, and regenerates the affected preset with the built-in template. No DOM, storage or clipboard is needed to reuse generation.

Markdown retains its existing independent output in ticket 01; Markdown template configuration follows in ticket 02. `detailedText` chooses compact or detailed; `markdownText` chooses the copy format.

| Variable | Meaning / missing value |
| --- | --- |
| `title` | Original video title |
| `uploader` | Original uploader name |
| `url` | Exact unified share target supplied by the panel |
| `bvid` | BV identifier |
| `aid` | Numeric AV identifier; add `av` in the template if wanted |
| `views`, `likes`, `coins`, `favorites` | Exact whole statistics with thousands separators; missing/nonfinite values display `--` |
| `honor` | Original video honor; missing or whitespace-only becomes empty |
| `part` | Selected part label, e.g. `P2 · 第二集`; empty when disabled or unavailable |
| `timestamp` | Selected playback time, e.g. `01:02:03`; empty when disabled or unavailable |

Use `{{name}}` for a variable and `{{#if name}}content{{/if}}` for an optional block. Conditions use original availability: zero is available, missing statistics are unavailable despite their `--` display, and whitespace-only optional text is unavailable. Put conditional newlines inside the block when they should disappear. The renderer never trims or collapses whitespace and never parses substituted data a second time. Plain text is inserted verbatim, including Unicode and HTML-looking text; previews use text nodes.

Escape literal opening/closing delimiters with `\{{` / `\}}`, and a literal backslash with `\\` in template text (double those backslashes inside ordinary JavaScript string literals). Thus the JavaScript string `"\\{{title\\}}"` renders literal `{{title}}`. Other backslashes remain unchanged.

Names and syntax are exact and case-sensitive. Unknown variables, unmatched delimiters/conditions, nested conditions, `else`, loops, expressions, functions, and whitespace inside a variable instruction are errors, including in hidden blocks. Diagnostics refer to source-template positions, not expanded output. Only the selected preset is rendered and validated.

The preview preserves the entire generated string, including trailing text/newlines, repeated links, or no link. Only exact occurrences of the current canonical share target receive link color; no link is appended automatically.

Run `npm test -- tests/share-text.test.ts` and `BSP_PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node scripts/verify-share-text-templates.mjs` for generation and real Chromium panel/clipboard-boundary checks. The browser script builds production entry points with alternate contents of the actual configuration module and mocks only external page/GM/clipboard boundaries. It does not claim live userscript-manager validation.
