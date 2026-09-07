import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { browserRuntime, openFixture } from './browser-test-support.mjs';

const { chromium } = await browserRuntime();
const browser = await chromium.launch({ headless: true });
const out = process.env.BSP_EVIDENCE_DIR ?? '.scratch/share-generation-extensibility/evidence/01';
const results = [];
try {
  for (const template of ['{{url}}\n{{title}}\n结束', '{{title}}\n{{url}}\n结束', '地址 {{url}} 后缀', '{{title}}', '前\n{{title}}\n后\n', '{{#if honor}}{{unknown}}{{/if}}']) {
    // Compile the actual developer configuration with an override; panel and generator stay unchanged.
    const built = await build({ entryPoints: ['src/index.ts'], bundle: true, write: false, format: 'iife', target: 'es2022',
      plugins: [{ name: 'developer-template-config', setup(builder) {
        builder.onLoad({ filter: /share-text-config\.ts$/ }, () => ({ contents: `export const shareTextTemplates = ${JSON.stringify({ plain: { compact: template, detailed: template } })};`, loader: 'ts' }));
      } }],
    });
    const { page, context, errors } = await openFixture(browser, built.outputFiles[0].text);
    const warnings = [];
    page.on('console', message => { if (message.type() === 'warning') warnings.push(message.text()); });
    await page.getByRole('button', { name: '分享海报', exact: true }).click();
    await page.getByRole('button', { name: '复制文案', exact: true }).waitFor();
    for (const mode of ['initial', 'detail', 'markers']) {
      if (mode === 'detail') await page.getByRole('checkbox', { name: '详细信息', exact: true }).check();
      if (mode === 'markers') {
        await page.getByRole('button', { name: '标记当前分P', exact: true }).click();
        await page.getByRole('button', { name: '标记当前时间', exact: true }).click();
      }
      const copy = page.getByRole('button', { name: '复制文案', exact: true });
      await copy.click();
      const preview = await page.getByLabel('分享文案预览', { exact: true }).textContent();
      const copied = await page.evaluate(() => window.fixture.copiedText.at(-1));
      assert.equal(copied, preview);
      const title = await page.evaluate(() => window.fixture.title);
      const url = `https://www.bilibili.com/video/BV1TXoWBsEGc/${mode === 'markers' ? '?p=2&t=83' : ''}`;
      if (template.includes('unknown')) {
        assert.ok(preview.startsWith(title));
        assert.ok(preview.endsWith(url));
        assert.ok(warnings.some(w => /plain\.(compact|detailed).*line 1, column/.test(w)));
      } else {
        assert.equal(preview, template.replaceAll('{{title}}', title).replaceAll('{{url}}', url));
        const emphasized = await page.locator('.bsp-text-card-link').allTextContents();
        assert.deepEqual(emphasized, template.includes('{{url}}') ? [url] : []);
      }
      await page.getByRole('button', { name: '复制 Markdown', exact: true }).click();
      const markdown = await page.evaluate(() => window.fixture.copiedText.at(-1));
      assert.ok(markdown.includes(title));
      assert.ok(markdown.includes(url));
      assert.equal(await page.getByRole('button', { name: '复制海报', exact: true }).isEnabled(), true);
      results.push({ template, mode, preview, copied, markdown, warnings: [...warnings] });
    }
    assert.deepEqual(errors, []);
    await context.close();
  }
  await mkdir(out, { recursive: true });
  await writeFile(`${out}/template-report.json`, JSON.stringify(results, null, 2));
  console.log('PASS: configured plain templates preserve preview/copy and link emphasis on open and options changes; malformed presets fall back independently');
} finally { await browser.close(); }
