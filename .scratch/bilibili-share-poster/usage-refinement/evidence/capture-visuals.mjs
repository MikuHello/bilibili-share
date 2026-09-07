import {chromium} from '/Users/mikuhello/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1050},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const reports=[];
try{for(const variant of ['A','B','C']){
 await page.goto('http://127.0.0.1:8771/prototype/?variant='+variant);await page.waitForLoadState('networkidle');await page.evaluate(()=>document.fonts.ready);
 await page.screenshot({path:new URL('variant-'+variant+'.png',import.meta.url).pathname,fullPage:true});
 reports.push(await page.evaluate(()=>({url:location.href,width:innerWidth,scrollWidth:document.documentElement.scrollWidth,images:[...document.images].map(i=>({src:i.getAttribute('src')?.slice(0,90),loaded:i.complete&&i.naturalWidth>0})),buttons:[...document.querySelectorAll('button')].map(b=>b.textContent.trim())})));
}await writeFile(new URL('visual-report.json',import.meta.url),JSON.stringify({errors,reports},null,2));console.log(JSON.stringify({errors,reports}));}finally{await browser.close();}
