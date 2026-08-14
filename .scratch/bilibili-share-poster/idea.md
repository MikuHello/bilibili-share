# Bilibili image share poster

Status: discovery complete — shared understanding confirmed

## Problem statement

Bilibili Web's official share action primarily helps a viewer copy or distribute a link. It does not provide the desired information-rich image that can be saved or copied and shared as a self-contained poster.

## Desired user outcome

On a Bilibili Web video page, a viewer sees an additional share action beside the official share control. Activating it opens a preview of an image-based share poster. Someone receiving that image can identify the video, scan a QR code to watch it, or use the visible short link and identifiers.

## Requested poster content

- Video cover.
- Video title.
- Uploader name.
- BV identifier and AV identifier, both visible at the same time.
- QR code that opens the video.
- Visible short link.
- A snapshot of video information: views, likes, coins, and favorites.

## Interaction facts supplied so far

- The new action sits beside, preferably to the right of, Bilibili's official share action.
- The new action opens a share panel containing the poster preview, share text, options, and export actions.
- The existing official share behavior remains conceptually separate.
- The reference screenshot shows Bilibili's existing desktop-Web share modal with cover, title, QR code, and a link-copy action.

## Confirmed decisions

- Version one is a locally installed Tampermonkey userscript for the supported Chrome and Edge matrix rather than a Chromium extension.
- Version one supports only standard video pages at `/video/BV...`.
- Timestamp sharing is available through an option that is off by default. When enabled, the QR code and visible link use the same current-playback-position share target.
- Part sharing is a separate option that is off by default. It shares the currently viewed part of a multi-part video. On P1 it remains independent; on P2 or later, timestamp sharing requires it so the timestamp cannot resolve against the wrong part.
- With neither part sharing nor timestamp sharing enabled, the poster uses the video's default share target.
- The poster preview offers both copy-image and download-PNG actions. Copy image is primary and download PNG is the fallback.
- Video information is fetched when the added share action is activated and becomes a generation snapshot.
- A missing individual statistic does not block poster generation; its value is shown as `--` rather than zero.
- Poster rendering, QR generation, and image export run locally in the browser. Version one has no project-operated backend and uploads no cover, browsing history, or poster.
- Version one may call Bilibili's current anonymous private share endpoint to obtain an opaque `b23.tv` URL. The QR code and visible link use the same short URL; if generation fails, both use the same canonical long URL.
- Version one may call Bilibili's current internal Web metadata endpoint through a centralized adapter with business-code and field validation.
- Missing essential identity or destination information blocks export and produces a specific error with retry. Essential information is title, cover, uploader, BV/AV identifiers, and a valid share target.
- When part sharing is enabled, the poster explicitly identifies the selected part as `P<number> · <part title>`. Without it, the poster shows no part-specific label.
- Activating the added share action pauses video playback first, then captures the video identity, current part, and playback position as one stable context snapshot. The panel opens immediately in a loading state.
- Playback position is captured at that activation point, not when an option is toggled or the preview later redraws.
- If the page changes to another BVID while the panel is open, the old panel closes and its snapshot is discarded. Reopening generates outputs for the new video.
- If short-link generation fails, poster generation continues with one canonical long-link share target and explicitly reports the fallback. The poster, QR code, and share text all use that same target.
- If copying the poster fails, the panel and preview remain available and direct the user to download PNG; download is not triggered automatically.
- If copying share text fails, the exact text remains visible and selectable for manual copying.
- The userscript does not call Bilibili's share-count endpoint when opening, copying, or downloading.

## Additional text-sharing outcome

- The product generates a formatted share text alongside the share poster.
- Users can copy only the poster, copy only the share text, or request a combined poster-and-text copy.
- Compact share text is the default. Its semantic structure is the unwrapped video title followed by `（UP主：<up_name>）`, then the share link. The userscript does not add `【】` because original titles commonly contain them.
- An optional detailed-share-text mode is off by default. When enabled it contains the title, uploader, BV and AV identifiers, views, likes, coins, favorites, the share link, and part or timestamp information only when their respective share options are enabled.
- Normal formatted plain text is the default. An independent Markdown-text option is available and is off by default.
- In compact Markdown mode, the video title is a clickable link and the bare share link remains on its own line. Detailed Markdown mode uses a field list for the already confirmed detailed information.
- Toggling part, timestamp, detail level, or Markdown mode rebuilds outputs from the same generation snapshot without refetching video information.
- If combined clipboard writing itself fails, the userscript falls back to copying the selected share text and explicitly says that the poster still needs to be copied or downloaded separately.
- Clipboard writes happen only as a direct result of a user copy action; the product has no background clipboard-writing behavior.
- Part sharing and timestamp sharing reset to off whenever the share panel is reopened. Detailed-share-text and Markdown-text preferences remember the user's last choices.
- If combined copy is retained, Markdown mode supplies Markdown source as its plain-text representation. Any rich clipboard compatibility representation is an internal transport adapter, not a third user-facing text mode.
- Combined copy is retained as a compatibility action. It internally offers the share poster, the selected normal-or-Markdown text, and a rich representation ordered as poster then text. The receiving application decides what it pastes, so only compatible destinations produce both in that order.
- Combined-copy success feedback must describe compatible formats being written rather than promise that a later paste contains both poster and text.
- Copy-action layout, labels, and visual styling belong to the later design pass rather than this discovery decision tree.

## Userscript runtime decisions

