/** Fixed export coordinates; preview scaling is applied outside this layout. */
export const posterStyles = `
.bsp-poster.bsp-default-poster{all:initial;box-sizing:border-box;position:relative;display:flex;flex-direction:column;flex:none;width:1080px;height:1440px;overflow:hidden;background:#dce8e7;color:#233b41;font-family:"PingFang SC","Microsoft YaHei",sans-serif;transform-origin:top left;-webkit-text-stroke:0;text-shadow:none}
.bsp-default-poster::after{display:none}
.bsp-default-poster *{box-sizing:border-box}
.bsp-d-mast{height:104px;flex:none;padding:0 56px;display:flex;align-items:center}
.bsp-d-brand{width:110px;height:51px;object-fit:contain}
.bsp-d-cover{display:block;width:1080px;height:608px;flex:none;object-fit:contain;object-position:center;background:#dce8e7;border-radius:22px}
.bsp-d-editorial{min-height:0;overflow:hidden;flex:1;padding:26px 56px 22px;display:flex;flex-direction:column}
.bsp-d-title-space{height:100%;min-height:0}
.bsp-d-title{margin:0;font-weight:500;letter-spacing:-1px;line-height:1.28;overflow-wrap:anywhere;word-break:normal}
.bsp-d-footer{height:310px;flex:none;padding:32px 56px;background:#eef4f1;display:grid;grid-template-columns:minmax(0,1fr) 204px;gap:40px;align-items:center;position:relative}
.bsp-d-footer::before,.bsp-d-link-footer::before{content:'';position:absolute;top:0;left:56px;right:56px;border-top:1px solid #a9bdbc}
.bsp-d-signature{min-width:0;align-self:center}
.bsp-d-author{display:flex;gap:16px;height:85px;margin:0 0 18px;align-items:center;min-width:0;line-height:1.25;font-size:34px;font-weight:500;letter-spacing:.1px}
.bsp-d-up{width:44px;height:44px;flex:none}
.bsp-d-name{min-width:0;overflow-wrap:anywhere}
.bsp-d-stats{display:flex;gap:24px;align-items:center;margin-bottom:24px;color:#405e65}
.bsp-d-stat{display:flex;gap:10px;align-items:center;font-size:30px;white-space:nowrap;font-variant-numeric:tabular-nums}
.bsp-d-stat img,.bsp-d-stat svg{width:32px;height:32px;flex:none}
.bsp-d-ids{display:flex;gap:24px;font-size:24px;white-space:nowrap;letter-spacing:.5px;color:#5f777b}
.bsp-d-ids b{font-weight:550;letter-spacing:1px}
.bsp-d-qr{width:204px;align-self:center}
.bsp-d-qr-frame{padding:7px;border:1px solid #a9bdbc;border-radius:20px;background:#fff}
.bsp-d-qr-image{width:188px;height:188px;display:block}
.bsp-d-qr-caption{text-align:center;margin-top:14px;font-size:24px;line-height:1.4;letter-spacing:2px}
.bsp-d-link-footer{position:relative;min-height:116px;padding:16px 56px;flex:none;display:flex;align-items:center;background:#eef4f1}
.bsp-d-address{display:flex;align-items:center;gap:14px;min-width:0;width:100%;min-height:72px;padding:14px 24px;border:1px solid #adc2c2;border-radius:24px;background:#f9fbfa;box-shadow:inset 0 1px 2px #233b4108}
.bsp-d-address-icon{width:28px;height:28px;flex:none;fill:none;stroke:#6b8589;stroke-width:1.4;stroke-linecap:round}
.bsp-d-link{flex:1;min-width:0;font-size:24px;line-height:1.4;letter-spacing:.25px;overflow-wrap:anywhere;word-break:break-all;white-space:normal;color:#405e65}
`;
