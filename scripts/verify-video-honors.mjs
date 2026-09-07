import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { browserRuntime, productionBundle, openFixture } from './browser-test-support.mjs';

const { chromium } = await browserRuntime();
const browser = await chromium.launch({ headless: true });
const bundle = await productionBundle();
const output = process.env.BSP_EVIDENCE_DIR ?? '.scratch/bilibili-share-poster/video-honors/evidence/01';
await mkdir(output, { recursive: true });
const results = [];
try {
  for (const [index, honor] of ['第389期每周必看', '入站必刷98大视频', '全站排行榜最高第4名', '全站排行榜最高第4名（包含完整限定说明）'.repeat(30), undefined].entries()) {
    const { page, context, errors } = await openFixture(browser, bundle, {
      honorReply: { honor: [{ type: index % 3 + 1, desc: honor }] },
      context: { viewport: { width: index === 2 ? 390 : 1280, height: 900 } },
      ...(index >= 3 ? { title: '长标题与不同封面比例：'.repeat(20),
        coverBase64: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="800"><rect width="400" height="800" fill="${index === 3 ? '#000' : '#fff'}"/></svg>`).toString('base64'), coverMime: 'image/svg+xml' } : {}),
    });
    try {
      await page.getByRole('button', { name: '分享海报', exact: true }).click();
      await page.getByRole('article').waitFor();
      await page.getByRole('dialog').screenshot({ path: `${output}/initial-${index}.png` });
      if (honor) assert.equal(await page.getByRole('article').getByText(honor, { exact: true }).count(), 1);
      else assert.equal(await page.locator('.bsp-d-honor').count(), 0);
      await page.getByRole('checkbox', { name: '详细信息' }).check();
      if (honor) assert.ok((await page.getByLabel('分享文案预览', { exact: true }).textContent()).includes(honor));
      await page.getByRole('button', { name: '标记当前时间', exact: true }).click();
      await page.waitForFunction(() => !document.querySelector('[aria-label="复制海报"]').disabled);
      if (honor) assert.equal(await page.getByRole('article').getByText(honor, { exact: true }).count(), 1);
      assert.equal(await page.evaluate(() => window.fixture.requests.length), 2);
      const geometry = honor && await page.getByRole('article').evaluate(poster => {
        const r = node => { const b = node.getBoundingClientRect(); return { top: b.top, bottom: b.bottom, left: b.left, right: b.right }; };
        return { honor: r(poster.querySelector('.bsp-d-honor')), ids: r(poster.querySelector('.bsp-d-ids')), cover: r(poster.querySelector('.bsp-d-cover')), title: r(poster.querySelector('h4')) };
      });
      if (geometry) {
      assert.ok(geometry.honor.top > geometry.ids.bottom);
      assert.ok(geometry.honor.top < geometry.cover.top && geometry.honor.bottom > geometry.cover.top);
      assert.ok(geometry.honor.bottom < geometry.title.top);
      }
      await page.evaluate(() => { navigator.clipboard.write = async items => {
        const blob = await items[0].getType('image/png');
        window.exportedPng = await new Promise(resolve => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.readAsDataURL(blob); });
      }; });
      await page.getByRole('button', { name: '复制海报', exact: true }).click();
      await page.waitForFunction(() => window.exportedPng);
      const path = `${output}/honor-${index}.png`;
      await writeFile(path, Buffer.from((await page.evaluate(() => window.exportedPng)).split(',')[1], 'base64'));
      const decoded = JSON.parse(execFileSync('swift', ['scripts/verify-poster-qr.swift', path], { encoding: 'utf8' }));
      assert.equal(decoded.target, 'https://www.bilibili.com/video/BV1TXoWBsEGc/?p=2&t=83');
      await page.getByRole('dialog').screenshot({ path: `${output}/panel-${index}.png` });
      assert.deepEqual(errors, []);
      results.push({ honor, geometry, decoded });
    } finally { await context.close(); }
  }
} finally {
  await writeFile(`${output}/report.json`, JSON.stringify(results, null, 2));
  await browser.close();
}
