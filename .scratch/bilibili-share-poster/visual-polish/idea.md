# Bilibili share poster — visual and interaction polish

Status: discovery complete — shared understanding confirmed; not an approved spec

## Owner feedback (2026-08-17)

1. Theme switching must have animated transitions.
2. The generated poster cover does not display; the preview image area is broken.
3. The short-link path now works and should stay working.
4. The four export actions must not be a separate block of four text buttons that each require a separate click. They should become icon actions.
5. The panel contains redundant copy, including the fixed sentence “预览、复制和下载使用同一已生成海报…”. Remove redundant explanations.
6. The current visual implementation is not acceptable and needs serious polish. Consider whether a frontend framework or CSS/JS library is necessary.
7. The page entry is inserted below Bilibili's share icon, which is visually jarring. It must sit beside the official share action as a proper toolbar item.
8. Overall the interface has far too much explanatory text and does not look designed.

## Verified facts (2026-08-17)

- The page entry is inserted inside `.toolbar-left-item-wrap`, after `.video-share-wrap`. The wrap lays items vertically, so the entry renders below the share icon instead of beside it. The insertion point should be the toolbar item wrap itself, not the inner share wrap.
- On the test video `BV1xx411c7mD`, Bilibili's metadata `pic` is `https://i0.hdslb.com/bfs/archive/transparent.png`, a 1x1 transparent PNG. Current cover validation accepts it because it is decodable; the poster therefore renders an empty cover region.
- The short link generation and redirect validation are working.
- The current panel duplicates information: title, summary, fallback notice, theme picker, four option cards with sub-labels, share-text preview, a five-row snapshot table, four text buttons, a fixed help sentence, and a status line.

## Settled decisions (round 1, 2026-08-17)

- Scope: keep the approved A/B poster compositions as the baseline. This pass redesigns the page entry, share panel, export actions, information hierarchy, and motion. Poster changes are limited to necessary spacing/type fixes.
- Stack: no React, Vue, Animate.css, or UI framework. Use TypeScript, CSS custom properties, inline SVG icons, native CSS transitions/keyframes, and `prefers-reduced-motion`. The implementation must be lightweight and organized for reuse.
- Page entry: icon plus the words `生成海报`, rendered as a sibling toolbar item beside the official share action, not below it.
- Export actions: four independent icon buttons with tooltips; `复制海报` is the emphasized primary action. No separate “export section” feeling and no four-item text-button block.
- Copy: minimal. Remove the five-row snapshot table, the fixed help sentence, and per-option sub-labels. Keep the panel title, conditional short-link fallback notice, exact share-text preview, and post-action status feedback.
- Exploration: build three throwaway interactive prototype directions before writing a new visual spec.
- Motion: produce a dedicated frontend motion/design document before implementation.
- Cover: missing, broken, or degenerate covers must be handled gracefully rather than breaking the poster or panel. A real generated thumbnail is explicitly deferred to a future ticket.

## Settled decisions (round 2, 2026-08-17)

- Prototype directions: build all three; direction B “immersive stage” is the owner's priority and should receive the most refinement. A = refined workspace, B = immersive stage, C = lightweight card.
- Panel visual language: one shared component system with theme tokens. A uses a warm paper surface; B uses a dark glass surface.
- Share options: four icon pill toggles (`分P`, `时间戳`, `详细`, `Markdown`) with clear on/off states and no sub-labels.
- Share-text preview: always visible, compact monospace block, capped at 3–4 lines with internal scroll, no extra “preview” heading.
- Action icons: four icon buttons with custom CSS tooltips that appear on hover and focus; primary action is `复制海报`.
- Status feedback: transient inline status near the actions, auto-fades after about 3 seconds; failures persist until the next interaction.
- Cover fallback: quiet neutral textured placeholder plus a very small `COVER UNAVAILABLE` mark. Real generated thumbnails are a later ticket.
- Motion personality: restrained standard easing, 160–260 ms, used for theme switching, panel open/close, and status feedback; respect `prefers-reduced-motion`. Full parameters go in the motion document.

