// THROWAWAY visual inspection, not a production regression suite.
import {mkdir,writeFile} from 'node:fs/promises';
import {browserRuntime} from '../../../../../scripts/browser-test-support.mjs';
const {chromium}=await browserRuntime();const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1280,height:900}});
const out='.scratch/bilibili-share-poster/usage-refinement/text-panel-polish/prototype/evidence';await mkdir(out,{recursive:true});
const measurements=[];
for(const variant of ['A','B','C']){
 await page.goto(`http://127.0.0.1:8778/?variant=${variant}`);
 for(const detail of [false,true]){
  await page.getByLabel('详细信息',{exact:true}).setChecked(detail);
  await page.screenshot({path:`${out}/${variant}-${detail?'detailed':'compact'}.png`,fullPage:true});
  measurements.push({variant,detail,...await page.evaluate(()=>{const r=n=>{const b=n.getBoundingClientRect();return {y:b.y,bottom:b.bottom,height:b.height}};return {preview:r(document.querySelector('.bsp-preview-frame')),text:r(document.querySelector('.bsp-text-content')),actions:r(document.querySelector('.bsp-action-group')),controls:r(document.querySelector('.bsp-controls'))}})});
 }
 await page.getByLabel('深色模式',{exact:true}).check();await page.screenshot({path:`${out}/${variant}-dark.png`,fullPage:true});
}
await page.goto('http://127.0.0.1:8778/?variant=B');await page.setViewportSize({width:390,height:900});await page.getByLabel('详细信息',{exact:true}).check();await page.screenshot({path:`${out}/B-390.png`,fullPage:true});
await writeFile(`${out}/measurements.json`,JSON.stringify(measurements,null,2));await browser.close();
