import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { browserRuntime, productionBundle, openFixture } from './browser-test-support.mjs';
const { chromium } = await browserRuntime();
const bundle = await productionBundle();
const out = process.env.BSP_EVIDENCE_DIR ?? '.scratch/bilibili-share-poster/usage-refinement/evidence/ticket06/panel';
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
  assert.ok(layout.download.right < layout.copy.left);
  assert.ok(Math.abs(layout.download.top-layout.copy.top)<1);
  await page.waitForTimeout(300);
  const compact = await page.evaluate(() => {
    const box = s => document.querySelector(s).getBoundingClientRect().toJSON();
    return {text:box('.bsp-text-content'),options:box('.bsp-options'),detail:box('.bsp-text-options'),actions:box('.bsp-actions'),preview:box('.bsp-preview-frame')};
  });
  assert.ok(compact.text.height < 170, 'short share text uses its natural height');
  assert.ok(Math.abs(compact.actions.top-compact.detail.bottom-20)<1, 'actions directly follow the text group');
  assert.ok(Math.abs((compact.options.top+compact.actions.bottom)/2-(compact.preview.top+compact.preview.bottom)/2)<1, 'right-side content is centered beside the poster');
  await detail.check();
  const expandedHeight = await page.getByLabel('分享文案预览',{exact:true}).evaluate(n=>n.getBoundingClientRect().height);
  assert.ok(expandedHeight > compact.text.height && expandedHeight <= 310);
  await detail.uncheck();
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

  // Results float without moving the panel or any export control.
  const boxes = () => page.evaluate(() => [...document.querySelectorAll('.bsp-panel,.bsp-actions button,.bsp-text-copy-actions button')].map(n=>n.getBoundingClientRect().toJSON()));
  await page.waitForTimeout(300);
  const beforeFeedback = await boxes();
  await plain.click();
  await page.getByRole('status').filter({hasText:'普通文案已复制'}).waitFor();
  assert.deepEqual(await boxes(), beforeFeedback);
  const feedbackStyle = await page.locator('.bsp-status').evaluate(n=>({position:getComputedStyle(n).position,transition:getComputedStyle(n).transitionDuration}));
  assert.equal(feedbackStyle.position,'fixed');
  assert.ok(feedbackStyle.transition.split(',').every(v=>parseFloat(v)<=0.12));
  await markdown.click();
  await page.getByRole('status').filter({hasText:'Markdown已复制'}).waitFor();
  await page.locator('.bsp-status.is-show').waitFor({state:'hidden',timeout:4500});
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.ok((await page.locator('.bsp-status').evaluate(n=>getComputedStyle(n).transitionDuration)).split(',').every(v=>parseFloat(v)===0));
  await page.emulateMedia({reducedMotion:'no-preference'});
  results.push({case:'floating-feedback-stable-layout-replacement-dismiss-reduced-motion',passed:true});

  // Failure feedback keeps the preview usable and exposes the appropriate fallback.
  await page.evaluate(()=>{window.fixture.clipboardFailed=true});
  await page.getByRole('button',{name:'复制海报',exact:true}).click();
  await page.getByRole('status').filter({hasText:'海报复制失败'}).waitFor();
  assert.match(await page.getByRole('status').filter({hasText:'海报复制失败'}).textContent(),/下载/);
  assert.equal(await page.locator('.bsp-poster').count(),1);
  await page.waitForTimeout(3100);
  assert.equal(await page.getByRole('status').filter({hasText:'海报复制失败'}).isVisible(),true);
  assert.deepEqual(await boxes(), beforeFeedback);
  await page.evaluate(()=>{window.fixture.clipboardFailed=false});
  results.push({case:'image-failure-download-recovery',passed:true});

  for (const width of [390,320]) {
    await page.setViewportSize({width,height:740});
    for(const control of [download,plain,markdown,detail,copy]) { await control.scrollIntoViewIfNeeded(); assert.equal(await control.isVisible(),true); }
    await copy.click();
    await page.getByRole('status').filter({hasText:'海报已复制'}).waitFor();
    await page.waitForTimeout(150);
    const overlaps = await page.locator('.bsp-status').evaluate(n=> {
      const a=n.getBoundingClientRect();
      return [...document.querySelectorAll('.bsp-panel button,.bsp-panel input,.bsp-panel a')].filter(c=> {
        const b=c.getBoundingClientRect();return a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
      }).map(c=>c.getAttribute('aria-label')||c.textContent);
    });
    assert.deepEqual(overlaps,[], 'floating feedback leaves key controls unobscured');
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
