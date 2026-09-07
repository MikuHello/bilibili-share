# Ticket 04 controlled browser verification

Browser: 151.0.7922.34. Production bundle with controlled page/GM ports.

PASS: initial dark, live light/dark, unknown retains last known, first unknown light despite system dark, modern oklab background, event payload ignored, poster DOM/palette and PNG cache unchanged, host h2/h3 interference corrected, 320/390px no dialog horizontal overflow, keyboard focus outline and Escape return, 28px entry/icon with 13px/28px text, native borderless entry remount, official share retained and menu fallback.

This script does not operate actual BewlyCat settings or validate userscript-manager installation. Live dark-page before/after candidate CSS observations are recorded separately in live-observations.md.

TDD: host `h2,h3,p{color:#18191c}` first reproduced black title; explicit semantic text colors turn it green. Entry metrics initially failed (36px/24px/14px), then passed at observed 28px/28px/13px. `npm run check`, all 68 unit tests, and build pass. Inspected narrow and live screenshots.

## Standards
No hard violations or actionable smells (0). Changes remain concentrated in existing styles and browser behavior verification.

## Spec
No actionable findings (0). All ticket04 behavior covered; live temporary CSS evidence is not full candidate installation. No added theme/poster coupling.

Summary: Standards 0; Spec 0. Reviewed `aaf3855...86f2d2e`.
