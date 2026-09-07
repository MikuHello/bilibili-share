import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { browserRuntime, productionBundle, openFixture } from './browser-test-support.mjs';
const baseline = process.argv.includes('--baseline');
const { chromium } = await browserRuntime();
const browser = await chromium.launch({ headless: true });
const bundle = await productionBundle();
const output = process.env.BSP_EVIDENCE_DIR ?? '.scratch/bilibili-share-poster/usage-refinement/evidence/ticket03';
await mkdir(output, { recursive: true });
const samples = [];
async function ready(page) {
  await page.waitForFunction(() => document.querySelector('[aria-label="复制海报"]')?.disabled === false);
}
try {
  for (let sample = 0; sample < 3; sample++) {
    const { page, context, errors } = await openFixture(browser, bundle, { delay: 40 });
    await page.evaluate(() => {
      window.metrics = { canvases: [], decodes: [], longTasks: [], shifts: [] };
      const encode = HTMLCanvasElement.prototype.toDataURL;
      HTMLCanvasElement.prototype.toDataURL = function (...args) {
        window.metrics.canvases.push([this.width, this.height]);
        return encode.apply(this, args);
      };
      const decode = HTMLImageElement.prototype.decode;
      HTMLImageElement.prototype.decode = function () {
        window.metrics.decodes.push(this.alt);
        return decode.call(this);
      };
      for (const [type, key] of [['longtask', 'longTasks'], ['layout-shift', 'shifts']]) {
        new PerformanceObserver(list => list.getEntries().forEach(e => window.metrics[key].push({ start: e.startTime, duration: e.duration, value: e.value, recentInput: e.hadRecentInput }))).observe({ type, buffered: true });
      }
    });
    async function measure(name, operation) {
      const before = await page.evaluate(() => ({ time: performance.now(), canvases: window.metrics.canvases.length, decodes: window.metrics.decodes.length, requests: window.fixture.requests.length }));
      await operation();
      const after = await page.evaluate(() => ({ time: performance.now(), canvases: window.metrics.canvases.length, decodes: window.metrics.decodes.length, requests: window.fixture.requests.length }));
      return { name, durationMs: after.time - before.time, canvases: after.canvases - before.canvases, decodes: after.decodes - before.decodes, requests: after.requests - before.requests };
    }
    const stages = [];
    stages.push(await measure('open', async () => { await page.getByRole('button', { name: '分享海报', exact: true }).click(); await ready(page); }));
    await page.evaluate(() => { window.kept = { controls: [...document.querySelectorAll('.bsp-controls button,.bsp-controls input')], cover: document.querySelector('.bsp-d-cover'), title: document.querySelector('.bsp-d-title') }; });
    stages.push(await measure('details', async () => { await page.getByRole('checkbox', { name: '详细信息', exact: true }).check(); await ready(page); }));
    const stableDetails = await page.evaluate(() => window.kept.controls.every(node => node.isConnected) && window.kept.title === document.querySelector('.bsp-d-title'));
    if (!baseline) assert.equal(stableDetails, true, 'details preserve all controls and poster');
    stages.push(await measure('marker', async () => { await page.getByRole('button', { name: '标记当前时间', exact: true }).click(); await ready(page); }));
    const stableMarker = await page.evaluate(() => window.kept.cover === document.querySelector('.bsp-d-cover') && window.kept.title === document.querySelector('.bsp-d-title') && window.kept.controls.every(node => node.isConnected));
    if (!baseline) assert.equal(stableMarker, true, 'target update preserves cover, title and controls');
    for (const name of ['first-export', 'repeat-export']) {
      stages.push(await measure(name, async () => {
        const count = await page.evaluate(() => window.fixture.copiedTypes.length);
        await page.getByRole('button', { name: '复制海报', exact: true }).click();
        await page.waitForFunction(n => window.fixture.copiedTypes.length > n, count);
        await ready(page);
      }));
    }
    if (!baseline) {
      assert.equal(stages.find(s => s.name === 'details').canvases, 0);
      assert.equal(stages.find(s => s.name === 'details').decodes, 0);
      assert.equal(stages.find(s => s.name === 'details').requests, 0);
      assert.equal(stages.find(s => s.name === 'marker').requests, 0);
      assert.equal(stages.find(s => s.name === 'repeat-export').canvases, 0, 'same poster reuses PNG');
    }
    assert.deepEqual(errors, []);
    samples.push({ sample, stages, stableDetails, stableMarker, metrics: await page.evaluate(() => window.metrics) });
    await context.close();
  }
} finally {
  await writeFile(`${output}/${baseline ? 'before' : 'after'}.json`, JSON.stringify({ browser: browser.version(), environment: 'Headless Chromium; production bundle; GM fixtures with 40ms per metadata/cover request; clipboard recorder; Playwright action/wait overhead included; not installed-script or live-network latency.', samples }, null, 2));
  await browser.close();
}
