/** B3 uses fixed export coordinates; preview scaling happens outside this layout. */
export const posterStyles = `
.bsp-poster.bsp-default-poster{all:initial;box-sizing:border-box;position:relative;isolation:isolate;display:grid;grid-template-columns:minmax(0,1fr);grid-template-rows:144px 547.2px auto minmax(0,1fr) 100.8px;flex:none;width:1080px;height:1440px;overflow:hidden;background:#e8eded;color:#203039;font-family:"PingFang SC","Microsoft YaHei",sans-serif;transform-origin:top left;-webkit-text-stroke:0;text-shadow:none}
.bsp-default-poster::after{display:none}
.bsp-default-poster *{box-sizing:border-box}
.bsp-d-mast{display:flex;justify-content:space-between;align-items:center;padding:32.4px 64.8px;gap:21.6px;min-height:0}
.bsp-d-brand{width:151.2px;height:75.6px;object-fit:contain}
.bsp-d-ids{display:grid;gap:6.48px;text-align:right;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:25.92px;letter-spacing:.3px;white-space:nowrap}
.bsp-d-ids b{font-weight:inherit}
.bsp-d-cover{display:block;width:950.4px;height:547.2px;object-fit:contain;object-position:center;justify-self:center}
.bsp-d-honor{position:absolute;right:48px;top:116px;z-index:1;isolation:isolate;max-width:950.4px;font-size:38px;font-weight:600;line-height:1.3;letter-spacing:.3px;padding:10px 22px 10px 34px;color:#583b16;overflow-wrap:anywhere;white-space:pre-wrap;filter:drop-shadow(0 5px 7px #422b1726)}
.bsp-d-honor::before{content:"";position:absolute;inset:0;z-index:-1;background:#f1ce84;clip-path:polygon(0 0,100% 0,100% 100%,0 100%,14px 50%)}
.bsp-d-honor::after{content:"";position:absolute;right:0;top:100%;width:16.8px;height:14px;background:#a57839;clip-path:polygon(0 0,100% 0,0 100%)}
.bsp-d-editorial{min-height:0;padding:43.2px 64.8px 32.4px}
.bsp-d-title-space{min-height:0}
.bsp-d-title{margin:0;font-family:"Songti SC","STSong","SimSun",serif;font-weight:600;letter-spacing:0;line-height:1.38;overflow-wrap:anywhere;word-break:normal;color:inherit}
.bsp-d-footer{min-height:0;margin:0 64.8px;padding:43.2px 0 21.6px;border-top:1px solid #20303933;display:flex;gap:21.6px;align-items:center}
.bsp-d-information{display:flex;align-items:flex-end;gap:21.6px;width:100%;min-width:0}
.bsp-d-signature{min-width:0;flex:1}
.bsp-d-author{display:flex;gap:15.12px;align-items:center;min-width:0;line-height:1.4;font-size:49.68px;font-weight:600;white-space:nowrap}
.bsp-d-up{width:66.96px;height:66.96px;flex:0 0 66.96px}
.bsp-d-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bsp-d-stats{display:flex;justify-content:space-between;gap:16.2px;align-items:center;margin-top:30.24px}
.bsp-d-stat{flex:none;display:flex;gap:7.56px;align-items:center;font-size:36.72px;white-space:nowrap;font-variant-numeric:tabular-nums}
.bsp-d-stat-value{flex:none}
.bsp-d-stat img,.bsp-d-stat svg{width:54px;height:54px;min-width:54px;max-width:54px;flex:0 0 54px}
.bsp-d-qr{width:183.6px;flex:0 0 183.6px;text-align:center}
.bsp-d-qr-frame{padding:12.96px 12.96px 0;background:transparent}
.bsp-d-qr-image{width:157.68px;height:157.68px;display:block}
.bsp-d-qr-caption{margin-top:0;height:54px;font-size:27px;line-height:54px}
.bsp-d-link-footer{min-width:0;padding:10.8px 64.8px 32.4px;display:flex;align-items:center}
.bsp-d-address{min-width:0;width:100%}
.bsp-d-address-icon{display:none}
.bsp-d-link{display:block;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:27px;line-height:1.4;overflow-wrap:anywhere;word-break:break-all;white-space:normal}
`;
