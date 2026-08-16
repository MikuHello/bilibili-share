# Visual polish — research notes

Status: working notes for the three throwaway prototypes. Not a spec.

## 1. Current Bilibili page facts (measured 2026-08-17)

- The official toolbar share item lives in `.toolbar-left-item-wrap`; the wrap is `block`, width 124px, height 62px, margin-right 8px.
- The inner `.video-share-wrap` is `flex; height 28px`; the share icon is 28×28 with an 8px right margin and a text label below the icon.
- The official share popover is white, 8px radius, shadow `0 2px 6px rgba(0,0,0,.06)`, base font 14px, muted text `rgb(96,98,102)`.
- Consequence: our entry must be inserted as a sibling of `.toolbar-left-item-wrap`, not inside the official share item wrap. Visually it should match the 28px icon + small label rhythm.

## 2. Lightweight implementation practices adopted for this pass

- No runtime framework. One bundled TypeScript entry, one injected `<style>` block.
- Design tokens in CSS custom properties for color, radius, spacing, typography, shadow, and motion.
- SVG icons as a small reusable `src/ui/icons.ts` factory: one 24×24 viewBox, currentColor stroke, 1.8px stroke width.
- Component boundaries in `src/ui/`: `entry.ts`, `panel.ts`, `poster-a.ts`, `poster-b.ts`, `options.ts`, `actions.ts`, `status.ts`, `motion.ts` (class hooks only), plus `tokens.css`.
- Interactions use native `button`, `focus-visible`, `aria-label`, `aria-pressed`, `role=status`, and tooltips shown on hover and keyboard focus.
- Motion is CSS-only where possible; JS only toggles state classes. `prefers-reduced-motion` disables non-essential animation.

## 3. Reference visual patterns

- Bilibili official share: compact white popover, quiet gray text, 8px radius, soft small shadow. Use as the baseline for direction C and for entry integration.
- Apple HIG / Material motion consensus for small overlays: enter 200–260ms ease-out, exit 160–200ms ease-in, color/theme transitions 160–200ms ease, status feedback 180ms fade.
- Modern lightweight panels avoid long paragraphs: a short eyebrow, controls as compact toggles, monospace preview, icon actions with tooltips, and transient status text.
- Glass surfaces use `backdrop-filter: blur()` sparingly and only where content behind benefits; direction B is the intended use.

## 4. Motion proposal (for the motion design document)

- Panel open: 220ms ease-out, backdrop fade + panel translateY(8px)→0 + scale(.985)→1.
- Panel close: 160ms ease-in, reverse, then remove from DOM.
- Theme switch: poster crossfade 200ms ease + translateY(6px)→0; panel token color transition 180ms ease.
- Option rebuild: old poster stays; a 140ms soft scrim fades in, then out on completion.
- Status feedback: 180ms fade/slide in; auto-dismiss after 3s with 160ms fade.
- Entry: hover color/border 140ms; B theme entry color transition 180ms.
- Reduced motion: all non-essential transforms/fades disabled; theme switch uses a 0ms crossfade.

## 5. Prototype state matrix

1. Default A, valid cover
2. Theme B
3. Long title + long uploader
4. Canonical long-link fallback notice
5. Missing statistics `--`
6. Multi-part P2 + timestamp
7. Cover unavailable placeholder
8. Narrow viewport <760px
9. Copy success / failure feedback
10. Theme-switch animation + reduced-motion preview

Direction B additionally gets a maximized-poster state.
