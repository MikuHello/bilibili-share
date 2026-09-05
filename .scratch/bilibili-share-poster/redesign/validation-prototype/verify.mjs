// Browser layout/interaction evidence for a throwaway prototype, not production tests.
import { chromium } from '/Users/mikuhello/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { writeFile,mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const out=new URL('./evidence/',import.meta.url);await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});const errors=[];const records=[];
const page=await browser.newPage({viewport:{width:1080,height:1440},deviceScaleFactor:1});
page.on('pageerror',e=>errors.push(e.message));
try{
  for(const key of ['original','short','long','part','partonly','timeonly','longlink','portrait','square','unbroken']){
    await page.goto('http://127.0.0.1:8768/poster.html?case='+key);await page.waitForLoadState('networkidle');await page.waitForFunction(()=>document.documentElement.dataset.ready==='true');
    const r=await page.evaluate(()=>{const rect=s=>document.querySelector(s).getBoundingClientRect().toJSON();const link=document.querySelector('.link-footer .link');const image=document.querySelector('.cover');return {...adaptationReport,poster:rect('.poster'),cover:rect('.cover'),editorial:rect('.editorial'),title:rect('.heading'),footer:rect('.footer'),qr:rect('.qr-frame'),address:rect('.address-bar'),linkRect:rect('.link-footer .link'),linkText:link.textContent,linkOverflow:link.scrollWidth>link.clientWidth+1,imageLoaded:[...document.images].every(i=>i.complete&&i.naturalWidth>0),objectFit:getComputedStyle(image).objectFit,bodyOverflow:document.body.scrollHeight>1440,context:document.querySelector('.context-line')?rect('.context-line'):null,name:rect('.author-name'),nameLineHeight:parseFloat(getComputedStyle(document.querySelector('.author-name')).lineHeight)};});
    assert.equal(r.poster.width,1080);assert.equal(r.poster.height,1440);assert.equal(r.imageLoaded,true);assert.equal(r.objectFit,'contain');assert.equal(r.linkText,r.link);assert.equal(r.linkOverflow,false);assert.equal(r.bodyOverflow,false);assert.ok(r.title.bottom<=r.footer.top+1);assert.ok(r.address.bottom<=1440);assert.ok(r.linkRect.left>=r.address.left&&r.linkRect.right<=r.address.right);assert.ok(r.linkRect.bottom<=r.address.bottom);assert.ok(r.name.height<=2*r.nameLineHeight+1);if(r.context)assert.ok(r.context.bottom<=r.footer.top+1);
    await page.screenshot({path:new URL('poster-'+key+'.png',out).pathname});records.push(r);
  }
  assert.deepEqual(errors,[]);await writeFile(new URL('layout-report.json',out),JSON.stringify({browser:browser.version(),records,errors,checks:'10 poster fixtures; panel checks in panel-v2/report.json'},null,2));
  console.log('Ten poster layouts verified.');
}finally{await browser.close();}

await import('./verify-panel-v4.mjs');
