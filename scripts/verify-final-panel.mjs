import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { browserRuntime, productionBundle, openFixture } from './browser-test-support.mjs';
const { chromium } = await browserRuntime();
const bundle = await productionBundle();
const out = process.env.BSP_EVIDENCE_DIR ?? '.scratch/bilibili-share-poster/usage-refinement/evidence/ticket05/panel';
await mkdir(out,{recursive:true});
const browser = await chromium.launch({headless:true});
const results = [];
try {
  // First tracer: opening exposes the approved named dialog and direct actions.
  const {page,context,errors} = await openFixture(browser,bundle);
  await page.getByRole('button',{name:'生成海报',exact:true}).click();
  const dialog = page.getByRole('dialog',{name:'分享海报',exact:true});
  await dialog.waitFor({timeout:5000});
  await page.getByRole('button',{name:'复制海报',exact:true}).waitFor();
  const download = page.getByRole('button',{name:'下载海报 PNG',exact:true});
  const copy = page.getByRole('button',{name:'复制海报',exact:true});
  const plain = page.getByRole('button',{name:'复制文案',exact:true});
  const markdown = page.getByRole('button',{name:'复制 Markdown',exact:true});
  const detail = page.getByRole('checkbox',{name:'详细信息',exact:true});
  for (const control of [download,copy,plain,markdown,detail]) await control.waitFor();
  assert.equal(await dialog.getByText('BILIBILI SHARE',{exact:true}).count(),0);
  const layout = await page.evaluate(() => {
    const rect = selector => document.querySelector(selector).getBoundingClientRect().toJSON();
    const byName = name => [...document.querySelectorAll('button')].find(n=>n.getAttribute('aria-label')===name||n.textContent===name).getBoundingClientRect().toJSON();
    return {panel:rect('.bsp-panel'),preview:rect('.bsp-preview-frame'),download:byName('下载海报 PNG'),copy:byName('复制海报'),heading:rect('#bsp-dialog-title'),headingSize:getComputedStyle(document.querySelector('#bsp-dialog-title')).fontSize};
  });
  assert.equal(layout.headingSize,'16px');
  assert.ok(Math.abs(layout.heading.x+layout.heading.width/2-(layout.panel.x+layout.panel.width/2))<1);
  assert.ok(layout.download.top>layout.preview.bottom);
  assert.ok(Math.abs(layout.download.x+layout.download.width/2-(layout.preview.x+layout.preview.width/2))<1);
  await page.screenshot({animations:'disabled',path:`${out}/desktop-light.png`});
  await dialog.screenshot({animations:'disabled',path:`${out}/dialog-light.png`});
  results.push({case:'desktop-layout',layout});
  await page.locator('.bsp-backdrop').evaluate(n=>n.classList.add('bsp-appearance-dark'));
  await page.screenshot({animations:'disabled',path:`${out}/desktop-dark-css.png`});
  await dialog.screenshot({animations:'disabled',path:`${out}/dialog-dark-css.png`});
  await page.locator('.bsp-backdrop').evaluate(n=>n.classList.remove('bsp-appearance-dark'));

  // Focus stays inside the dialog, then all close paths return to the entry.
  await dialog.focus();
  await page.keyboard.press('Shift+Tab');
  assert.equal(await copy.evaluate(n=>document.activeElement===n),true);
  await page.keyboard.press('Tab');
  assert.equal(await page.getByRole('button',{name:'关闭分享面板'}).evaluate(n=>document.activeElement===n),true);
  for(let index=0;index<14;index++) { await page.keyboard.press('Tab'); assert.equal(await dialog.evaluate(n=>n.contains(document.activeElement)),true); }
  for (const close of ['escape','button','backdrop']) {
    if(close==='escape') await page.keyboard.press('Escape');
    else if(close==='button') await page.getByRole('button',{name:'关闭分享面板'}).click();
    else await page.mouse.click(2,2);
    await dialog.waitFor({state:'detached'});
    assert.equal(await page.getByRole('button',{name:'生成海报',exact:true}).evaluate(n=>document.activeElement===n),true);
    await page.getByRole('button',{name:'生成海报',exact:true}).click();
    await copy.waitFor();
  }
  results.push({case:'keyboard-and-three-close-paths',passed:true});

  // Failure feedback keeps the preview usable and exposes the appropriate fallback.
  await page.evaluate(()=>{window.fixture.clipboardFailed=true});
  await page.getByRole('button',{name:'复制海报',exact:true}).click();
  await page.getByRole('status').filter({hasText:'海报复制失败'}).waitFor();
  assert.match(await page.getByRole('status').filter({hasText:'海报复制失败'}).textContent(),/下载/);
  assert.equal(await page.locator('.bsp-poster').count(),1);
  await page.evaluate(()=>{window.fixture.clipboardFailed=false});
  results.push({case:'image-failure-download-recovery',passed:true});

  for (const width of [390,320]) {
    await page.setViewportSize({width,height:740});
    for(const control of [download,plain,markdown,detail,copy]) { await control.scrollIntoViewIfNeeded(); assert.equal(await control.isVisible(),true); }
    await copy.click();
    assert.equal(await page.evaluate(()=>document.querySelector('.bsp-panel').scrollWidth<=document.querySelector('.bsp-panel').clientWidth+1),true);
    await page.screenshot({animations:'disabled',path:`${out}/narrow-${width}-actions.png`});
    await download.scrollIntoViewIfNeeded();
    await page.screenshot({animations:'disabled',path:`${out}/narrow-${width}-preview.png`});
    results.push({case:`narrow-${width}`,passed:true});
  }
  assert.deepEqual(errors,[]);await context.close();

  const partial = await openFixture(browser,bundle,{coverFailed:true});
  await partial.page.getByRole('button',{name:'生成海报',exact:true}).click();
  await partial.page.getByText('封面暂时无法加载',{exact:true}).waitFor();
  assert.equal(await partial.page.getByRole('button',{name:'复制文案',exact:true}).isEnabled(),true);
  assert.equal(await partial.page.getByRole('button',{name:'下载海报 PNG',exact:true}).isEnabled(),false);
  await partial.page.screenshot({animations:'disabled',path:`${out}/cover-failed.png`});
  assert.deepEqual(partial.errors,[]);await partial.context.close();

  // Real Chromium clipboard writes use click gestures; only this known fixture is read.
  const real = await openFixture(browser,bundle,{realClipboard:true,context:{permissions:['clipboard-read','clipboard-write']}});
  await real.page.getByRole('button',{name:'生成海报',exact:true}).click();
  const realCopy=real.page.getByRole('button',{name:'复制海报',exact:true});await realCopy.waitFor();
  const knownPlain = await real.page.getByLabel('分享文案预览',{exact:true}).textContent();
  await real.page.getByRole('button',{name:'复制文案',exact:true}).click();
  await real.page.getByRole('status').filter({hasText:'普通文案已复制'}).waitFor();
  assert.equal(await real.page.evaluate(()=>navigator.clipboard.readText()),knownPlain);
  await real.page.getByRole('button',{name:'复制 Markdown',exact:true}).click();
  await real.page.getByRole('status').filter({hasText:'Markdown已复制'}).waitFor();
  assert.match(await real.page.evaluate(()=>navigator.clipboard.readText()),/^\[/);
  assert.equal(await real.page.getByLabel('分享文案预览',{exact:true}).textContent(),knownPlain);
  await realCopy.click();
  await real.page.getByRole('status').filter({hasText:'海报已复制'}).waitFor();
  const png = await real.page.evaluate(async()=> { const item=(await navigator.clipboard.read())[0]; const blob=await item.getType('image/png'); const img=await createImageBitmap(blob);return {width:img.width,height:img.height,size:blob.size}; });
  assert.deepEqual([png.width,png.height],[1080,1440]);
  const [downloaded]=await Promise.all([real.page.waitForEvent('download'),real.page.getByRole('button',{name:'下载海报 PNG',exact:true}).click()]);
  await downloaded.saveAs(`${out}/download.png`);const bytes=await readFile(`${out}/download.png`);
  assert.equal(bytes.readUInt32BE(16),1080);assert.equal(bytes.readUInt32BE(20),1440);
  await real.page.keyboard.press('Escape');
  await real.page.getByRole('dialog').waitFor({state:'detached'});
  await real.page.evaluate(()=>{const receiver=document.createElement('div');receiver.contentEditable='true';receiver.id='fixture-receiver';receiver.setAttribute('aria-label','受控富文本接收区');receiver.style.cssText='background:white;min-height:100px';document.body.append(receiver);});
  const receiver=real.page.getByLabel('受控富文本接收区');await receiver.focus();
  await real.page.keyboard.press(process.platform==='darwin'?'Meta+V':'Control+V');
  await receiver.locator('img').waitFor();
  assert.equal((await receiver.textContent()).trim(), "");
  const pasted=await receiver.locator('img').evaluate(async n=>{await n.decode();return {width:n.naturalWidth,height:n.naturalHeight}});
  assert.deepEqual([pasted.width,pasted.height],[1080,1440]);
  results.push({case:'real-user-gesture-clipboard-download',png,types:["image/png"],downloadName:downloaded.suggestedFilename(),sha256:createHash('sha256').update(bytes).digest('hex'),receiver:'Chromium contenteditable',pasted});
  assert.deepEqual(real.errors,[]);await real.context.close();
  await writeFile(`${out}/report.json`,JSON.stringify({browser:browser.version(),results},null,2));
  console.log('Final panel layouts, keyboard, recovery, real clipboard representations and PNG download passed.');
} finally {await browser.close();}
