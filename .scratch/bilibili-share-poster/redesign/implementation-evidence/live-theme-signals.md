# Actual page theme signals during implementation

Environment: existing Edge user profile, actual original video BV1TXoWBsEGc, installed BewlyCat. Extension-manager version inspection was blocked by browser security policy; no workaround attempted.

Observed via CUA on actual page, not CSS simulation:

- Initial root: `bewly-design videoPage block-useless-contents remove-top-bar remove-custom-navbar`; body `rgb(241, 242, 243)`, root `rgb(255, 255, 255)`.
- Actual BewlyCat shadow-root sidebar theme button exposes `data-layout-edit-target="sidebar-theme"`; accessibility adjacent label initially “亮色模式”. Locator click did not change state; screenshot showed half-clipped right-edge control. Visible coordinate click activated it.
- Dark state: label “暗色模式”; root gains `dark`; body and root computed background `oklab(0.236945 -0.00128311 -0.00790365)`.
- Clicked same control again; accessibility label restored “亮色模式”. This is the user's initial state.

These observations verify the actual control and relevant page signal. They do not yet verify the new product observer, which is pending ticket06, nor imply the old installed userscript is updated. Computed colors can use oklab; do not assume every valid computed color is rgb().
