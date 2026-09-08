import assert from 'node:assert/strict';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { browserRuntime, productionBundle, openFixture } from './browser-test-support.mjs';
const { chromium } = await browserRuntime();
const browser = await chromium.launch({ headless: true });
const bundle = await productionBundle();
const output = process.env.BSP_EVIDENCE_DIR ?? 'artifacts/browser/update-races';
await mkdir(output, { recursive: true });
const results = [];
const canonical = 'https://www.bilibili.com/video/BV1TXoWBsEGc/';
const ready = page => page.waitForFunction(() => document.querySelector('.bsp-backdrop:not([aria-hidden="true"]) [aria-label="复制海报"]')?.disabled === false);
const open = async page => { await page.getByRole('button', { name: '分享海报', exact: true }).click(); await ready(page); };
const marker = page => page.getByRole('button', { name: '标记当前时间', exact: true });
async function clipboard(page) {
  await page.evaluate(() => {
    window.pngWrites = [];
    window.encodes = 0;
    const encode = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function (...args) {
      if (this.width === 1080 && this.height === 1440) {
        window.encodes++;
        if (window.failEncode) { window.failEncode = false; throw Error('Controlled encoding failure'); }
      }
      return encode.apply(this, args);
    };
    navigator.clipboard.write = async items => {
      for (const item of items) {
        const blob = await item.getType('image/png');
        window.pngWrites.push(await new Promise(resolve => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.readAsDataURL(blob); }));
      }
    };
  });
}
async function exportPng(page) {
  const before = await page.evaluate(() => window.pngWrites.length);
  await page.getByRole('button', { name: '复制海报', exact: true }).click();
  await page.waitForFunction(n => window.pngWrites.length === n + 1, before);
  await ready(page);
  return page.evaluate(() => window.pngWrites.at(-1));
}
async function decode(data, name, target) {
  const path = `${output}/${name}.png`;
  await writeFile(path, Buffer.from(data.split(',')[1], 'base64'));
  const decoded = JSON.parse(execFileSync('swift', ['scripts/verify-poster-qr.swift', path], { encoding: 'utf8' }));
  assert.equal(decoded.target, target);
}
async function holdQr(page) {
  await page.evaluate(() => {
    window.pendingQr = [];
    const decode = HTMLImageElement.prototype.decode;
    HTMLImageElement.prototype.decode = async function () {
      await decode.call(this);
      if (this.alt.startsWith('二维码：')) await new Promise((resolve, reject) => window.pendingQr.push({ resolve, reject }));
    };
  });
}
try {
  const fixture = await openFixture(browser, bundle);
  const { page } = fixture;
  await clipboard(page);
  await open(page);
  await holdQr(page);
  await marker(page).click();
  await page.waitForFunction(() => window.pendingQr.length === 1);
  assert.equal(await marker(page).getAttribute('aria-pressed'), 'true');
  assert.equal(await page.getByRole('button', { name: '复制海报', exact: true }).isDisabled(), true);
  await page.getByRole('checkbox', { name: '详细信息' }).check();
  assert.ok((await page.getByLabel('分享文案预览', { exact: true }).textContent()).includes('妮卡'));
  await page.getByRole('button', { name: '标记当前分P', exact: true }).click();
  await page.waitForFunction(() => window.pendingQr.length === 2);
  assert.equal(await marker(page).getAttribute('aria-pressed'), 'false');
  await page.evaluate(() => window.pendingQr[1].resolve());
  await ready(page);
  await page.evaluate(() => window.pendingQr[0].resolve());
  await page.waitForTimeout(30);
  assert.equal(await page.locator('.bsp-d-link').textContent(), canonical);
  assert.ok((await page.getByLabel('分享文案预览', { exact: true }).textContent()).endsWith(canonical));
  await decode(await exportPng(page), 'latest-wins', canonical);
  results.push('Out-of-order QR completion retains latest options; details update immediately; exports blocked until complete; actual PNG QR matches latest text.');
  // A new target must discard a previously completed PNG.
  await marker(page).click();
  await page.waitForFunction(() => window.pendingQr.length === 3);
  await page.evaluate(() => window.pendingQr[2].resolve());
  await ready(page);
  const marked = await exportPng(page);
  await decode(marked, 'cache-invalidated', canonical + '?p=2&t=83');
  assert.equal(await page.evaluate(() => window.encodes), 2);
  assert.equal(await exportPng(page), marked);
  assert.equal(await page.evaluate(() => window.encodes), 2);
  results.push('Changing target invalidates PNG; same target copies the identical PNG without encoding again.');
  // Real FontFaceSet load changes availability after an already cached export.
  const font = await readFile('/System/Library/Fonts/Supplemental/Arial.ttf');
  await page.evaluate(async base64 => {
    const face = new FontFace('BspCacheProbe', `url(data:font/ttf;base64,${base64})`);
    document.fonts.add(face);
    await document.fonts.load('20px BspCacheProbe');
    await document.fonts.ready;
  }, font.toString('base64'));
  await exportPng(page);
  assert.equal(await page.evaluate(() => window.encodes), 3);
  results.push('A real font load invalidates cached PNG.');
  // Closing while a replacement QR is decoded cannot reattach or write anything.
  await marker(page).click();
  await page.waitForFunction(() => window.pendingQr.length === 4);
  await page.getByRole('button', { name: '关闭分享面板', exact: true }).click();
  await page.getByRole('dialog').waitFor({ state: 'detached' });
  await page.evaluate(() => window.pendingQr[3].resolve());
  await page.waitForTimeout(30);
  assert.equal(await page.getByRole('dialog').count(), 0);
  assert.deepEqual(fixture.errors, []);
  results.push('Close discards pending target update.');
  await fixture.context.close();

  const retryFixture = await openFixture(browser, bundle);
  const p = retryFixture.page;
  await clipboard(p);
  await open(p);
  await p.evaluate(() => { window.failEncode = true; });
  await p.getByRole('button', { name: '复制海报', exact: true }).click();
  await p.getByRole('status').filter({ hasText: '海报复制失败' }).waitFor();
  await ready(p);
  const retried = await exportPng(p);
  assert.equal(await p.evaluate(() => window.encodes), 2);
  assert.equal(await exportPng(p), retried);
  assert.equal(await p.evaluate(() => window.encodes), 2);
  results.push('Failed encoding retains preview, retries once, then reuses the successful PNG.');
  await p.getByRole('button', { name: '关闭分享面板', exact: true }).click();
  await p.getByRole('dialog').waitFor({ state: 'detached' });
  await open(p);
  await p.evaluate(() => {
    const button = document.querySelector('.bsp-backdrop:not([aria-hidden="true"]) [aria-label="复制海报"]');
    button.dispatchEvent(new MouseEvent('click'));
    button.dispatchEvent(new MouseEvent('click'));
  });
  await p.waitForFunction(() => window.pngWrites.length === 3);
  await ready(p);
  assert.equal(await p.evaluate(() => window.encodes), 3);
  results.push('Reopened snapshot encodes anew; concurrent user export actions cannot start duplicate work.');
  await holdQr(p);
  await marker(p).click();
  await p.waitForFunction(() => window.pendingQr.length === 1);
  await p.evaluate(() => window.pendingQr[0].reject(Error('Controlled QR failure')));
  await p.getByRole('button', { name: '重试', exact: true }).waitFor();
  // Verify the resource retry can recover into text-only sharing.
  await p.evaluate(() => { window.pendingQr = []; window.fixture.coverFailed = true; });
  await p.getByRole('button', { name: '重试', exact: true }).click();
  await p.getByText('封面暂时无法加载', { exact: true }).waitFor();
  assert.equal(await p.getByRole('button', { name: '复制文案', exact: true }).isEnabled(), true);
  results.push('QR failure exposes resource retry; failed cover still retains text-only sharing.');
  assert.deepEqual(retryFixture.errors, []);
  await retryFixture.context.close();

  for (const scenario of ['navigation', 'export-close']) {
    const f = await openFixture(browser, bundle);
    await clipboard(f.page);
    await open(f.page);
    if (scenario === 'navigation') {
      await holdQr(f.page);
      await marker(f.page).click();
      await f.page.waitForFunction(() => window.pendingQr.length === 1);
      await f.page.evaluate(() => { history.pushState({}, '', '/video/BV1GJ411x7h7/'); window.pendingQr[0].resolve(); });
    } else {
      await f.page.evaluate(() => {
        const decode = HTMLImageElement.prototype.decode;
        HTMLImageElement.prototype.decode = async function () {
          await decode.call(this);
          if (this.src.startsWith('data:image/svg+xml')) await new Promise(resolve => { window.finishExport = resolve; });
        };
      });
      await f.page.getByRole('button', { name: '复制海报', exact: true }).click();
      await f.page.waitForFunction(() => typeof window.finishExport === 'function');
      await f.page.getByRole('button', { name: '关闭分享面板', exact: true }).click();
      await f.page.evaluate(() => window.finishExport?.());
    }
    await f.page.getByRole('dialog').waitFor({ state: 'detached' });
    if (scenario === 'export-close') assert.equal(await f.page.evaluate(() => window.pngWrites.length), 0);
    assert.deepEqual(f.errors, []);
    results.push(`${scenario}: no panel resurrected after asynchronous work.`);
    await f.context.close();
  }
} finally {
  await writeFile(`${output}/races.json`, JSON.stringify({ browser: browser.version(), results }, null, 2));
  await browser.close();
}
