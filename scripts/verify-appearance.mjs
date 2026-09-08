import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { browserRuntime, productionBundle, openFixture } from './browser-test-support.mjs';

const { chromium } = await browserRuntime();
const browser = await chromium.launch({ headless: true });
try {
  const output = process.env.BSP_EVIDENCE_DIR ?? 'artifacts/browser/appearance';
  await mkdir(output, {recursive:true});
  const bundle = await productionBundle();
  const {page,context,errors} = await openFixture(browser, bundle);
  await page.addStyleTag({content:'h2,h3,p{color:#18191c}'});
  await page.evaluate(() => { document.documentElement.classList.add('dark'); document.body.style.background='rgb(28,30,34)'; });
  await page.waitForFunction(()=>document.querySelector('#bsp-entry.bsp-entry-dark'));
  await page.locator('#bsp-entry').screenshot({path:`${output}/entry-dark.png`});
  await page.getByRole('button',{name:'分享海报',exact:true}).click();
  await page.getByRole('button',{name:'复制文案',exact:true}).waitFor();
  const dialog = page.getByRole('dialog');
  assert.equal(await dialog.evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(36, 38, 43)', 'panel initializes from actual page dark marker');
  for (const selector of ['#bsp-dialog-title','.bsp-section-heading h3','.bsp-text-content']) {
    assert.equal(await page.locator(selector).evaluate(e=>getComputedStyle(e).color),'rgb(237, 240, 243)', `dark readable text despite host rule: ${selector}`);
  }
  const palette = () => dialog.evaluate(e=>getComputedStyle(e).backgroundColor);
  const expectPalette = async expected => {
    await page.waitForFunction(expected => getComputedStyle(document.querySelector('.bsp-panel')).backgroundColor === expected, expected);
  };
  const entryMetrics = await page.locator('#bsp-entry').evaluate(e=>({height:e.getBoundingClientRect().height,fontSize:getComputedStyle(e).fontSize,lineHeight:getComputedStyle(e).lineHeight,icon:e.querySelector('svg').getBoundingClientRect().width}));
  assert.deepEqual(entryMetrics,{height:28,fontSize:'13px',lineHeight:'28px',icon:28},'entry matches observed official toolbar dimensions');
  await page.waitForFunction(()=>document.querySelector('[aria-label="复制海报"]')?.disabled===false);
  await page.evaluate(()=>{window.encodes=0;const encode=HTMLCanvasElement.prototype.toDataURL;HTMLCanvasElement.prototype.toDataURL=function(...args){if(this.width===1080&&this.height===1440)window.encodes++;return encode.apply(this,args);};});
  await page.getByRole('button',{name:'复制海报',exact:true}).click();
  await page.waitForFunction(()=>window.fixture.copiedTypes.length===1);
  const poster = await page.locator('.bsp-poster').evaluate(e => ({html:e.innerHTML,background:getComputedStyle(e).backgroundColor}));
  assert.equal(await page.locator('#bsp-entry').evaluate(e=>getComputedStyle(e).borderTopWidth),'0px');
  await page.evaluate(() => {document.documentElement.classList.remove('dark'); document.body.style.background='transparent';});
  await page.evaluate(() => new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  assert.equal(await palette(),'rgb(36, 38, 43)','unknown retains last successful dark');
  await page.evaluate(() => { document.body.style.background='white'; });
  await expectPalette('rgb(255, 255, 255)');
  await dialog.screenshot({path:`${output}/dialog-light.png`,animations:'disabled'});
  await page.evaluate(() => { document.body.style.background='oklab(0.236945 -0.00128311 -0.00790365)'; });
  await expectPalette('rgb(36, 38, 43)');
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('global.themeChange',{detail:'light'})));
  await page.evaluate(() => new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  assert.equal(await palette(),'rgb(36, 38, 43)','event payload does not override page');
  assert.deepEqual(await page.locator('.bsp-poster').evaluate(e=>({html:e.innerHTML,background:getComputedStyle(e).backgroundColor})),poster,'poster is fixed through appearance changes');
  await page.getByRole('button',{name:'复制海报',exact:true}).click();
  await page.waitForFunction(()=>window.fixture.copiedTypes.length===2);
  assert.equal(await page.evaluate(()=>window.encodes),1,'appearance changes reuse same PNG');
  for (const width of [320,390]) {
    await page.setViewportSize({width,height:900});
    assert.equal(await dialog.evaluate(e=>e.scrollWidth<=e.clientWidth),true,'narrow dialog has no horizontal overflow');
    await page.getByRole('button',{name:'复制海报',exact:true}).focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    assert.equal(await page.getByRole('button',{name:'复制海报',exact:true}).evaluate(e=>getComputedStyle(e).outlineStyle),'solid');
    await dialog.screenshot({path:`${output}/dark-${width}.png`,animations:'disabled'});
  }
  await page.setViewportSize({width:1280,height:900});
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>document.activeElement?.id==='bsp-entry');
  await page.evaluate(()=>{document.body.style.background='white';});
  await page.waitForFunction(()=>!document.querySelector('#bsp-entry.bsp-entry-dark'));
  await page.locator('#bsp-entry').screenshot({path:`${output}/entry-light.png`});
  await page.evaluate(()=>{document.body.style.background='rgb(28,30,34)';});
  await page.evaluate(() => { document.querySelector('#bsp-entry').remove(); });
  await page.waitForFunction(()=>document.querySelector('#bsp-entry.bsp-entry-dark'));
  assert.equal(await page.locator('.video-share-wrap').count(),1);
  await page.evaluate(()=>window.openFixturePanel());
  await page.getByRole('button',{name:'复制文案',exact:true}).waitFor();
  await expectPalette('rgb(36, 38, 43)');
  await dialog.screenshot({path:`${output}/dialog-dark.png`,animations:'disabled'});
  assert.deepEqual(errors, []);
  await context.close();
  const firstUnknown = await openFixture(browser, 'document.body.style.background="transparent";'+bundle, {context:{colorScheme:'dark'}});
  await firstUnknown.page.evaluate(()=>window.openFixturePanel());
  await firstUnknown.page.getByRole('button',{name:'复制文案',exact:true}).waitFor();
  assert.equal(await firstUnknown.page.getByRole('dialog').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(255, 255, 255)','first unknown is light despite system dark');
  assert.deepEqual(firstUnknown.errors,[]);
  await firstUnknown.context.close();
  await writeFile(`${output}/browser-verification.md`, `# Ticket 04 controlled browser verification\n\nBrowser: ${browser.version()}. Production bundle with controlled page/GM ports.\n\nPASS: initial dark, live light/dark, unknown retains last known, first unknown light despite system dark, modern oklab background, event payload ignored, poster DOM/palette and PNG cache unchanged, host h2/h3 interference corrected, 320/390px no dialog horizontal overflow, keyboard focus outline and Escape return, 28px entry/icon with 13px/28px text, native borderless entry remount, official share retained and menu fallback.\n\nThis script does not operate actual BewlyCat settings or validate userscript-manager installation. Live dark-page before/after candidate CSS observations are recorded separately in live-observations.md.\n`);
  console.log('PASS appearance, fixed poster, native entry and fallback scenarios');
} finally { await browser.close(); }