## Settled decisions (round 3, 2026-08-17)

- Icons: 1.8px linear inline SVG set. Entry = poster/image; actions = copy, download, copy-text, combined image+text; options = list, clock, details, Markdown/code. Every icon button gets an accessible label and a hover/focus tooltip.
- Panel header: keep only a very small `BILIBILI SHARE` eyebrow; no large title and no long descriptions.
- Theme switch: compact segmented control `A 报刊` | `B 沉浸`.
- Prototype states: all ten listed states are mandatory, and direction B additionally gets a “maximized poster” state.

## Prototype feedback and direction decision (2026-08-17)

- Direction B: the single bottom control bar overflows and the bottom-right actions look cramped. The visual specification for narrow/bottom controls was not clear enough.
- Direction A: overall structure and right-side controls are good; the share-text preview reads like a raw Markdown/code block; action meaning is not intuitive at first glance.
- Theme switching is liked, but the poster visibly jumps during the transition.
- Direction C is redundant and is dropped.
- Owner decision: combine A and B into one final direction — an immersive poster stage plus a clean, readable control rail. Poster content itself will be discussed separately later.

## Settled decisions (round 4, 2026-08-17)

- One final direction only: poster-first hybrid of A and B. C is out of scope.
- Wide layout keeps A's readable right-side controls; narrow layout keeps B's poster-first stacked stage but must define exact wrapping rules so nothing overflows.
- Action buttons keep visible icon + concise text label; icon-only is not accepted.
- Share-text preview must look like designed UI, not a raw code block.
- Theme switch animation must crossfade without poster jumping or layout shift.
- Poster content changes are explicitly deferred to a later discussion.

## Frontier status

Empty. Direction approved. Proceeding to `to-spec`, motion document, and `to-tickets`.

## Scope gate

This directory captures unsettled input. Do not publish a visual spec or production implementation until the design tree frontier is empty and the owner approves a direction.

## Settled decisions (round 5, 2026-08-20 — focused re-grill after prototype drift review)

Trigger: reviewing the throwaway `prototype.html` surfaced drift from the approved spec. Confirmed `src/ui/` (uncommitted) already follows the spec, not the prototype, so most drift is prototype-only. Two genuine open decisions re-grilled and resolved.

### Action affordance — three actions, not four

- The four-action grid ("复制海报 / 下载 PNG / 复制文案 / 组合复制") fails the "first glance I know what it does" test. Root cause: the four actions are not coequal, and one of them (plain-text copy) doesn't deserve a slot in the action row.
- Resolved structure: the action row has **three** actions —
  1. **复制海报** (poster PNG → clipboard) — emphasized primary action.
  2. **下载** — icon-only download of the same PNG; no "下载 PNG" text label, the download icon is self-explanatory.
  3. **海报+文案** (renamed from 组合复制; image + text bundled into one rich clipboard write).
- **复制文案 is removed from the action row.** Plain-text copy becomes a small copy icon in the top-right corner of the share-text preview card (inline affordance, not a row button), because the text is already visible/selectable in that card.
- Naming direction locked: `海报+文案` for the combined action (zero ambiguity). Specific short labels for the other two and exact icon choices are deferred to the implementation design pass — the spec records the rule (semantic labels, primary highlighted, rest outlined, icon-only download) not the literal strings.
- The four underlying clipboard outputs (PNG, file download, text, image+text HTML) are unchanged; only the UI mapping changes.

### Debug mode — not in production

- The prototype's scenario switchers (long/short link, missing stats, multi-part, cover missing, narrow viewport, reduced-motion, B maximized) are QA scaffolding from the direction-selection phase, not product UI.
- Resolved: a **debug drawer** exists only in development builds; **the production userscript does not ship it at all**. It is gated by a build/dev flag, not a hidden toggle reachable by real users.
- Product panel contains zero debug controls.

## Frontier status (updated 2026-08-20)

Empty again. Both open points resolved. Proceeding to patch the approved spec and the affected tickets; unaffected tickets (01, 04, 05) continue as-is.
