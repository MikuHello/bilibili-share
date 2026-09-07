import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { browserRuntime, productionBundle, openFixture } from './browser-test-support.mjs';
const { chromium } = await browserRuntime();
const bundle = await productionBundle();
const browser = await chromium.launch({headless:true});
const out = process.env.BSP_EVIDENCE_DIR ?? '.scratch/bilibili-share-poster/usage-refinement/clipboard-isolation/evidence';
await mkdir(out,{recursive:true});
const results=[];
try {
  const {page,context,errors}=await openFixture(browser,bundle,{realClipboard:true,context:{permissions:['clipboard-read','clipboard-write']}});
  await page.evaluate(()=> {
    const nativeWrite=navigator.clipboard.writeText.bind(navigator.clipboard);
    // External boundaries: the extension cleans links; the userscript API writes independently.
    window.GM_setClipboard=(text,_type,done)=> { nativeWrite(text).then(done); };
    navigator.clipboard.writeText=text=>nativeWrite(text.match(/https:\/\/www\.bilibili\.com\/video\/[^\s)]+/)?.[0]??text);
  });
  await page.getByRole('button',{name:'生成海报',exact:true}).click();
  await page.getByRole('button',{name:'复制文案',exact:true}).waitFor();
  for (const detail of [false,true]) {
    await page.getByRole('checkbox',{name:'详细信息',exact:true}).setChecked(detail);
    for(const markers of [false,true,false]) {
      const part=page.getByRole('button',{name:'标记当前分P',exact:true});
      if ((await part.getAttribute('aria-pressed'))!==String(markers)) await part.click();
      if(markers) await page.getByRole('button',{name:'标记当前时间',exact:true}).click();
      const plain=page.getByRole('button',{name:'复制文案',exact:true});
      await plain.click();
      await page.getByRole('status').filter({hasText:'普通文案已复制'}).waitFor();
      const expected=await page.getByLabel('分享文案预览',{exact:true}).textContent();
      const text=await page.evaluate(()=>navigator.clipboard.readText());
      assert.equal(text,expected,'plain clipboard must preserve title and uploader despite the page link cleaner');
      if(markers) assert.match(text,/\?p=2&t=83$/);
      else assert.match(text,/BV1TXoWBsEGc\/$/);
      await page.getByRole('button',{name:'复制 Markdown',exact:true}).click();
      await page.getByRole('status').filter({hasText:'Markdown已复制'}).waitFor();
      const markdown=await page.evaluate(()=>navigator.clipboard.readText());
      assert.match(markdown,/35min/);assert.match(markdown,/妮卡的房间NiCalm/);
      assert.ok(markdown.includes(detail?'**':'['));
      results.push({detail,markers,plain:text,markdown});
    }
  }
  assert.deepEqual(errors,[]);
  await writeFile(`${out}/report.json`,JSON.stringify({results},null,2));
  await context.close();
  console.log('PASS: page link cleaning cannot discard plain or Markdown content, with details and markers on/off');
} finally {await browser.close();}
