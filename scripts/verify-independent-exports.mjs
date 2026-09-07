import assert from 'node:assert/strict';
import {browserRuntime,productionBundle,openFixture} from './browser-test-support.mjs';
const {chromium}=await browserRuntime();const browser=await chromium.launch({headless:true});
try {
 const {page,context,errors}=await openFixture(browser,await productionBundle());
 await page.getByRole('button',{name:'生成海报',exact:true}).click();
 await page.getByRole('button',{name:'复制海报',exact:true}).waitFor();
 assert.equal(await page.getByRole('button',{name:/组合复制|复制海报与文案/}).count(),0,'unsupported combined action is absent');
 for(const name of ['复制海报','复制文案','复制 Markdown','下载海报 PNG']) assert.equal(await page.getByRole('button',{name,exact:true}).isEnabled(),true);
 for(const name of ['复制文案','复制 Markdown','复制海报']) {
  await page.getByRole('button',{name,exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('.bsp-status')?.textContent?.includes('已复制'));
 }
 assert.equal(await page.evaluate(()=>window.fixture.copiedText.length),2);
 assert.deepEqual(await page.evaluate(()=>window.fixture.copiedTypes),[['image/png']]);
 await page.evaluate(()=>{window.fixture.clipboardFailed=true});
 await page.getByRole('button',{name:'复制海报',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('.bsp-status')?.textContent?.includes('海报复制失败'));
 assert.ok((await page.getByRole('status').innerText()).includes('下载'));
 await page.getByRole('button',{name:'复制文案',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('.bsp-status')?.textContent?.includes('文案复制失败'));
 assert.ok((await page.getByRole('status').innerText()).includes('手动复制'));
 const downloading=page.waitForEvent('download');await page.getByRole('button',{name:'下载海报 PNG',exact:true}).click();
 const download=await downloading;assert.ok(download.suggestedFilename().endsWith('.png'));
 assert.deepEqual(errors,[]);await context.close();console.log('PASS: four independent exports; PNG-only write, plain and Markdown copy, failures remain recoverable, download works');
}finally{await browser.close()}
