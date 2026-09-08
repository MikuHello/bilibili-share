import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { browserRuntime, productionBundle, openFixture } from './browser-test-support.mjs';

const { chromium } = await browserRuntime();
const browser = await chromium.launch({ headless: true });
const bundle = await productionBundle();
const output = process.env.BSP_EVIDENCE_DIR ?? 'artifacts/browser/floating-feedback';
await mkdir(output, { recursive: true });
try {
  const { page, context, errors } = await openFixture(browser, bundle, { time: 0.4, title: '长文案滚动后的手动复制仍然可用。'.repeat(35) });
  try {
    await page.getByRole('button', { name: '分享海报', exact: true }).click();
    await page.getByRole('article').waitFor();
    await page.waitForTimeout(300);
    const before = await page.getByLabel('分享文案预览', { exact: true }).boundingBox();
    assert.equal(await page.getByText('当前播放位置不足 1 秒，时间戳分享不可用。', { exact: true }).isVisible(), false);
    const explanation = page.getByRole('button', { name: '标记当前时间：查看不可用原因', exact: true });
    await explanation.hover();
    await page.getByRole('tooltip').waitFor();
    assert.match(await page.getByRole('tooltip').textContent(), /不足 1 秒/);
    assert.deepEqual(await page.getByLabel('分享文案预览', { exact: true }).boundingBox(), before);
    assert.equal(await page.getByRole('button', { name: '标记当前时间', exact: true }).isDisabled(), true);
    await page.mouse.move(0, 0);
    await explanation.focus();
    assert.equal(await page.getByRole('tooltip').isVisible(), true);
    await page.getByRole('button', { name: '复制文案', exact: true }).focus();
    assert.equal(await page.getByRole('tooltip').isVisible(), false);
    await page.evaluate(() => { window.fixture.clipboardFailed = true; });
    await page.getByRole('button', { name: '复制文案', exact: true }).click();
    await page.getByRole('textbox', { name: '手动复制 普通文案' }).waitFor();
    assert.deepEqual(await page.getByLabel('分享文案预览', { exact: true }).boundingBox(), before);
    assert.equal(await page.getByRole('textbox', { name: '手动复制 普通文案' }).evaluate(node => node.selectionEnd === node.value.length && node.selectionStart === 0), true);
    await page.evaluate(() => { window.fixture.clipboardFailed = false; });
    await page.getByRole('button', { name: '复制文案', exact: true }).click();
    assert.equal(await page.getByRole('textbox').count(), 0);
    assert.match(await page.getByRole('status').textContent(), /已复制/);
    await page.getByRole('checkbox', { name: '详细信息' }).check();
    await page.evaluate(() => {
      window.fixture.clipboardFailed = true;
      const preview = document.querySelector('.bsp-text-content');
      preview.scrollTop = preview.scrollHeight;
    });
    await page.getByRole('button', { name: '复制 Markdown', exact: true }).click();
    const source = page.getByRole('textbox', { name: '手动复制 Markdown' });
    await source.waitFor();
    assert.equal(await source.evaluate(node => {
      const box = node.getBoundingClientRect();
      return document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2) === node;
    }), true);
    await page.screenshot({ path: `${output}/manual-copy.png` });
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
  for (const unknownPart of [false, true]) {
    const { page, context, errors } = await openFixture(browser, bundle, { unknownPart, time: 0.2,
      context: { viewport: { width: 390, height: 844 }, hasTouch: true, colorScheme: 'dark', reducedMotion: 'reduce' } });
    try {
      if (unknownPart) {
        await page.evaluate(() => document.documentElement.classList.add('dark'));
        await page.waitForFunction(() => document.querySelector('#bsp-entry.bsp-entry-dark'));
      }
      await page.getByRole('button', { name: '分享海报', exact: true }).click();
      await page.getByRole('article').waitFor();
      const anchor = page.getByRole('button', { name: '标记当前时间：查看不可用原因', exact: true });
      await anchor.tap();
      assert.match(await page.getByRole('tooltip').textContent(), unknownPart ? /分P无法识别/ : /不足 1 秒/);
      const hint = await page.getByRole('tooltip').boundingBox();
      assert.ok(hint.x >= 0 && hint.x + hint.width <= 390 && hint.y >= 0);
      if (unknownPart) assert.equal(await page.getByRole('tooltip').evaluate(node => getComputedStyle(node).backgroundColor), 'rgb(36, 38, 43)');
      await page.screenshot({ path: `${output}/touch-${unknownPart}.png` });
      await page.getByRole('button', { name: '复制文案', exact: true }).tap();
      assert.equal(await page.getByRole('tooltip').isVisible(), false);
      const geometry = await page.getByLabel('分享文案预览', { exact: true }).boundingBox();
      await page.evaluate(() => { window.fixture.clipboardFailed = true; });
      await page.getByRole('button', { name: '复制文案', exact: true }).tap();
      await page.getByRole('textbox').waitFor();
      assert.deepEqual(await page.getByLabel('分享文案预览', { exact: true }).boundingBox(), geometry);
      await page.screenshot({ path: `${output}/mobile-recovery-${unknownPart}.png` });
      await page.keyboard.press('Escape');
      await page.getByRole('dialog').waitFor({ state: 'detached' });
      assert.equal(await page.getByRole('tooltip').count(), 0);
      assert.equal(await page.getByRole('button', { name: '分享海报', exact: true }).evaluate(node => node === document.activeElement), true);
      assert.deepEqual(errors, []);
    } finally { await context.close(); }
  }
} finally { await browser.close(); }
