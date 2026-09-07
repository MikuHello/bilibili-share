import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { browserRuntime, productionBundle, openFixture } from './browser-test-support.mjs';
const { chromium } = await browserRuntime();
const browser = await chromium.launch({ headless: true });
const bundle = await productionBundle();
const backgrounds = [];
const covers = '.scratch/bilibili-share-poster/usage-refinement/evidence/ticket02/covers';
const output = process.env.BSP_EVIDENCE_DIR ?? '.scratch/bilibili-share-poster/usage-refinement/evidence/ticket02';
await mkdir(output, { recursive:true });
const results = [];
async function verifyPoster(name, overrides) {
  const { page, context, errors } = await openFixture(browser, bundle, overrides);
  try {
    await page.getByRole('button',{name:'生成海报',exact:true}).click();
    await page.getByRole('article').waitFor();
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth), `${name}: viewport contained`);
    if(overrides.markers) {
      await page.getByRole('button',{name:'标记当前时间',exact:true}).click();
      await page.waitForFunction(()=>!document.querySelector('[aria-label="复制海报"]').disabled);
    }
    const metrics = await page.getByRole('article').evaluate(poster => {
      const scale=poster.getBoundingClientRect().width/1080;
      const r=node=> {const b=node.getBoundingClientRect();return {x:b.x/scale,y:b.y/scale,width:b.width/scale,height:b.height/scale,right:b.right/scale,bottom:b.bottom/scale};};
      const stats=[...poster.querySelectorAll('.bsp-d-stat')];
      return {poster:r(poster),cover:r(poster.querySelector('.bsp-d-cover')),title:r(poster.querySelector('h4')),titleText:poster.querySelector('h4').textContent,footer:r(poster.querySelector('footer')),caption:r(poster.querySelector(".bsp-d-qr-caption")),qrImage:r(poster.querySelector(".bsp-d-qr-image")),qr:r(poster.querySelector('.bsp-d-qr')),link:r(poster.querySelector('.bsp-d-link')),stats:stats.map(r),statGaps:stats.slice(1).map((n,i)=>r(n).x-r(stats[i].lastElementChild).right),statFonts:stats.map(n=>getComputedStyle(n.lastElementChild).fontSize),icons:stats.map(n=>r(n.firstElementChild)),statOverflow:stats.some(n=>n.scrollWidth>n.clientWidth+1 || n.lastElementChild.scrollWidth>n.lastElementChild.clientWidth+1),name:poster.querySelector('.bsp-d-name').textContent};
    });
    assert.ok(metrics.title.height<=300, `${name}: title limited`);
    assert.ok(metrics.footer.y-metrics.title.bottom<34, `${name}: divider follows title`);
    assert.ok(metrics.stats.every(s=>Math.abs(s.y-metrics.stats[0].y)<1), `${name}: one stats row`);
    assert.ok(metrics.icons.every(s=>Math.abs(s.width-54)<.1 && Math.abs(s.height-54)<.1), `${name}: fixed icons`);
    assert.ok(metrics.qr.y >= metrics.footer.y && metrics.qr.bottom <= metrics.footer.bottom+1, `${name}: QR within footer`);
    assert.ok(metrics.stats.at(-1).right < metrics.qr.x, `${name}: stats clear QR`);
    assert.ok(Math.max(...metrics.statGaps)-Math.min(...metrics.statGaps)<.15, `${name}: equal content gaps`);
    assert.ok(metrics.statGaps.every(g=>g>=16), `${name}: minimum group spacing`);
    assert.equal(new Set(metrics.statFonts).size,1, `${name}: uniform number size`);
    assert.ok(Math.abs(metrics.caption.y+metrics.caption.height/2-metrics.stats[0].y-metrics.stats[0].height/2)<.15, `${name}: caption aligned with statistics`);
    assert.ok(Math.abs(metrics.caption.y-metrics.qrImage.bottom)<.15, `${name}: caption close to QR`);
    const qrAppearance = await page.getByRole('article').evaluate(async poster => {
      const qr=poster.querySelector('.bsp-d-qr-image');await qr.decode();
      const c=document.createElement('canvas');c.width=qr.naturalWidth;c.height=qr.naturalHeight;
      const ctx=c.getContext('2d');ctx.drawImage(qr,0,0);
      return {corner:Array.from(ctx.getImageData(0,0,1,1).data),frame:getComputedStyle(qr.parentElement).backgroundColor};
    });
    assert.equal(qrAppearance.corner[3],0, `${name}: QR quiet zone transparent`);
    assert.equal(qrAppearance.frame,'rgba(0, 0, 0, 0)', `${name}: no white tile`);
    assert.ok(!metrics.statOverflow, `${name}: values contained`);
    assert.ok(metrics.link.bottom<=metrics.poster.bottom+1, `${name}: full link contained`);
    await page.evaluate(() => { navigator.clipboard.write=async items=>{ const blob=await items[0].getType('image/png'); window.exportedPng=await new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.readAsDataURL(blob);}); }; });
    await page.getByRole('button',{name:'复制海报',exact:true}).click();
    await page.waitForFunction(()=>window.exportedPng);
    const path=`${output}/${name}.png`;
    await writeFile(path,Buffer.from((await page.evaluate(()=>window.exportedPng)).split(',')[1],'base64'));
    const decoded=JSON.parse(execFileSync('swift',['scripts/verify-poster-qr.swift',path],{encoding:'utf8'}).trim());
    assert.equal(decoded.target,'https://www.bilibili.com/video/BV1TXoWBsEGc/'+(overrides.markers?'?p=2&t=123456789':''));
    assert.deepEqual(errors,[]);
    results.push({name,metrics,decoded});
  } finally { await context.close(); }
}

