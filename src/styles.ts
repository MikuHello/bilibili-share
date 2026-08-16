export const STYLES = String.raw`
:root { --bsp-paper:#f7f5f0; --bsp-ink:#1a1a1a; --bsp-muted:#6b6b66; }
#bsp-entry { appearance:none; display:inline-flex; align-items:center; gap:7px; height:34px; margin-left:14px; padding:0 14px; border:1px solid #aaa9a4; border-radius:3px; background:#fff; color:#242424; font:500 14px/1 "PingFang SC","Microsoft YaHei",sans-serif; cursor:pointer; vertical-align:middle; transition:background .15s ease,border-color .15s ease; }
#bsp-entry:hover { background:#f7f5f0; border-color:#77756f; }
#bsp-entry:focus-visible,.bsp-button:focus-visible,.bsp-close:focus-visible { outline:3px solid #00aeec; outline-offset:2px; }
#bsp-entry svg { width:17px; height:17px; }
.bsp-backdrop { position:fixed; inset:0; z-index:2147483646; display:grid; place-items:center; padding:16px; background:rgba(14,14,13,.68); font-family:"PingFang SC","Microsoft YaHei",sans-serif; }
.bsp-panel { position:relative; width:min(960px,calc(100vw - 32px)); max-height:calc(100vh - 32px); overflow:auto; border:1px solid #d4d0c7; border-radius:4px; background:#f1eee7; box-shadow:0 28px 80px rgba(0,0,0,.34); color:#1a1a1a; }
.bsp-panel:focus { outline:none; }
.bsp-panel-head { display:flex; align-items:center; justify-content:space-between; min-height:62px; padding:0 22px; border-bottom:1px solid #cbc7be; background:#faf8f3; }
.bsp-kicker { margin:0 0 3px; color:#77736b; font:600 10px/1.2 ui-monospace,Menlo,monospace; letter-spacing:.18em; text-transform:uppercase; }
.bsp-panel-title { margin:0; font-size:18px; line-height:1.25; font-weight:650; }
.bsp-close { appearance:none; width:36px; height:36px; border:0; border-radius:50%; background:transparent; color:#55524c; font-size:25px; line-height:1; cursor:pointer; }
.bsp-close:hover { background:#e7e3db; }
.bsp-workspace { display:grid; grid-template-columns:46% 54%; min-height:576px; }
.bsp-preview-pane { display:flex; align-items:center; justify-content:center; padding:28px; border-right:1px solid #cbc7be; background:#dedad1; }
.bsp-preview-frame { position:relative; width:min(100%,360px); aspect-ratio:3/4; display:grid; place-items:center; filter:drop-shadow(0 14px 22px rgba(20,20,18,.22)); }
.bsp-poster-updating { position:absolute; inset:0; z-index:2; display:grid; place-items:center; background:rgba(255,255,255,.66); color:#55524c; font-size:13px; font-weight:600; }
.bsp-loading-card { width:min(100%,360px); aspect-ratio:3/4; display:grid; place-items:center; border:1px solid #b9b5ac; background:#f7f5f0; color:#64615b; }
.bsp-spinner { width:28px; height:28px; margin:0 auto 14px; border:2px solid #c8c4bb; border-top-color:#1a1a1a; border-radius:50%; animation:bsp-spin .75s linear infinite; }
@keyframes bsp-spin { to { transform:rotate(360deg); } }
.bsp-controls { display:flex; flex-direction:column; padding:34px 36px; background:#faf8f3; }
.bsp-step { margin:0 0 10px; color:#77736b; font:600 10px/1.2 ui-monospace,Menlo,monospace; letter-spacing:.16em; }
.bsp-controls h3 { margin:0 0 12px; font-size:24px; line-height:1.25; font-weight:650; }
.bsp-options { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin:20px 0 0; }
.bsp-option { display:flex; align-items:center; gap:8px; min-height:44px; padding:8px 12px; border:1px solid #cbc7be; border-radius:3px; background:#fff; cursor:pointer; }
.bsp-option input { margin:0; accent-color:#1a1a1a; }
.bsp-option-label { color:#24231f; font-size:13px; font-weight:600; }
.bsp-option small { color:#77736b; font-size:11px; }
.bsp-option:has(input:disabled) { opacity:.55; cursor:not-allowed; }
.bsp-option-notice { margin:10px 0 0 !important; color:#7a4d1d !important; font-size:12px !important; }
.bsp-controls p { margin:0; color:#66625b; font-size:14px; line-height:1.7; }
.bsp-fallback { display:grid; gap:5px; margin-top:18px; padding:14px 16px; border-left:3px solid #9a6528; background:#f4e9d7; color:#5f431f; }
.bsp-fallback strong { font-size:13px; line-height:1.4; }
.bsp-fallback span { font-size:12px; line-height:1.55; }
.bsp-text-preview { margin:20px 0 0; padding:12px 14px; border:1px solid #cbc7be; background:#fff; color:#24231f; font:12px/1.7 ui-monospace,Menlo,monospace; white-space:pre-wrap; word-break:break-all; user-select:all; }
.bsp-snapshot { margin:28px 0; padding:18px 0; border-top:2px solid #1a1a1a; border-bottom:1px solid #bcb8af; }
.bsp-snapshot-row { display:flex; justify-content:space-between; gap:16px; padding:7px 0; color:#6b6861; font-size:12px; }
.bsp-snapshot-row strong { max-width:72%; overflow:hidden; color:#24231f; font:600 12px/1.4 ui-monospace,Menlo,monospace; text-align:right; text-overflow:ellipsis; white-space:nowrap; }
.bsp-actions { margin-top:auto; display:grid; grid-template-columns:1fr 1fr; gap:8px; }
.bsp-button-primary { background:#1a1a1a; color:#fff; }
.bsp-button-secondary { background:#fff; color:#1a1a1a; }
.bsp-button-secondary:hover { background:#f7f5f0; }
.bsp-button { appearance:none; width:100%; min-height:46px; border:1px solid #1a1a1a; border-radius:2px; background:#1a1a1a; color:#fff; font:650 14px/1 "PingFang SC","Microsoft YaHei",sans-serif; cursor:pointer; }
.bsp-button:hover { background:#353431; }
.bsp-button:disabled { border-color:#aaa79f; background:#aaa79f; cursor:not-allowed; }
.bsp-help { margin-top:12px !important; font-size:12px !important; }
.bsp-error { margin:20px 0; padding:16px; border-left:3px solid #a3452f; background:#f5e6df; color:#6f2f20 !important; }
.bsp-status { min-height:22px; margin-top:12px !important; color:#3d6b47 !important; font-size:12px !important; }
.bsp-poster { box-sizing:border-box; position:relative; width:360px; height:480px; overflow:hidden; padding:17px 18px 16px; border:1px solid #b7b4ac; background:#f7f5f0; color:#1a1a1a; }
.bsp-poster::after { content:""; position:absolute; inset:0; pointer-events:none; opacity:.16; background-image:radial-gradient(#776f62 .45px,transparent .55px); background-size:4px 4px; }
.bsp-masthead { position:relative; z-index:1; display:flex; align-items:flex-end; justify-content:space-between; padding-bottom:6px; border-bottom:1px solid #1a1a1a; }
.bsp-masthead strong { font:700 9px/1.1 "PingFang SC","Microsoft YaHei",sans-serif; letter-spacing:.08em; }
.bsp-masthead span { color:#6b6b66; font:600 7px/1 ui-monospace,Menlo,monospace; letter-spacing:.18em; }
.bsp-cover { position:relative; z-index:1; display:block; width:100%; height:182px; margin:10px 0 13px; border:1px solid #77736b; object-fit:cover; object-position:center; }
.bsp-poster-title { position:relative; z-index:1; display:-webkit-box; overflow:hidden; margin:0; font-size:19px; line-height:1.26; font-weight:700; letter-spacing:-.02em; -webkit-box-orient:vertical; -webkit-line-clamp:2; }
.bsp-byline { position:relative; z-index:1; display:flex; align-items:center; justify-content:space-between; gap:10px; margin-top:8px; color:#55524c; font-size:9px; }
.bsp-byline strong { min-width:0; overflow:hidden; color:#262522; font-weight:600; text-overflow:ellipsis; white-space:nowrap; }
.bsp-identity { flex:none; font:600 7.5px/1 ui-monospace,Menlo,monospace; }
.bsp-part-timestamp { position:relative; z-index:1; display:flex; align-items:center; gap:6px; margin-top:7px; min-height:14px; }
.bsp-part-chip { max-width:82%; overflow:hidden; padding:2px 7px; border:1px solid #77736b; background:#f0ede6; color:#24231f; font:600 8px/1.2 "PingFang SC","Microsoft YaHei",sans-serif; text-overflow:ellipsis; white-space:nowrap; }
.bsp-time-chip { margin-left:auto; color:#1a1a1a; font:700 9px/1 ui-monospace,Menlo,monospace; font-variant-numeric:tabular-nums; }
.bsp-stats { position:relative; z-index:1; display:grid; grid-template-columns:repeat(4,1fr); margin-top:13px; border-top:2px solid #1a1a1a; border-bottom:1px solid #aaa69d; }
.bsp-stat { padding:8px 5px 7px; border-right:1px solid #c6c2b9; }
.bsp-stat:last-child { border-right:0; }
.bsp-stat strong,.bsp-stat span { display:block; }
.bsp-stat strong { white-space:nowrap; font:750 clamp(14px,4.3vw,16px)/1 ui-monospace,Menlo,monospace; font-variant-numeric:tabular-nums; letter-spacing:-.025em; }
.bsp-stat span { margin-top:5px; color:#6b6b66; font-size:7px; letter-spacing:.18em; }
.bsp-destination { position:relative; z-index:1; display:grid; grid-template-columns:78px 1fr; gap:13px; align-items:center; margin-top:13px; }
.bsp-qr { box-sizing:border-box; display:block; width:78px; height:78px; background:#fff; }
.bsp-link-label { display:block; margin-bottom:7px; color:#6b6b66; font-size:7px; letter-spacing:.17em; }
.bsp-link { display:block; overflow-wrap:anywhere; color:#1a1a1a; font:600 8px/1.45 ui-monospace,Menlo,monospace; word-break:break-all; }
.bsp-archive { position:absolute; right:18px; bottom:7px; z-index:1; color:#8b877e; font:600 6px/1 ui-monospace,Menlo,monospace; letter-spacing:.12em; }
.bsp-theme-picker { display:flex; align-items:center; gap:8px; margin-top:18px; }
.bsp-theme-picker-label { margin-right:4px; color:#77736b; font-size:12px; font-weight:600; }
.bsp-theme-button { appearance:none; min-height:32px; padding:0 12px; border:1px solid #cbc7be; border-radius:3px; background:#fff; color:#55524c; font-size:12px; cursor:pointer; }
.bsp-theme-button.is-active { border-color:#1a1a1a; background:#1a1a1a; color:#fff; font-weight:600; }
#bsp-entry.bsp-entry-b { background:#18191c; border-color:#18191c; color:#fff; }
#bsp-entry.bsp-entry-b:hover { background:#343a40; border-color:#343a40; }
.bsp-backdrop.bsp-theme-b { background:rgba(5,6,8,.78); }
.bsp-panel.bsp-theme-b { border-color:#3d4045; background:#18191c; color:#f1f2f3; }
.bsp-panel.bsp-theme-b .bsp-panel-head { border-bottom-color:#2e3135; background:#101113; }
.bsp-panel.bsp-theme-b .bsp-panel-title { color:#fff; }
.bsp-panel.bsp-theme-b .bsp-close { color:#c9cdd2; }
.bsp-panel.bsp-theme-b .bsp-close:hover { background:#2e3135; }
.bsp-panel.bsp-theme-b .bsp-preview-pane { border-right-color:#2e3135; background:#222529; }
.bsp-panel.bsp-theme-b .bsp-controls { background:#18191c; }
.bsp-panel.bsp-theme-b .bsp-controls p, .bsp-panel.bsp-theme-b .bsp-kicker, .bsp-panel.bsp-theme-b .bsp-step { color:#c9cdd2; }
.bsp-panel.bsp-theme-b .bsp-option { border-color:#3d4045; background:#232528; }
.bsp-panel.bsp-theme-b .bsp-option-label { color:#fff; }
.bsp-panel.bsp-theme-b .bsp-option small { color:#9aa0a6; }
.bsp-panel.bsp-theme-b .bsp-text-preview { border-color:#2e3135; background:#101113; color:#e8e9eb; }
.bsp-panel.bsp-theme-b .bsp-snapshot { border-top-color:#f1f2f3; border-bottom-color:#3d4045; }
.bsp-panel.bsp-theme-b .bsp-snapshot-row { color:#b8bcc2; }
.bsp-panel.bsp-theme-b .bsp-snapshot-row strong { color:#f1f2f3; }
.bsp-panel.bsp-theme-b .bsp-theme-picker-label { color:#9aa0a6; }
.bsp-panel.bsp-theme-b .bsp-theme-button { border-color:#3d4045; background:#232528; color:#c9cdd2; }
.bsp-panel.bsp-theme-b .bsp-theme-button.is-active { border-color:#f1f2f3; background:#f1f2f3; color:#18191c; }
.bsp-panel.bsp-theme-b .bsp-button-primary { border-color:#f1f2f3; background:#f1f2f3; color:#18191c; }
.bsp-panel.bsp-theme-b .bsp-button-secondary { border-color:#8a9096; background:#2e3135; color:#fff; }
.bsp-panel.bsp-theme-b .bsp-button-secondary:hover { background:#3d4045; }
.bsp-poster.bsp-poster-b { padding:0; border:0; background:#000; color:#fff; }
.bsp-poster-b::after { display:none; }
.bsp-cover-b { position:absolute; inset:0; z-index:0; display:block; width:100%; height:100%; object-fit:cover; object-position:center; }
.bsp-b-scrim { position:absolute; inset:0; z-index:1; background:linear-gradient(180deg,rgba(0,0,0,.08) 0%,rgba(0,0,0,.28) 38%,rgba(0,0,0,.86) 78%,rgba(0,0,0,.94) 94%); }
.bsp-b-content { position:relative; z-index:2; display:flex; flex-direction:column; height:100%; padding:16px; }
.bsp-b-topline { display:flex; align-items:center; gap:8px; min-height:24px; }
.bsp-b-part-chip, .bsp-b-time-chip { overflow:hidden; padding:3px 9px; border:1px solid rgba(255,255,255,.32); border-radius:14px; background:rgba(0,0,0,.55); color:#fff; text-overflow:ellipsis; white-space:nowrap; backdrop-filter:blur(2px); }
.bsp-b-part-chip { max-width:76%; font:600 8px/1.2 "PingFang SC","Microsoft YaHei",sans-serif; }
.bsp-b-time-chip { margin-left:auto; font:700 9px/1 ui-monospace,Menlo,monospace; font-variant-numeric:tabular-nums; }
.bsp-b-bottom { margin-top:auto; }
.bsp-b-title { display:-webkit-box; overflow:hidden; margin:0; color:#fff; font-size:19px; font-weight:800; line-height:1.4; letter-spacing:-.02em; text-shadow:0 2px 12px rgba(0,0,0,.7); -webkit-box-orient:vertical; -webkit-line-clamp:3; }
.bsp-b-up { margin-top:8px; overflow:hidden; color:rgba(255,255,255,.9); font-size:9px; font-weight:600; text-overflow:ellipsis; white-space:nowrap; }
.bsp-b-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:6px; margin-top:12px; padding:9px 12px; border:1px solid rgba(255,255,255,.16); border-radius:10px; background:rgba(0,0,0,.42); backdrop-filter:blur(3px); }
.bsp-b-stat { min-width:0; text-align:center; }
.bsp-b-stat strong, .bsp-b-stat span { display:block; }
.bsp-b-stat strong { overflow:hidden; color:#fff; font:750 11px/1 ui-monospace,Menlo,monospace; font-variant-numeric:tabular-nums; text-overflow:ellipsis; white-space:nowrap; }
.bsp-b-stat span { margin-top:3px; color:rgba(255,255,255,.62); font-size:7px; letter-spacing:.12em; }
.bsp-b-identity { margin-top:8px; color:rgba(255,255,255,.6); font:600 8px/1 ui-monospace,Menlo,monospace; letter-spacing:.08em; text-align:center; }
.bsp-b-destination { display:flex; align-items:center; gap:10px; margin-top:10px; }
.bsp-b-qr { box-sizing:border-box; flex:none; width:72px; height:72px; padding:4px; border-radius:5px; background:#fff; }
.bsp-b-link-side { min-width:0; flex:1; }
.bsp-b-link-label { display:block; margin-bottom:5px; color:rgba(255,255,255,.58); font-size:7px; letter-spacing:.16em; }
.bsp-b-link { display:block; overflow-wrap:anywhere; color:#fff; font:600 8px/1.45 ui-monospace,Menlo,monospace; word-break:break-all; text-shadow:0 1px 4px rgba(0,0,0,.8); }
@media (max-width:760px) { .bsp-workspace { grid-template-columns:1fr; } .bsp-preview-pane { border-right:0; border-bottom:1px solid #cbc7be; } .bsp-controls { min-height:360px; padding:26px 24px; } }
@media (prefers-reduced-motion:reduce) { .bsp-spinner { animation:none; } }
`;
