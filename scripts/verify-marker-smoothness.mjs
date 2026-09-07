import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {browserRuntime,productionBundle,openFixture} from './browser-test-support.mjs';
const {chromium}=await browserRuntime();
const browser=await chromium.launch({headless:true});
const out=process.env.BSP_EVIDENCE_DIR??'.scratch/bilibili-share-poster/usage-refinement/interaction-smoothness/evidence';
await mkdir(out,{recursive:true});
try{
 const {page,context}=await openFixture(browser,await productionBundle());
 await page.getByRole('button',{name:'分享海报',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('[aria-label="复制海报"]')?.disabled===false);
 await page.evaluate(()=>{
  const decode=HTMLImageElement.prototype.decode;
  window.pendingQr=[];
  HTMLImageElement.prototype.decode=async function(){await decode.call(this);if(this.alt.startsWith('二维码：'))await new Promise(r=>window.pendingQr.push(r));};
 });
 const frame=page.locator('.bsp-preview-frame');
 await frame.screenshot({path:`${out}/before-toggle.png`});
 await page.getByRole('button',{name:'标记当前时间',exact:true}).click();
 await page.waitForFunction(()=>window.pendingQr.length>0);
 await frame.screenshot({path:`${out}/pending-toggle.png`});
 const visibility=await frame.evaluate(frame=>{
  const poster=frame.querySelector('.bsp-poster');
  const box=poster.getBoundingClientRect();
  const points=[[.15,.15],[.5,.3],[.75,.65]];
  return points.map(([x,y])=>{
   const top=document.elementFromPoint(box.x+box.width*x,box.y+box.height*y);
   return {posterVisible:poster.contains(top),topBackground:top?getComputedStyle(top).backgroundColor:null,topText:top?.textContent?.slice(0,40)};
  });
 });
 await writeFile(`${out}/visibility.json`,JSON.stringify(visibility,null,2));
 assert.ok(visibility.every(p=>p.posterVisible),'marker update must keep the existing poster unobscured across a painted frame');
 await page.evaluate(()=>window.pendingQr.forEach(r=>r()));
 await page.waitForFunction(()=>document.querySelector('[aria-label="复制海报"]')?.disabled===false);
 await context.close();
}finally{await browser.close();}
