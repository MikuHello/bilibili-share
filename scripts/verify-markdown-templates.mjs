import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { browserRuntime, openFixture } from './browser-test-support.mjs';

const { chromium } = await browserRuntime();
const browser = await chromium.launch({ headless: true });
const out = process.env.BSP_EVIDENCE_DIR ?? '.scratch/share-generation-extensibility/evidence/ticket02';
const results = [];
const templates = {
  plain: { compact: '普通 {{title}}\n{{url}}', detailed: '详细 {{title}}\n{{part}}|{{timestamp}}\n{{url}}' },
  markdown: { compact: '[{{title}}]({{url}}) 尾声', detailed: '**{{title}}**\n[观看]({{url}})\n{{#if part}}{{part}}\n{{/if}}{{#if timestamp}}{{timestamp}}\n{{/if}}结束' },
};
try {
  for (const broken of [null, 'compact', 'detailed']) {
    const config = structuredClone(templates);
    if (broken) config.markdown[broken] = '{{#if honor}}{{unknown}}{{/if}}';
    const built = await build({ entryPoints: ['src/index.ts'], bundle: true, write: false, format: 'iife', target: 'es2022',
      plugins: [{ name: 'developer-template-config', setup(builder) {
        builder.onLoad({ filter: /share-text-config\.ts$/ }, () => ({ contents: `export const shareTextTemplates = ${JSON.stringify(config)};`, loader: 'ts' }));
      } }],
    });
    const { page, context, errors } = await openFixture(browser, built.outputFiles[0].text, { title: '猫 [片]* & <新>', uploader: 'UP_甲' });
    const warnings = [];
    page.on('console', message => { if (message.type() === 'warning') warnings.push(message.text()); });
    await page.getByRole('button', { name: '分享海报', exact: true }).click();
    await page.getByRole('button', { name: '复制文案', exact: true }).waitFor();
    for (const mode of ['compact', 'detailed', 'markers', 'compact-markers']) {
      const detailed = mode === 'detailed' || mode === 'markers';
      if (mode === 'detailed') await page.getByRole('checkbox', { name: '详细信息', exact: true }).check();
      if (mode === 'markers') {
        await page.getByRole('button', { name: '标记当前分P', exact: true }).click();
        await page.getByRole('button', { name: '标记当前时间', exact: true }).click();
      }
      if (mode === 'compact-markers') await page.getByRole('checkbox', { name: '详细信息', exact: true }).uncheck();
      const markers = mode.includes('markers');
      const url = `https://www.bilibili.com/video/BV1TXoWBsEGc/${markers ? '?p=2&t=83' : ''}`;
      const plain = detailed ? `详细 猫 [片]* & <新>\n${markers ? 'P2 · 优化版|01:23' : '|'}\n${url}` : `普通 猫 [片]* & <新>\n${url}`;
      await page.getByRole('button', { name: '复制文案', exact: true }).click();
      assert.equal(await page.getByLabel('分享文案预览', { exact: true }).textContent(), plain);
      assert.equal(await page.evaluate(() => window.fixture.copiedText.at(-1)), plain);
      await page.getByRole('button', { name: '复制 Markdown', exact: true }).click();
      const markdown = await page.evaluate(() => window.fixture.copiedText.at(-1));
      const title = '猫 \\[片\\]\\* &amp; &lt;新&gt;';
      const affected = broken === (detailed ? 'detailed' : 'compact');
      const expected = affected
        ? detailed
          ? `**${title}**\n\n- UP主：UP\\_甲\n- 播放：178,000 · 点赞：2,664 · 投币：1,285 · 收藏：6,657\n${markers ? '- 分P：P2 · 优化版\n- 时间：01:23\n' : ''}- BV1TXoWBsEGc · av116422017488201\n- 链接：${url}`
          : `[${title}](${url})（UP主：UP\\_甲）\n${url}`
        : detailed ? `**${title}**\n[观看](${url})\n${markers ? 'P2 · 优化版\n01:23\n' : ''}结束` : `[${title}](${url}) 尾声`;
      assert.equal(markdown, expected);
      if (affected) assert.ok(warnings.some(w => w.includes(`markdown.${broken} at line 1, column 14`)));
      // Actual PNG clipboard export remains usable even while a Markdown preset is broken.
      const imageCopies = await page.evaluate(() => window.fixture.copiedTypes.length);
      await page.getByRole('button', { name: '复制海报', exact: true }).click();
      await page.waitForFunction(count => window.fixture.copiedTypes.length > count, imageCopies);
      assert.deepEqual(await page.evaluate(() => window.fixture.copiedTypes.at(-1)), ['image/png']);
      results.push({ broken, mode, plain, markdown, warnings: [...warnings] });
    }
    assert.deepEqual(errors, []);
    await context.close();
  }
  await mkdir(out, { recursive: true });
  await writeFile(`${out}/markdown-report.json`, JSON.stringify(results, null, 2));
  console.log('PASS: four production presets, escaped Markdown copy, detail/part/time changes, isolated fallback and PNG copy (12 cases)');
} finally { await browser.close(); }