async function captureBackground(color) {
  const coverBase64 = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"><rect width="100%" height="100%" fill="${color}"/></svg>`).toString('base64');
  const { page, context } = await openFixture(browser, bundle, { coverBase64, coverMime: 'image/svg+xml' });
  try {
    await page.getByRole('button', { name:'生成海报', exact:true }).click();
    await page.getByRole('article').waitFor();
    await page.evaluate(() => { navigator.clipboard.write = async items => {
      const blob = await items[0].getType('image/png');
      const bitmap = await createImageBitmap(blob); const c = document.createElement('canvas'); c.width=1080;c.height=1440;
      const ctx=c.getContext('2d');ctx.drawImage(bitmap,0,0);window.backgroundPixel=Array.from(ctx.getImageData(10,800,1,1).data);bitmap.close();
    }; });
    await page.getByRole('button', { name:'复制海报', exact:true }).click();
    await page.waitForFunction(() => window.backgroundPixel);
    backgrounds.push(await page.evaluate(() => window.backgroundPixel));
  } finally { await context.close(); }
}

try {
  const { page, context } = await openFixture(browser, bundle, { title: '把身体作为方法' });
  try {
    await page.getByRole('button', { name: '生成海报', exact: true }).click();
    await page.getByRole('article').waitFor();
    const geometry = await page.getByRole('article').evaluate(poster => {
      const rect = node => { const r = node.getBoundingClientRect(); return { x:r.x, y:r.y, width:r.width, height:r.height, bottom:r.bottom }; };
      return { ids:rect(poster.querySelector('.bsp-d-ids')), cover:rect(poster.querySelector('img[alt="原视频完整封面"]')), title:rect(poster.querySelector('h4')), footer:rect(poster.querySelector('footer')), scale:poster.getBoundingClientRect().width/1080 };
    });
    assert.ok(geometry.ids.bottom < geometry.cover.y, 'BV/av should be above the cover');
    assert.ok((geometry.footer.y - geometry.title.bottom)/geometry.scale < 40, 'divider follows the short title');
  } finally { await context.close(); }
  await verifyPoster('screenshot-stats', {stats:{view:7969,like:170,coin:34,favorite:313}});
  await verifyPoster('extreme-stats', { title:'极端统计', uploader:'这是非常长的创作者名字'.repeat(12), stats:{view:999999999999999,like:999999999999999,coin:999999999999999,favorite:999999999999999} });
  const titles={short:'把身体作为方法',normal:'35min 正念冥想｜把身体作为方法｜从内耗到感受｜此时此地此身｜聆听身体｜回归当下',long:'从清晨到深夜，重新认识身体与注意力：一段关于正念、日常生活、城市漫步与内心安定的完整记录，尝试在复杂的信息里找回自己的节奏。',extreme:'超长标题压力样例：'+'在日常生活中重新发现身体、空间与时间的关系，'.repeat(12)};
  for (const shape of ['wide','square','portrait']) for (const [name,title] of Object.entries(titles)) {
    let coverOverrides={};
    if(shape!=='wide') {
      const w=shape==='square'?600:400,h=shape==='square'?600:800;
      const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="#94462e"/><circle cx="${w*.6}" cy="${h*.3}" r="${w*.32}" fill="#e9bd70"/><path d="M0 ${h} L0 ${h*.65} L${w*.4} ${h*.5} L${w} ${h} Z" fill="#433139"/><rect x="2" y="2" width="${w-4}" height="${h-4}" fill="none" stroke="white" stroke-width="4"/></svg>`;
      coverOverrides={coverBase64:Buffer.from(svg).toString('base64'),coverMime:'image/svg+xml'};
    }
    await verifyPoster(`${shape}-${name}`,{title,...coverOverrides});
  }
  await verifyPoster('unit-boundaries',{title:titles.long,stats:{view:99999999,like:999999999999,coin:Number.MAX_VALUE,favorite:99999999999}});
  await verifyPoster('missing-and-zero',{stats:{view:0,like:null,coin:null,favorite:9999}});
  await verifyPoster('long-target',{markers:true,time:123456789,title:titles.extreme});
  for(const source of JSON.parse(await readFile(`${covers}/sources.json`,'utf8'))) {
    if(source.error) throw Error(source.error);
    if(source.excluded) continue;
    await verifyPoster(`real-${source.bvid}`,{title:source.title,coverBase64:(await readFile(`${covers}/${source.bvid}.jpg`)).toString('base64')});
  }
  for (const width of [320,390]) {
    await verifyPoster(`mobile-${width}`, {context:{viewport:{width,height:900}},title:titles.extreme,stats:{view:7969,like:170,coin:34,favorite:313}});
  }
  await verifyPoster('equal-stats',{stats:{view:8888,like:8888,coin:8888,favorite:8888}});
  await verifyPoster('mixed-stats',{stats:{view:0,like:12000,coin:9999,favorite:null}});
  const actualCover = await readFile('.scratch/bilibili-share-poster/usage-refinement/polish/covers/BV1QGbD6MEDg.jpg');
  for (const markers of [false,true]) await verifyPoster(`real-user-${markers?'long':'default'}`, {coverBase64:actualCover.toString('base64'),title:'deepseek harness插件：dsh-smooth-stream无级丝滑流式渲染',uploader:'嗑唠的香农',stats:{view:7969,like:170,coin:34,favorite:313},markers,time:123456789});
  for (const [name,fill] of [['dark','#000'],['light','#fff'],['boundary','url(#stripes)']]) {
    const coverBase64=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"><defs><pattern id="stripes" width="80" height="80" patternUnits="userSpaceOnUse"><rect width="40" height="80" fill="black"/><rect x="40" width="40" height="80" fill="white"/></pattern></defs><rect width="100%" height="100%" fill="${fill}"/></svg>`).toString('base64');
    await verifyPoster(`contrast-${name}`,{coverBase64,coverMime:'image/svg+xml',markers:true,time:123456789,title:titles.long});
  }
  await captureBackground('#ac3220');
  await captureBackground('#2045ac');
  assert.ok(backgrounds[0].some((value,index) => Math.abs(value-backgrounds[1][index]) > 25), 'exported atmosphere changes with the cover');
} finally { await writeFile(`${output}/report.json`,JSON.stringify({results,backgrounds},null,2)); await browser.close(); }
