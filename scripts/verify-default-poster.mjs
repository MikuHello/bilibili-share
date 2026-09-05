import { build } from 'esbuild';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { browserRuntime } from './browser-test-support.mjs';

const { chromium } = await browserRuntime();
const bundle = await build({ stdin: { contents: `import {buildDefaultPoster} from './src/domain'; import {createPoster,exportPosterPng} from './src/ui/posters'; import {STYLES} from './src/ui/styles'; const style=document.createElement('style'); style.textContent=STYLES;document.head.append(style); window.render = async (snapshot,target) => { const poster = await createPoster(buildDefaultPoster(snapshot,target)); document.body.replaceChildren(poster); return exportPosterPng(poster); };`, resolveDir: process.cwd() }, bundle: true, write: false, format: 'iife' });
const out = '.scratch/bilibili-share-poster/redesign/acceptance/ticket02';
await mkdir(out, { recursive: true });
const cover = 'data:image/jpeg;base64,' + (await readFile('.scratch/bilibili-share-poster/redesign/validation-prototype/assets/cover.jpg')).toString('base64');
const sample = { bvid: 'BV1TXoWBsEGc', aid: 116448123027614, title: '35min 正念冥想｜把身体作为方法｜从内耗到感受｜此时此地此身｜聆听身体｜回归当下', uploader: '妮卡的房间NiCalm', coverDataUrl: cover, coverUnavailable: false, partNumber: 2, partTitle: '第二集', partIdentified: true, playbackSeconds: 83, wasPlaying: false, stats: { views: 178000, likes: 2662, coins: null, favorites: 6656 } };
const target = 'https://www.bilibili.com/video/BV1TXoWBsEGc/';
const cases = [
  { name: 'original' },
  { name: 'short', title: '正念冥想' },
  { name: 'long', title: '这是用于检查浏览器实际排版的长标题 Mixed English 文本 1234567890 '.repeat(8), uploader: '非常长的昵称与 Mixed English Name '.repeat(6) },
  { name: 'unbroken', title: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.repeat(12), uploader: 'LongUnbrokenUploaderName'.repeat(8) },
  { name: 'longlink', target: target + '?p=2147483647&t=9007199254740991' },
  ...['portrait', 'square'].map(name => ({ name })),
];
const browser = await chromium.launch({ headless: true });
const report = [];
try {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1440 } });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.setContent('<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"></head><body style="margin:0"></body></html>');
  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  for (const item of cases) {
    const data = { ...sample, ...item };
    if (['portrait','square'].includes(item.name)) {
      const width = item.name === 'portrait' ? 300 : 600;
      data.coverDataUrl = await page.evaluate(width => { const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = 600; const ctx = canvas.getContext('2d'); ctx.fillStyle='#cc6666'; ctx.fillRect(0,0,width,600); ctx.fillStyle='#fff'; ctx.fillRect(0,0,12,600); ctx.fillRect(width-12,0,12,600); ctx.fillRect(0,0,width,12);ctx.fillRect(0,588,width,12); return canvas.toDataURL(); }, width);
    }
    const dataUrl = await page.evaluate(({ data, target }) => window.render(data, target), { data, target: item.target ?? target });
    await writeFile(`${out}/${item.name}.png`, Buffer.from(dataUrl.split(',')[1], 'base64'));
    const observed = await page.evaluate(async () => {
      const rect = selector => document.querySelector(selector).getBoundingClientRect().toJSON();
      const title = document.querySelector('.bsp-d-title'), name = document.querySelector('.bsp-d-name'), link = document.querySelector('.bsp-d-link');
      const qr = document.querySelector('.bsp-d-qr-image');
      const qrImage = await createImageBitmap(qr);
      let decoded = null;
      if ('BarcodeDetector' in window) decoded = await new BarcodeDetector({formats:['qr_code']}).detect(qrImage);
      return { poster: rect('.bsp-poster'), cover: rect('.bsp-d-cover'), footer: rect('.bsp-d-footer'), title: rect('.bsp-d-title'), titleSize: getComputedStyle(title).fontSize, titleClamp: title.style.webkitLineClamp, name: rect('.bsp-d-name'), nameSize: getComputedStyle(name).fontSize, link: link.textContent, address: rect('.bsp-d-address'), linkBox: rect('.bsp-d-link'), linkOverflow: link.scrollWidth > link.clientWidth+1, contain: getComputedStyle(document.querySelector('.bsp-d-cover')).objectFit, qr: decoded, qrAlt: qr.alt };
    });
    assert.equal(observed.poster.width,1080); assert.equal(observed.poster.height,1440);
    assert.equal(observed.cover.width,1080); assert.equal(observed.cover.height,608); assert.equal(observed.contain,'contain');
    assert.ok(observed.title.bottom <= observed.footer.top); assert.ok(observed.name.height <= parseFloat(observed.nameSize)*2.5+1);
    assert.equal(observed.link,item.target ?? target); assert.equal(observed.linkOverflow,false); assert.ok(observed.linkBox.bottom <= observed.address.bottom); assert.ok(observed.address.bottom <= 1440);
    const dimensions = await page.evaluate(async dataUrl => { const img = new Image(); img.src=dataUrl;await img.decode(); return [img.naturalWidth,img.naturalHeight]; }, dataUrl);
    assert.deepEqual(dimensions,[1080,1440]);
    if (observed.qr) assert.equal(observed.qr[0].rawValue,item.target ?? target);
    report.push({case:item.name,...observed,dimensions});
  }
  assert.deepEqual(errors,[]);
  await writeFile(`${out}/report.json`,JSON.stringify({browser:browser.version(),report,errors},null,2));
  console.log(`Verified ${cases.length} measured layouts and real PNG exports: ${out}`);
} finally { await browser.close(); }
