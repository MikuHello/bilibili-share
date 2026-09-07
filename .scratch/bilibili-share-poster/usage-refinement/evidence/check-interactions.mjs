import {chromium} from '/Users/mikuhello/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1440,height:1050}});const findings=[];
try{
await page.goto('http://127.0.0.1:8771/prototype/?variant=A');await page.waitForLoadState('networkidle');
await page.locator('.primary').scrollIntoViewIfNeeded();const before=await page.locator('.actions').boundingBox();await page.locator('.primary').click();const after=await page.locator('.actions').boundingBox();findings.push({toastNoLayoutShift:JSON.stringify(before)===JSON.stringify(after),toast:await page.locator('#toast').innerText()});
await page.locator('#theme').click();await page.screenshot({path:new URL('dark.png',import.meta.url).pathname,fullPage:true});
findings.push(await page.locator('#panel-title').evaluate(e=>({darkTitleColor:getComputedStyle(e).color,panelBackground:getComputedStyle(e.closest('.panel')).backgroundColor})));
await page.keyboard.press('ArrowRight');findings.push({keyboardVariant:await page.locator('#variant-label').innerText(),url:page.url()});
const title=await page.locator('.editorial').innerText();await page.locator('#part').check();await page.locator('#time').check();findings.push({markerOnlyTarget:await page.locator('.editorial').innerText()===title,target:await page.locator('#copylink').innerText()});
for(const variant of ['A','B','C']) {await page.goto('http://127.0.0.1:8771/prototype/?variant='+variant);await page.waitForLoadState('networkidle');findings.push(await page.locator('#poster').evaluate(e=>({variant:e.className,ratio:e.clientWidth/e.clientHeight,childrenFit:[...e.children].every(c=>c.getBoundingClientRect().bottom<=e.getBoundingClientRect().bottom+1)})));}
await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:8771/prototype/?variant=A');await page.waitForLoadState('networkidle');await page.screenshot({path:new URL('mobile.png',import.meta.url).pathname,fullPage:true});findings.push(await page.evaluate(()=>({mobileWidth:innerWidth,scrollWidth:document.documentElement.scrollWidth})));
await page.locator('.download').scrollIntoViewIfNeeded();findings.push({downloadClickable:await page.locator('.download').isVisible()});await page.locator('.download').click();
await writeFile(new URL('interaction-report.json',import.meta.url),JSON.stringify(findings,null,2));console.log(JSON.stringify(findings));
}finally{await browser.close()}
