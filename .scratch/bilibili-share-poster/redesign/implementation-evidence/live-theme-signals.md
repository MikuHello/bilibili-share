# Actual page theme signals during implementation

Environment: existing Edge user profile, actual original video BV1TXoWBsEGc, installed BewlyCat. Extension-manager version inspection was blocked by browser security policy; no workaround attempted.

Observed via CUA on actual page, not CSS simulation:

- Initial root: `bewly-design videoPage block-useless-contents remove-top-bar remove-custom-navbar`; body `rgb(241, 242, 243)`, root `rgb(255, 255, 255)`.
- Actual BewlyCat shadow-root sidebar theme button exposes `data-layout-edit-target="sidebar-theme"`; accessibility adjacent label initially “亮色模式”. Locator click did not change state; screenshot showed half-clipped right-edge control. Visible coordinate click activated it.
- Dark state: label “暗色模式”; root gains `dark`; body and root computed background `oklab(0.236945 -0.00128311 -0.00790365)`.
- Clicked same control again; accessibility label restored “亮色模式”. This is the user's initial state.

These observations verify the actual control and relevant page signal. They do not yet verify the new product observer, which is pending ticket06, nor imply the old installed userscript is updated. Computed colors can use oklab; do not assume every valid computed color is rgb().

## Production observer probe — 2026-09-05

Read-only production `src/ui/appearance.ts` observer was bundled and attached temporarily to the actual video page through current-origin developer tools. Its callback samples were `["light", "dark", "light"]` while clicking the actual sidebar setting twice. Final verification returned `cleaned: true`, `dark: false`; disconnect was called and the temporary global removed. No new userscript was installed by this probe.

Actual page user-agent: `Chrome/152.0.0.0 Edg/152.0.0.0` on macOS (reduced user-agent; exact build not read). BewlyCat version and userscript-manager version: unavailable because extension-management access was blocked; no alternate inspection attempted. Thus actual page signals and production adapter callbacks are verified, but manager sandbox integration and exact extension-version compatibility remain unverified.

Historical RED before wiring index/panel: production fixture with actual-page dark marker rendered a white panel. GREEN after wiring is recorded by the controlled browser suite, separately from this manual actual-page probe.
