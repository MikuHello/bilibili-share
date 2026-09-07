# Ticket 04 live-page observations

2026-09-07, user's Edge with BewlyCat, https://www.bilibili.com/video/BV1GJ411x7h7/ . Existing installed script visibly still uses uppercase AV / b23 short link / earlier poster layout; this is not the candidate installation.

- Real effective roots: html `dark bewly-design videoPage block-useless-contents remove-top-bar remove-custom-navbar`; body `mac dark`.
- Existing panel title and section heading both computed `rgba(0,0,0,0.85)` on dark panel. Reproduced the reported defect outside fixture.
- Official share/like toolbar: 28px height, 28px icons; share text 13px / 28px, PingFang SC. Old entry: height36, icon24, text14 /14.
- Official share foreground `rgba(212,215,222,0.9)` sourced from `--text2`. Candidate entry uses this variable with light/dark fallback; after color transition its computed color exactly matched official share.
- Applied only candidate STYLES via temporary style element to existing installed page, not a candidate script installation. Both headings became `rgb(237,240,243)`. Screenshot `live-css-after.png` retains old poster and actions intentionally. `live-before.png` is before temporary style. `live-toolbar-css-after.png` shows entry.
- Closed panel and removed temporary style. No persistent BewlyCat preference changed. Actual light-mode settings not toggled in this pass; light and modern oklab / conflicting or unknown signals are covered by controlled production-bundle browser fixture. Full candidate installation belongs to ticket07.
