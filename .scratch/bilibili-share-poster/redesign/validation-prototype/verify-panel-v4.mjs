import {chromium} from '/Users/mikuhello/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const out=new URL('evidence/panel-v4/',import.meta.url);await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:8768/?revision=4');await page.waitForLoadState('networkidle');
 assert.equal(await page.locator('details').count(),0);assert.ok(await page.locator('#detail').isVisible());assert.equal(await page.locator('input#markdown').count(),0);assert.ok(await page.locator('#copy-markdown').isVisible());assert.match(await page.locator('.text-options').innerText(),/详细信息/);assert.ok(await page.locator('#combined').isVisible());
 assert.match(await page.locator('.targets').innerText(),/标记当前分P/);assert.match(await page.locator('.targets').innerText(),/标记当前时间/);
 assert.ok(await page.locator('.preview-pane #download').isVisible());assert.equal((await page.locator('#download').innerText()).trim(),'');assert.equal(await page.locator('#download').getAttribute('aria-label'),'下载海报 PNG');
 assert.doesNotMatch(await page.locator('.panel').innerText(),/更多选项|带上画面|分享这个视频|预览与导出使用同一张海报|默认从视频开头/);
 await page.locator('.panel').blur();await page.screenshot({path:new URL('light.png',out).pathname});
 const preview=await page.locator('.text-preview').innerText();await page.locator('#copy-markdown').click();assert.match(await page.evaluate(()=>lastDemoCopy.payload),/^\[/);assert.equal(await page.locator('.text-preview').innerText(),preview);await page.locator('#copy-text').click();assert.equal(await page.evaluate(()=>lastDemoCopy.action),'copy-text');assert.doesNotMatch(await page.evaluate(()=>lastDemoCopy.payload),/^\[/);await page.locator('#detail').check();await page.locator('#copy-markdown').click();assert.match(await page.evaluate(()=>lastDemoCopy.payload),/- UP 主：/);assert.match(await page.locator('#text-body').innerText(),/UP 主/);await page.locator('#combined').click();assert.match(await page.locator('#status').innerText(),/接收方可能只粘贴其中一种/);
 await page.locator('#appearance').click();await page.locator('#appearance').blur();await page.screenshot({path:new URL('dark.png',out).pathname});
 for(const state of ['loading','updating','fallback','copyfailed','error','coverfailed']){
  await page.locator('#state').selectOption(state);const blocked=['loading','updating','error'].includes(state);
  for(const id of ['copy-poster','combined','download'])assert.equal(await page.locator('#'+id).isDisabled(),blocked||state==='coverfailed');
  assert.equal(await page.locator('#copy-text').isDisabled(),blocked);assert.equal(await page.locator('#copy-markdown').isDisabled(),blocked);
  if(state==='copyfailed')assert.match(await page.locator('#status').innerText(),/下载图标/);
  if(state==='coverfailed'){assert.match(await page.locator('#preview-message').innerText(),/封面暂时无法加载/);await page.locator('#copy-text').click();assert.match(await page.locator('#status').innerText(),/复制文案/);await page.screenshot({path:new URL('cover-failed.png',out).pathname});}
 }
 const before=await page.locator('#detail').isChecked();await page.locator('#retry').click();assert.ok(await page.locator('#copy-poster').isEnabled());assert.equal(await page.locator('#detail').isChecked(),before);
 await page.locator('#part').check();assert.equal(await page.locator('#time').isChecked(),false);await page.locator('#time').check();assert.equal(await page.locator('#part').isChecked(),true);await page.locator('#part').uncheck();assert.equal(await page.locator('#time').isChecked(),false);
 await page.keyboard.press('Escape');assert.ok(await page.locator('#backdrop').isHidden());assert.ok(await page.locator('#entry').evaluate(e=>e===document.activeElement));await page.locator('#entry').click();
 for(const width of [390,320]){
  await page.setViewportSize({width,height:844});await page.goto('http://127.0.0.1:8768/?revision=4');await page.waitForLoadState('networkidle');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.locator('.panel').blur();await page.screenshot({path:new URL('mobile-'+width+'-poster.png',out).pathname});
  for(const id of ['copy-text','copy-markdown','download']){const r=await page.locator('#'+id).boundingBox();assert.ok(r.x>=0&&r.x+r.width<=width);}await page.locator('#combined').scrollIntoViewIfNeeded();const box=await page.locator('#combined').boundingBox();assert.ok(box.x>=0&&box.x+box.width<=width);assert.ok(await page.locator('#detail').isVisible());await page.screenshot({path:new URL('mobile-'+width+'-actions.png',out).pathname});
 }
 assert.deepEqual(errors,[]);await writeFile(new URL('report.json',out),JSON.stringify({passed:true,browser:browser.version(),errors,checks:['detail label and independent Markdown copy','download centered below poster','two copy actions','6 states','cover-failure text/retry available and image actions disabled','part/time preserved semantics','Escape focus return','390/320 viewport and action access']},null,2));console.log('Panel interaction checks passed.');
}finally{await browser.close();}