- Version one targets the current stable Tampermonkey release on the current stable Chrome and Edge releases plus their previous two major versions. Other userscript managers are outside the supported matrix.
- The page-mounted action is the primary entry. A Tampermonkey menu command is the backup entry when the current standard video is readable but the page action cannot be mounted.
- On P2 or later, enabling timestamp sharing also enables and requires part sharing. Disabling part sharing also disables timestamp sharing. This prevents a timestamp from silently resolving against P1.
- Closing the share panel resumes playback only when the userscript paused a previously playing video and the same video is still active. A video that was already paused remains paused.
- Retry preserves the original BVID, part, and playback position and only refetches metadata, cover, and short link. Navigation to another BVID closes the panel, so an old-video retry is unavailable.

## Output consistency and delivery decisions

- Changing part sharing or timestamp sharing retains the previous preview as an updating placeholder but disables copy and download actions. Export becomes available only after the share poster, QR code, share target, and share text all represent the new option state.
- Changing detailed-share-text or Markdown-text mode rebuilds only the share text immediately. It does not regenerate the share poster or short link.
- If part sharing is enabled but its title is unavailable, generation continues and displays only the part number, such as `P2`; it does not invent a placeholder title.
- Downloaded posters use `bilibili_<BV>[_P<number>]_<YYYYMMDD-HHmmss>.png`. The part segment is present only when part sharing is enabled.
- The maintained source is organized as testable TypeScript modules and builds one directly installable `.user.js` artifact.
- Version one user-facing controls and errors are Simplified Chinese. Video titles and uploader names remain in their source language.
- Version one has no remote update metadata or update server. The built `.user.js` is installed manually.
- Generation snapshots retain exact integer statistics. Detailed share text displays exact values with thousands separators; the later poster design may apply readable `万/亿` compaction without changing the underlying values.
- Timestamp links use the playback position floored to a whole second. Visible time uses `MM:SS` below one hour and `HH:MM:SS` at one hour or above.
- Timestamp sharing cannot be enabled when the captured position is below one second; the default target is used instead of emitting `t=0`.
- The share panel can close through its close control, `Escape`, or its backdrop. Every close path uses the same playback-restoration rule.
- Activating an entry while the share panel is already open retains the existing panel and generation snapshot, brings it to the foreground, and does not repeat network requests.
- A part change within the same BVID closes the panel and discards its snapshot, just like navigation to another BVID. The userscript does not pause or resume the newly selected part as part of this cleanup.
- A generated short link is resolved and checked against the expected BVID, part, and timestamp before use. Any mismatch uses the canonical long link and the already defined fallback notice.
- If the userscript cannot find or pause the main player, it blocks the share flow with a compatibility error and retry rather than generating from an unstable playback context.
- If a multi-part video's current part cannot be identified, default sharing remains available, while part sharing and timestamp sharing are disabled with an explicit notice.

## Verified current Bilibili facts

Verified against current production pages and Bilibili-owned endpoints on 2026-08-14. These are observations, not public compatibility promises.

- Public standard-video metadata currently includes `aid`, `bvid`, cover, title, uploader, views, likes, coins, and favorites without requiring login.
- The current Web metadata endpoint and page state are internal implementation surfaces. Business errors can arrive with HTTP 200, so success requires a valid business code and complete essential fields.
- Statistics can change between requests; a poster represents a generation snapshot, not live values.
- The current desktop share UI copies a canonical `www.bilibili.com/video/...` URL. Its share-count request does not create a short link.
- Bilibili currently provides an anonymous private share endpoint capable of producing an opaque `b23.tv` URL whose redirect can preserve a part and timestamp. It is not a documented public contract, can add Bilibili tracking parameters, and needs a canonical-link fallback.
- The official desktop QR code currently ignores its own timestamp-share option. This project has already chosen one share target for both its QR code and visible link instead.
- Standard video navigation currently updates through the History API without reloading the document. The userscript must detect BVID changes and restore its button idempotently.
- A Chromium clipboard item can contain PNG, plain-text, and HTML representations, but the receiving application chooses among them. This does not guarantee that a paste produces both an image and text. Chromium currently does not support using two clipboard items to force sequential image-and-text paste.
- Tampermonkey's string-oriented clipboard helper cannot replace the browser Clipboard API for PNG or multi-representation copy. It can serve only as a share-text fallback.
- Tampermonkey provides a script-menu command that can act as a backup entry when the page button cannot be mounted. It is reached through the userscript manager's menu rather than a dedicated extension toolbar action.
- Tampermonkey provides a URL-change event for SPA navigation. URL identity changes and DOM-anchor restoration remain separate concerns.
- On a multi-part video, `t` is a time inside the selected part and does not identify that part. Current production behavior sends `?t=61` to P1 at 61 seconds, while `?p=2&t=61` reaches P2 at 61 seconds. A generated `b23.tv` redirect currently preserves both `p` and `t` when both exist.

## Deliberately unresolved

- Tampermonkey proof-of-concept validation for PNG and combined clipboard writes in the chosen injection context.
- The exact DOM adapter and restoration strategy when Bilibili changes its page structure.
- Combined-copy compatibility wording.
- Final share-text punctuation, field labels, and number formatting belong to the later content/design pass.
- Image dimensions, theme, typography, layout, density, number formatting, and light/dark variants.

## Scope gate

Visual style is intentionally deferred. Do not produce the final poster design or implementation from this brief. First complete the `grill-with-docs` decision tree; use a separate `prototype` or design-model handoff when the owner is ready to compare visual directions.

## Next workflow step

Use this confirmed brief as the product source for a visual-design handoff. Keep the Tampermonkey clipboard proof of concept as a separate later technical task; do not publish a spec or begin production implementation until design exploration is reviewed by the owner.
