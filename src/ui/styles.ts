import { MOTION_STYLES } from "./motion";

export const STYLES = String.raw`
${MOTION_STYLES}
:root { --bsp-paper:#f7f5f0; --bsp-ink:#1a1a1a; --bsp-muted:#6b6b66; --bsp-stage:#232629; --bsp-stage-line:#2e3135; --bsp-radius:16px; }
#bsp-entry { appearance:none; display:inline-flex; align-items:center; gap:7px; height:34px; margin-left:0; padding:0 14px; border:1px solid #aaa9a4; border-radius:3px; background:#fff; color:#242424; font:500 14px/1 "PingFang SC","Microsoft YaHei",sans-serif; cursor:pointer; vertical-align:middle; transition:background-color var(--bsp-motion-color) var(--bsp-ease-out),border-color var(--bsp-motion-color) var(--bsp-ease-out); }
#bsp-entry:hover { background:#f7f5f0; border-color:#77756f; }
#bsp-entry:focus-visible,.bsp-button:focus-visible,.bsp-close:focus-visible { outline:3px solid #00aeec; outline-offset:2px; }
#bsp-entry svg { width:18px; height:18px; }
.bsp-backdrop { position:fixed; inset:0; z-index:2147483646; display:grid; place-items:center; padding:16px; background:rgba(14,14,13,.68); font-family:"PingFang SC","Microsoft YaHei",sans-serif; animation:bsp-backdrop-in var(--bsp-motion-backdrop) var(--bsp-ease-out); }
.bsp-backdrop.bsp-backdrop-closing { opacity:0; transition:opacity var(--bsp-motion-fast) var(--bsp-ease-in-out); }
.bsp-panel { position:relative; width:min(1040px,calc(100vw - 56px)); max-height:calc(100vh - 56px); overflow:auto; border:1px solid #d4d0c7; border-radius:var(--bsp-radius); background:#f1eee7; box-shadow:0 28px 80px rgba(0,0,0,.34); color:#1a1a1a; animation:bsp-panel-in var(--bsp-motion-open) var(--bsp-ease-out); }
.bsp-panel.bsp-panel-closing { opacity:0; transform:translateY(8px) scale(0.985); transition:opacity var(--bsp-motion-fast) var(--bsp-ease-in-out),transform var(--bsp-motion-fast) var(--bsp-ease-in-out); }
.bsp-panel:focus { outline:none; }
.bsp-panel-head { display:flex; align-items:center; justify-content:space-between; min-height:52px; padding:0 18px; border-bottom:1px solid #cbc7be; background:#faf8f3; }
.bsp-close { appearance:none; width:36px; height:36px; border:0; border-radius:50%; background:transparent; color:#55524c; font-size:25px; line-height:1; cursor:pointer; }
.bsp-close:hover { background:#e7e3db; }
.bsp-eyebrow { color:var(--bsp-muted); font:700 10px/1 ui-monospace,Menlo,monospace; letter-spacing:.22em; }
.bsp-workspace { display:grid; min-width:0; grid-template-columns:54% 46%; min-height:600px; }
.bsp-preview-pane { display:grid; min-width:0; align-items:center; justify-items:center; padding:24px; border-right:1px solid var(--bsp-stage-line); background:var(--bsp-stage); }
.bsp-preview-frame { overflow:hidden; position:relative; grid-area:1/1; width:min(100%,360px); aspect-ratio:3/4; display:block; filter:drop-shadow(0 14px 22px rgba(20,20,18,.22)); transition:opacity var(--bsp-motion-fast) var(--bsp-ease-in-out),transform var(--bsp-motion-fast) var(--bsp-ease-in-out); }
.bsp-preview-frame-incoming { opacity:0; transform:translateY(4px); }
.bsp-preview-frame-incoming.is-visible { opacity:1; transform:translateY(0); }
.bsp-preview-frame-exit { opacity:0; }
.bsp-poster-updating { animation:bsp-backdrop-in var(--bsp-motion-overlay) var(--bsp-ease-out); transition:opacity var(--bsp-motion-overlay) var(--bsp-ease-out); position:absolute; inset:0; z-index:2; display:grid; place-items:center; background:rgba(255,255,255,.66); color:#55524c; font-size:13px; font-weight:600; }
.bsp-loading-card { width:min(100%,360px); aspect-ratio:3/4; display:grid; place-items:center; border:1px solid #b9b5ac; background:#f7f5f0; color:#64615b; }
.bsp-spinner { width:28px; height:28px; margin:0 auto 14px; border:2px solid #c8c4bb; border-top-color:#1a1a1a; border-radius:50%; animation:bsp-spin .75s linear infinite; }
@keyframes bsp-spin { to { transform:rotate(360deg); } }
.bsp-controls { min-width:0; display:flex; flex-direction:column; padding:20px 22px; overflow:auto; background:#faf8f3; }
.bsp-step { margin:0 0 10px; color:#77736b; font:600 10px/1.2 ui-monospace,Menlo,monospace; letter-spacing:.16em; }
.bsp-controls h3 { margin:0 0 12px; font-size:24px; line-height:1.25; font-weight:650; }
.bsp-options { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; margin-top:14px; }
.bsp-option-pill { appearance:none; display:inline-flex; align-items:center; justify-content:center; gap:6px; height:36px; padding:0 10px; border:1px solid var(--line, #cbc7be); border-radius:9px; background:#fff; color:#55524c; font-size:12px; font-weight:600; cursor:pointer; transition:background-color var(--bsp-motion-overlay) var(--bsp-ease-out),color var(--bsp-motion-overlay) var(--bsp-ease-out),border-color var(--bsp-motion-overlay) var(--bsp-ease-out),transform var(--bsp-motion-overlay) var(--bsp-ease-out); }
.bsp-option-pill:hover { border-color:#a9a59b; color:var(--bsp-ink); }
.bsp-option-pill svg { width:15px; height:15px; }
.bsp-option-pill.is-on { border-color:var(--bsp-ink); background:var(--bsp-ink); color:#fff; }
.bsp-option-pill:disabled { opacity:.55; cursor:not-allowed; }
.bsp-option-notice { grid-column:1/-1; margin:10px 0 0 !important; color:#7a4d1d !important; font-size:12px !important; }
.bsp-controls p { margin:0; color:#66625b; font-size:14px; line-height:1.7; }
.bsp-fallback { display:grid; gap:5px; margin-top:18px; padding:14px 16px; border-left:3px solid #9a6528; background:#f4e9d7; color:#5f431f; }
.bsp-fallback strong { font-size:13px; line-height:1.4; }
.bsp-fallback span { font-size:12px; line-height:1.55; }
.bsp-text-card { position:relative; margin-top:20px; border:0; border-radius:10px; background:#fff; color:#24231f; }
.bsp-text-content { max-height:96px; overflow:auto; padding:12px 42px 12px 14px; white-space:pre-wrap; overflow-wrap:anywhere; user-select:text; }
.bsp-text-card-body { font:400 13px/1.65 "PingFang SC","Microsoft YaHei",sans-serif; }
.bsp-text-card-link { font:500 11px/1.6 ui-monospace,Menlo,monospace; color:#4f6d5b; }
.bsp-text-card .bsp-text-copy { position:absolute; right:6px; top:6px; height:28px; width:28px; padding:0; border:0; border-radius:6px; }
.bsp-text-copy svg { width:15px; height:15px; }
.bsp-text-copy::after { left:auto; right:0; transform:translateY(4px); }
.bsp-text-copy:hover::after, .bsp-text-copy:focus-visible::after { transform:translateY(0); }
.bsp-actions { margin-top:auto; padding-top:24px; display:grid; grid-template-columns:minmax(0,1fr) 44px minmax(0,1fr); gap:8px; }
.bsp-action { min-width:0; position:relative; display:inline-flex; align-items:center; justify-content:center; gap:7px; height:44px; padding:0 10px; border:1px solid var(--line, #cbc7be); border-radius:10px; background:#fff; color:#55524c; font-size:12px; font-weight:600; cursor:pointer; transition:background-color var(--bsp-motion-overlay) var(--bsp-ease-out),color var(--bsp-motion-overlay) var(--bsp-ease-out),border-color var(--bsp-motion-overlay) var(--bsp-ease-out),transform var(--bsp-motion-overlay) var(--bsp-ease-out); }
.bsp-action:hover { border-color:#a9a59b; color:var(--bsp-ink); transform:translateY(-1px); }
.bsp-action svg { flex:none; width:18px; height:18px; }
.bsp-action-primary { border-color:var(--bsp-ink); background:var(--bsp-ink); color:#fff; }
.bsp-action-primary:hover { background:#353431; color:#fff; }
.bsp-action:disabled { opacity:.5; cursor:not-allowed; transform:none; }
.bsp-action::after { content:attr(data-tip); position:absolute; bottom:calc(100% + 8px); left:50%; transform:translate(-50%,4px); padding:5px 8px; border-radius:6px; background:rgba(18,18,18,.88); color:#fff; font-size:11px; width:max-content; max-width:180px; white-space:normal; text-align:center; opacity:0; pointer-events:none; transition:opacity var(--bsp-motion-overlay) var(--bsp-ease-out),transform var(--bsp-motion-overlay) var(--bsp-ease-out); z-index:3; }
.bsp-actions > :last-child::after { left:auto; right:0; transform:translateY(4px); }
.bsp-actions > :last-child:hover::after, .bsp-actions > :last-child:focus-visible::after { transform:translateY(0); }
.bsp-action:hover::after, .bsp-action:focus-visible::after { opacity:1; transform:translate(-50%,0); }
.bsp-button-primary { background:#1a1a1a; color:#fff; }
.bsp-button-secondary { background:#fff; color:#1a1a1a; }
.bsp-button-secondary:hover { background:#f7f5f0; }
.bsp-button { appearance:none; width:100%; min-height:46px; border:1px solid #1a1a1a; border-radius:2px; background:#1a1a1a; color:#fff; font:650 14px/1 "PingFang SC","Microsoft YaHei",sans-serif; cursor:pointer; }
.bsp-button:hover { background:#353431; }
.bsp-button:disabled { border-color:#aaa79f; background:#aaa79f; cursor:not-allowed; }
.bsp-help { margin-top:12px !important; font-size:12px !important; }
.bsp-error { margin:20px 0; padding:16px; border-left:3px solid #a3452f; background:#f5e6df; color:#6f2f20 !important; }
.bsp-status { min-height:20px; margin-top:10px !important; color:#3d6b47 !important; font-size:12px !important; opacity:0; transform:translateY(3px); transition:opacity var(--bsp-motion-color) var(--bsp-ease-in-out),transform var(--bsp-motion-color) var(--bsp-ease-in-out); }
.bsp-status.is-show { opacity:1; transform:translateY(0); }
.bsp-status.is-error { color:#a3452f !important; }
.bsp-poster { transform-origin:top left; box-sizing:border-box; position:relative; width:360px; height:480px; overflow:hidden; padding:17px 18px 16px; border:1px solid #b7b4ac; background:#f7f5f0; color:#1a1a1a; }
.bsp-poster::after { content:""; position:absolute; inset:0; pointer-events:none; opacity:.16; background-image:radial-gradient(#776f62 .45px,transparent .55px); background-size:4px 4px; }
.bsp-masthead { position:relative; z-index:1; display:flex; align-items:flex-end; justify-content:space-between; padding-bottom:6px; border-bottom:1px solid #1a1a1a; }
.bsp-masthead strong { font:700 9px/1.1 "PingFang SC","Microsoft YaHei",sans-serif; letter-spacing:.08em; }
.bsp-masthead span { color:#6b6b66; font:600 7px/1 ui-monospace,Menlo,monospace; letter-spacing:.18em; }
.bsp-cover { position:relative; z-index:1; display:block; width:100%; height:182px; margin:10px 0 9px; border:1px solid #77736b; object-fit:cover; object-position:center; }
.bsp-cover-missing { display:grid; place-items:center; background:repeating-linear-gradient(135deg,#ece8df 0 8px,#e2ddd2 8px 16px); color:#8b877e; font:700 8px/1 ui-monospace,Menlo,monospace; letter-spacing:.14em; }
.bsp-b-cover-missing { position:absolute; inset:0; display:grid; justify-items:center; align-items:start; padding-top:120px; background:repeating-linear-gradient(135deg,#20252a 0 10px,#15191d 10px 20px); color:rgba(255,255,255,.62); font:700 9px/1 ui-monospace,Menlo,monospace; letter-spacing:.16em; }
.bsp-poster-b.bsp-cover-missing .bsp-b-scrim { background:rgba(0,0,0,.35); }
.bsp-poster-title { position:relative; z-index:1; display:-webkit-box; overflow:hidden; margin:0; font-size:19px; line-height:1.26; font-weight:700; letter-spacing:-.02em; -webkit-box-orient:vertical; -webkit-line-clamp:2; }
.bsp-byline { position:relative; z-index:1; display:flex; align-items:center; justify-content:space-between; gap:10px; margin-top:8px; color:#55524c; font-size:9px; }
.bsp-byline strong { min-width:0; overflow:hidden; color:#262522; font-weight:600; text-overflow:ellipsis; white-space:nowrap; }
.bsp-identity { flex:none; font:600 7.5px/1 ui-monospace,Menlo,monospace; }
.bsp-part-timestamp { position:relative; z-index:1; display:flex; align-items:center; gap:6px; margin-top:7px; min-height:14px; }
.bsp-part-timestamp:empty { display:none; }
.bsp-part-chip { max-width:82%; overflow:hidden; padding:2px 7px; border:1px solid #77736b; background:#f0ede6; color:#24231f; font:600 8px/1.2 "PingFang SC","Microsoft YaHei",sans-serif; text-overflow:ellipsis; white-space:nowrap; }
.bsp-time-chip { margin-left:auto; color:#1a1a1a; font:700 9px/1 ui-monospace,Menlo,monospace; font-variant-numeric:tabular-nums; }
.bsp-stats { position:relative; z-index:1; display:grid; grid-template-columns:repeat(4,1fr); margin-top:9px; border-top:2px solid #1a1a1a; border-bottom:1px solid #aaa69d; }
.bsp-stat { padding:6px 5px 5px; border-right:1px solid #c6c2b9; }
.bsp-stat:last-child { border-right:0; }
.bsp-stat strong,.bsp-stat span { display:block; }
.bsp-stat strong { white-space:nowrap; font:750 clamp(14px,4.3vw,16px)/1 ui-monospace,Menlo,monospace; font-variant-numeric:tabular-nums; letter-spacing:-.025em; }
.bsp-stat span { margin-top:5px; color:#6b6b66; font-size:7px; letter-spacing:.18em; }
.bsp-destination { position:relative; z-index:1; display:grid; grid-template-columns:78px 1fr; gap:13px; align-items:center; margin-top:9px; }
.bsp-qr { box-sizing:border-box; display:block; width:78px; height:78px; background:#fff; }
.bsp-link-label { display:block; margin-bottom:7px; color:#6b6b66; font-size:7px; letter-spacing:.17em; }
.bsp-link { display:block; overflow-wrap:anywhere; color:#1a1a1a; font:600 8px/1.45 ui-monospace,Menlo,monospace; word-break:break-all; }
.bsp-archive { position:absolute; right:18px; bottom:7px; z-index:1; color:#8b877e; font:600 6px/1 ui-monospace,Menlo,monospace; letter-spacing:.12em; }
.bsp-theme-segment { display:inline-flex; align-self:flex-start; padding:3px; border:1px solid var(--line, #cbc7be); border-radius:9px; background:rgba(0,0,0,.04); }
.bsp-theme-option { appearance:none; display:inline-flex; align-items:center; height:30px; padding:0 12px; border:0; border-radius:7px; background:transparent; color:var(--bsp-muted); font-size:12px; font-weight:600; cursor:pointer; transition:background-color var(--bsp-motion-fast) var(--bsp-ease-in-out),color var(--bsp-motion-fast) var(--bsp-ease-in-out); }
.bsp-theme-option.is-active { background:var(--bsp-ink); color:#fff; box-shadow:0 2px 8px rgba(0,0,0,.16); }
#bsp-entry.bsp-entry-b { background:#18191c; border-color:#18191c; color:#fff; }
#bsp-entry.bsp-entry-b:hover { background:#343a40; border-color:#343a40; }
.bsp-backdrop.bsp-theme-b { background:rgba(5,6,8,.78); }
.bsp-panel.bsp-theme-b { border-color:#3d4045; background:#18191c; color:#f1f2f3; }
.bsp-panel.bsp-theme-b .bsp-panel-head { border-bottom-color:#2e3135; background:#101113; }
.bsp-panel.bsp-theme-b .bsp-close { color:#c9cdd2; }
.bsp-panel.bsp-theme-b .bsp-close:hover { background:#2e3135; }
.bsp-panel.bsp-theme-b .bsp-preview-pane { border-right-color:#2e3135; background:var(--bsp-stage); }
.bsp-panel.bsp-theme-b .bsp-controls { background:#18191c; }
.bsp-panel.bsp-theme-b .bsp-controls p, .bsp-panel.bsp-theme-b .bsp-step { color:#c9cdd2; }
.bsp-panel.bsp-theme-b .bsp-option-pill { border-color:#3d4045; background:#232528; color:#c9cdd2; }
.bsp-panel.bsp-theme-b .bsp-option-pill.is-on { border-color:#f1f2f3; background:#f1f2f3; color:#18191c; }
.bsp-panel.bsp-theme-b .bsp-text-card { border-color:#2e3135; background:#101113; color:#e8e9eb; }
.bsp-panel.bsp-theme-b .bsp-text-card-link { color:#9fc4ac; }
.bsp-panel.bsp-theme-b .bsp-theme-segment { border-color:#3d4045; background:#232528; }
.bsp-panel.bsp-theme-b .bsp-theme-option { color:#c9cdd2; }
.bsp-panel.bsp-theme-b .bsp-theme-option.is-active { background:#f1f2f3; color:#18191c; }
.bsp-panel.bsp-theme-b .bsp-action { border-color:#3d4045; background:#232528; color:#e8e9eb; }
.bsp-panel.bsp-theme-b .bsp-action-primary { border-color:#f1f2f3; background:#f1f2f3; color:#18191c; }
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
.bsp-backdrop *, .bsp-backdrop *::before, .bsp-backdrop *::after { box-sizing:border-box; }
.bsp-panel button:focus-visible, .bsp-text-content:focus-visible { outline:2px solid #00aeec; outline-offset:3px; }
.bsp-panel, .bsp-panel-head, .bsp-controls, .bsp-text-card { transition:color var(--bsp-motion-color) var(--bsp-ease-in-out),background-color var(--bsp-motion-color) var(--bsp-ease-in-out),border-color var(--bsp-motion-color) var(--bsp-ease-in-out); }
.bsp-poster-updating.is-leaving { opacity:0; }
.bsp-panel.bsp-theme-b .bsp-status { color:#a9d4b3 !important; }
.bsp-panel.bsp-theme-b .bsp-status.is-error { color:#ffb39f !important; }
.bsp-panel.bsp-theme-b .bsp-option-notice { color:#e6c391 !important; }
.bsp-panel.bsp-theme-b .bsp-action-primary:hover { background:#d8dadc; color:#18191c; }
.bsp-panel.bsp-theme-b .bsp-option-pill:hover { border-color:#92979d; }
@keyframes bsp-backdrop-in { from { opacity:0; } }
@keyframes bsp-panel-in { from { opacity:0; transform:translateY(10px) scale(0.985); } }
@media (width < 880px) { .bsp-workspace { grid-template-columns:1fr; min-height:0; } .bsp-preview-pane { border-right:0; border-bottom:1px solid var(--bsp-stage-line); } .bsp-controls { min-height:0; padding:20px; overflow:visible; }
  .bsp-backdrop { padding:8px; }
  .bsp-panel { width:calc(100vw - 16px); max-height:calc(100dvh - 16px); }
  .bsp-actions { grid-template-columns:repeat(2,minmax(0,1fr)); margin-top:0; }
  .bsp-actions > :last-child { grid-column:1/-1; }
  .bsp-preview-pane { padding:20px; }
}
@media (prefers-reduced-motion:reduce) {
  .bsp-spinner { animation:none; }
  .bsp-backdrop, .bsp-panel, .bsp-preview-frame, .bsp-option-pill, .bsp-action, .bsp-theme-option, .bsp-status, #bsp-entry { transition:none; animation:none; }
  .bsp-backdrop.bsp-backdrop-closing { opacity:0; }
  .bsp-panel.bsp-panel-closing { opacity:0; transform:none; }
  .bsp-preview-frame-incoming { opacity:1; transform:none; }
  .bsp-preview-frame-exit { opacity:0; }
}
`;
