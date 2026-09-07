import { MOTION_STYLES } from "./motion";

export const STYLES = String.raw`
${MOTION_STYLES}
#bsp-entry { appearance:none; display:inline-flex; align-items:center; gap:8px; flex:none; height:28px; align-self:center; white-space:nowrap; margin-left:0; padding:0; border:0; border-radius:4px; background:transparent; color:var(--text2,#61666d); font:400 13px/28px "PingFang SC","Microsoft YaHei",sans-serif; cursor:pointer; vertical-align:middle; transition:color var(--bsp-motion-color) var(--bsp-ease-out); }
#bsp-entry.bsp-entry-dark { color:var(--text2,#b7bcc4); }
#bsp-entry:hover { color:var(--brand_blue,#00aeec); }
#bsp-entry:focus-visible,.bsp-button:focus-visible,.bsp-close:focus-visible { outline:3px solid #00aeec; outline-offset:3px; }
#bsp-entry svg { width:28px; height:28px; flex:none; }
.bsp-backdrop{--bsp-surface:#fff;--bsp-soft:#f6f7f8;--bsp-text:#18191c;--bsp-muted:#61666d;--bsp-line:#e3e5e7;--bsp-blue:#00aeec;--bsp-blue-bg:#e5f5fc;--bsp-error:#c95042;position:fixed;z-index:2147483646;inset:0;background:rgba(0,0,0,.4);display:grid;place-items:center;padding:24px;overflow:auto;font:14px/1.5 "PingFang SC","Microsoft YaHei",sans-serif;color:var(--bsp-text);animation:bsp-backdrop-in var(--bsp-motion-backdrop) var(--bsp-ease-out)}
.bsp-backdrop.bsp-appearance-dark{--bsp-surface:#24262b;--bsp-soft:#1d1f23;--bsp-text:#edf0f3;--bsp-muted:#a2a9b3;--bsp-line:#3a3e46;--bsp-blue:#62c9ef;--bsp-blue-bg:#203d48;--bsp-error:#ffab9d}
.bsp-backdrop *,.bsp-backdrop *::before,.bsp-backdrop *::after{box-sizing:border-box}
.bsp-backdrop.bsp-backdrop-closing{opacity:0;transition:opacity var(--bsp-motion-fast) var(--bsp-ease-in-out)}
.bsp-panel{color:var(--bsp-text);color-scheme:light;position:relative;width:min(920px,100%);max-height:calc(100dvh - 48px);background:var(--bsp-surface);border:0;border-radius:8px;box-shadow:0 2px 12px #00000014;overflow:auto;animation:bsp-panel-in var(--bsp-motion-open) var(--bsp-ease-out)}
.bsp-appearance-dark .bsp-panel{color-scheme:dark}
.bsp-panel:focus{outline:none}.bsp-panel.bsp-panel-closing{opacity:0;transform:translateY(8px);transition:opacity var(--bsp-motion-fast),transform var(--bsp-motion-fast)}
.bsp-panel button,.bsp-panel input,.bsp-panel textarea{font:inherit}
.bsp-panel button{appearance:none;cursor:pointer;border:1px solid var(--bsp-line);border-radius:6px;color:var(--bsp-text);background:var(--bsp-surface);padding:9px 16px}
.bsp-panel button:hover:not(:disabled){border-color:var(--bsp-blue);color:var(--bsp-blue)}
.bsp-panel button:disabled{cursor:not-allowed;opacity:.45}
.bsp-panel button:focus-visible,.bsp-panel input:focus-visible,.bsp-panel textarea:focus-visible,.bsp-text-content:focus-visible{outline:3px solid var(--bsp-blue);outline-offset:4px}
.bsp-panel-head{position:relative;min-height:64px;display:flex;align-items:center;justify-content:center;padding:20px 54px 12px}
#bsp-dialog-title{color:var(--bsp-text);margin:0;font-size:16px;line-height:24px;font-weight:400}
.bsp-panel .bsp-close{position:absolute;right:14px;top:14px;width:32px;height:32px;border:0;background:none;padding:7px;color:var(--bsp-muted);display:grid;place-content:center}
.bsp-close svg{width:18px;height:18px;stroke-width:1.8}.bsp-panel .bsp-close:hover{background:var(--bsp-soft);color:var(--bsp-blue)}
.bsp-workspace{display:grid;grid-template-columns:minmax(0,1.03fr) minmax(0,1fr);gap:32px;padding:12px 28px 26px}
.bsp-preview-pane{min-width:0;padding:0;background:transparent;border:0}
.bsp-preview-frame{width:100%;max-width:380px;aspect-ratio:3/4;position:relative;margin:auto;overflow:hidden;box-shadow:0 2px 10px #0000000d;border-radius:2px;background:#dce8e7}
.bsp-preview-frame>.bsp-poster{position:absolute;top:0;left:0}
.bsp-panel .bsp-download{width:36px;height:32px;padding:6px;border:0;background:transparent;color:var(--bsp-muted);display:grid;place-content:center;border-radius:6px}
.bsp-download svg{width:20px;height:20px}.bsp-panel .bsp-download:hover:not(:disabled){background:var(--bsp-soft)}
.bsp-controls{padding:0;display:flex;flex-direction:column;justify-content:center;gap:20px;min-width:0}
.bsp-options{border:0;padding:0;margin:0;display:flex;flex-wrap:wrap;gap:12px;min-width:0}
.bsp-panel .bsp-option-pill{position:relative;flex:1;display:flex;align-items:center;justify-content:center;gap:7px;padding:9px 8px;border:1px solid var(--bsp-line);border-radius:6px;font-size:12px;white-space:nowrap;background:transparent;color:var(--bsp-muted)}
.bsp-option-pill svg{width:16px;height:16px;flex:none}.bsp-panel .bsp-option-pill.is-on{background:var(--bsp-blue-bg);border-color:var(--bsp-blue);color:var(--bsp-blue)}
.bsp-option-notice{flex-basis:100%;font-size:11px;line-height:1.6;margin:0;color:var(--bsp-muted)}
.bsp-section-heading{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}
.bsp-section-heading h3{color:var(--bsp-text);margin:0;font-size:14px;font-weight:400;white-space:nowrap}
.bsp-text-copy-actions{display:flex;gap:14px;align-items:center}.bsp-panel .bsp-text-copy-actions button{border:0;padding:3px 0;background:transparent;color:var(--bsp-blue);font-size:12px;white-space:nowrap}
.bsp-panel .bsp-text-copy-actions button:hover:not(:disabled){color:#40c5f1}
.bsp-text-content{color:var(--bsp-text);border:0;background:var(--bsp-soft);border-radius:6px;padding:16px;font-size:13px;line-height:1.85;max-height:310px;min-height:0;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere;user-select:text}
.bsp-text-card-link{display:inline-block;vertical-align:top;width:100%;margin:0;color:var(--bsp-blue)}
.bsp-text-options{display:flex;margin-top:12px}.bsp-text-options label{font-size:12px;color:var(--bsp-muted);display:flex;gap:7px;align-items:center;cursor:pointer}
.bsp-text-options input{accent-color:var(--bsp-blue);width:14px;height:14px;margin:0}
.bsp-action-group{position:relative;margin:0}
.bsp-actions{display:flex;gap:12px}.bsp-panel .bsp-actions button{flex:1;min-height:40px;display:flex;align-items:center;justify-content:center;gap:8px;font-size:14px;padding:8px;border-radius:6px}
.bsp-panel .bsp-actions .bsp-download{flex:0 0 40px;height:40px;padding:8px}.bsp-actions svg{width:18px;height:18px;flex:none}.bsp-panel .bsp-action-primary{background:var(--bsp-blue);border-color:var(--bsp-blue);color:#fff}.bsp-panel .bsp-action-primary:hover:not(:disabled){background:#40c5f1;border-color:#40c5f1;color:#fff}
.bsp-status{position:fixed;z-index:3;bottom:24px;left:50%;width:min(420px,calc(100vw - 40px));margin:0;padding:9px 12px;border:1px solid var(--bsp-line);border-radius:6px;background:var(--bsp-surface);box-shadow:0 4px 16px #0002;font-size:12px;line-height:1.6;color:var(--bsp-text);overflow-wrap:anywhere;pointer-events:none;opacity:0;visibility:hidden;transform:translate(-50%,4px);transition:opacity 120ms,transform 120ms,visibility 120ms}.bsp-status.is-show{opacity:1;visibility:visible;transform:translate(-50%,0)}.bsp-status.is-error{color:var(--bsp-error)}
.bsp-loading-card{width:100%;max-width:380px;aspect-ratio:3/4;position:relative;margin:auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:24px;background:#eef4f1;color:#405e65;font-size:14px;text-align:center}
.bsp-loading-card p{margin:0}.bsp-panel .bsp-loading-card button{font-size:13px;background:#f9fbfa;border-color:#adc2c2;color:#405e65}
.bsp-poster-updating{position:absolute;inset:0;z-index:2;background:#eef4f1b8;display:grid;place-items:center;color:#405e65;font-size:14px;transition:opacity var(--bsp-motion-overlay)}
.bsp-poster-updating.is-leaving{opacity:0}
.bsp-spinner{width:22px;height:22px;border:2px solid #b8c9ca;border-top-color:#405e65;border-radius:50%;animation:bsp-spin 1s linear infinite}
.bsp-error{font-size:13px;color:var(--bsp-error);line-height:1.7;margin:0}.bsp-help{font-size:12px;color:var(--bsp-muted);line-height:1.7;margin:0}
.bsp-manual-copy{width:100%;padding:12px;background:var(--bsp-soft);color:var(--bsp-text);border:1px solid var(--bsp-line);border-radius:6px;resize:vertical;font-size:13px!important}
@keyframes bsp-spin{to{transform:rotate(360deg)}}
@keyframes bsp-backdrop-in{from{opacity:0}to{opacity:1}}
@keyframes bsp-panel-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@media(max-width:760px){
.bsp-backdrop{padding:10px;display:block}.bsp-panel{max-height:none}.bsp-panel-head{padding:17px 48px 12px;min-height:56px}.bsp-panel .bsp-close{right:10px;top:10px}
.bsp-workspace{grid-template-columns:1fr;padding:6px 20px 22px;gap:22px}.bsp-preview-frame{max-width:340px}.bsp-controls{gap:20px}
.bsp-options{gap:8px}.bsp-panel .bsp-option-pill{font-size:11px;gap:5px;padding:9px 5px}.bsp-section-heading{gap:6px}.bsp-section-heading h3{font-size:13px}.bsp-text-copy-actions{gap:10px}.bsp-panel .bsp-text-copy-actions button{font-size:11px}
.bsp-text-content{padding:14px}.bsp-panel .bsp-actions button{font-size:13px}
}
`;
