import {chromium} from '/Users/mikuhello/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1280,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));const report=[];
for(const variant of ['A','B','C']){await page.goto('http://127.0.0.1:8784/?variant='+variant);await page.screenshot({path:new URL('variant-'+variant+'.png',import.meta.url).pathname});await page.locator('#honor').selectOption({label:'全站排行榜最高第4名'});await page.locator('#long').check();report.push(await page.evaluate(()=>{const r=n=>{const x=n.getBoundingClientRect();return {x:x.x,y:x.y,right:x.right,bottom:x.bottom}};return {state:window.prototypeState,poster:r(document.querySelector('.bsp-poster')),honor:r(document.querySelector('.prototype-honor')),title:r(document.querySelector('.bsp-d-title')),ids:r(document.querySelector('.bsp-d-ids')),overflow:document.documentElement.scrollWidth>innerWidth}}));}
await page.locator('input[aria-label="详细信息"]').check();
await page.locator('#dark').check();await page.locator('#failure').click();await page.screenshot({path:new URL('floating-failure.png',import.meta.url).pathname});
await page.locator('.prototype-feedback button').last().click();await page.locator('.prototype-tip-target').hover();await page.screenshot({path:new URL('hover-reason.png',import.meta.url).pathname});
await page.setViewportSize({width:390,height:1000});await page.screenshot({path:new URL('mobile.png',import.meta.url).pathname,fullPage:true});report.push(await page.evaluate(()=>({mobileOverflow:document.documentElement.scrollWidth>innerWidth})));
await writeFile(new URL('visual-report.json',import.meta.url),JSON.stringify({errors,report},null,2));console.log(JSON.stringify({errors,report}));await browser.close();
