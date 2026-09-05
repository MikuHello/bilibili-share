import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { browserRuntime, productionBundle, openFixture } from "./browser-test-support.mjs";

// Real production entry/panel, controlled external GM and clipboard boundaries.
const { chromium } = await browserRuntime();
const bundle = await productionBundle();
const browser = await chromium.launch({ headless: true });
const output = ".scratch/bilibili-share-poster/redesign/acceptance/ticket04";
await mkdir(output, { recursive: true });
const results = [];
const canonical = "https://www.bilibili.com/video/BV1TXoWBsEGc/";
const partButton = page => page.getByRole("button", { name: "标记当前分P", exact: true });
const timeButton = page => page.getByRole("button", { name: "标记当前时间", exact: true });
const exportButtons = page => page.getByRole("button", { name: /^(复制文案|复制 Markdown|复制海报|下载海报(?: PNG)?|复制海报与文案的兼容格式|组合复制)$/ });
const combinedButton = page => page.getByRole("button", { name: /^(复制海报与文案的兼容格式|组合复制)$/ });
async function ready(page) {
  await page.waitForFunction(() => {
    const button = document.querySelector('[aria-label="复制文案"]');
    return button && !button.disabled;
  });
}
async function installClipboardRecorder(page) {
  await page.evaluate(() => {
    window.clipboardWrites = [];
    navigator.clipboard.write = async items => {
      if (window.holdClipboard) {
        window.clipboardWaiting = true;
        await new Promise(resolve => { window.releaseClipboard = resolve; });
        window.clipboardWaiting = false;
      }
      const content = {};
      for (const item of items) for (const type of item.types) {
        const blob = await item.getType(type);
        content[type] = type === "image/png" ? await new Promise(resolve => {
          const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.readAsDataURL(blob);
        }) : await blob.text();
      }
      window.clipboardWrites.push(content);
    };
  });
}
async function assertOutputs(page, target, name) {
  await ready(page);
  const preview = await page.getByRole("dialog").getByLabel("分享文案预览", { exact: true }).textContent();
  assert.ok(preview.endsWith(target));
  await page.getByRole("button", { name: "复制文案", exact: true }).click();
  assert.equal(await page.evaluate(() => window.fixture.copiedText.at(-1)), preview);
  await page.getByRole("button", { name: "复制 Markdown", exact: true }).click();
  const markdown = await page.evaluate(() => window.fixture.copiedText.at(-1));
  assert.ok(markdown.includes(`](${target})`) && markdown.endsWith(target));
  assert.equal(await page.getByRole("dialog").getByLabel("分享文案预览", { exact: true }).textContent(), preview);
  if (await page.getByRole("button", { name: "复制海报", exact: true }).isEnabled()) {
    await page.evaluate(() => { window.clipboardWrites = []; });
    await combinedButton(page).click();
    await page.waitForFunction(() => window.clipboardWrites.length === 1);
    const content = await page.evaluate(() => window.clipboardWrites[0]);
    assert.equal(content["text/plain"], preview);
    assert.ok(content["text/html"].includes(target.replaceAll("&", "&amp;")));
    const path = `${output}/${name}.png`;
    await writeFile(path, Buffer.from(content["image/png"].split(",")[1], "base64"));
    const decoded = JSON.parse(execFileSync("swift", ["scripts/verify-poster-qr.swift", path], { encoding: "utf8" }).trim());
    assert.equal(decoded.target, target);
    const poster = page.getByRole("article");
    assert.ok((await poster.innerText()).endsWith(target));
    const nonTargetText = (await poster.innerText()).replace(target, "");
    results.push({ scenario: name, target, decoded: decoded.target, passed: true });
    return nonTargetText;
  }
  assert.equal(await combinedButton(page).isEnabled(), false);
  results.push({ scenario: name, target, textOnly: true, passed: true });
  return null;
}
try {
  const { page, context, errors } = await openFixture(browser, bundle);
  try {
    await installClipboardRecorder(page);
    await page.getByRole("button", { name: "生成海报", exact: true }).click();
    await page.getByRole("button", { name: "复制文案", exact: true }).waitFor();
    const statuses = await page.getByRole("status").allTextContents();
    assert.ok(statuses.includes("已使用完整链接"), `Expected concise fallback notice, received ${JSON.stringify(statuses)}`);
    assert.equal(await page.getByRole("button", { name: "标记当前分P", exact: true }).count(), 1);
    assert.equal(await page.getByRole("button", { name: "标记当前时间", exact: true }).count(), 1);
    assert.deepEqual(errors, []);
    results.push({ scenario: "canonical fallback has only the approved concise notice", passed: true });
    const original = await assertOutputs(page, canonical, "default-p2");
    assert.equal(await partButton(page).getAttribute("aria-pressed"), "false");
    assert.equal(await timeButton(page).getAttribute("aria-pressed"), "false");
    await page.evaluate(() => { window.holdClipboard = true; });
    await combinedButton(page).click();
    await page.waitForFunction(() => window.clipboardWaiting === true);
    assert.equal(await timeButton(page).isDisabled(), true, "target cannot change while an existing combined export is unfinished");
    assert.equal(await partButton(page).isDisabled(), true);
    await page.evaluate(() => { window.holdClipboard = false; window.releaseClipboard(); });
    await ready(page);
    assert.equal(await timeButton(page).isEnabled(), true);
    results.push({ scenario: "in-flight image export keeps its share target stable", passed: true });
    await page.evaluate(() => { window.fixture.targetDelay = 600; window.fixture.time = 999; window.fixture.stats.view = 999999; });
    const requestsBefore = await page.evaluate(() => window.fixture.requests.filter(request => new URL(request.url).pathname === "/x/web-interface/view").length);
    await timeButton(page).click();
    for (const button of await exportButtons(page).all()) assert.equal(await button.isDisabled(), true, "all exports lock while target is pending");
    assert.ok((await page.getByRole("article").innerText()).endsWith(canonical), "old preview remains during target update");
    assert.equal(await assertOutputs(page, canonical + "?p=2&t=83", "p2-time"), original);
    assert.equal(await partButton(page).getAttribute("aria-pressed"), "true");
    assert.equal(await timeButton(page).getAttribute("aria-pressed"), "true");
    assert.equal(await page.evaluate(() => window.fixture.requests.filter(request => new URL(request.url).pathname === "/x/web-interface/view").length), requestsBefore);
    await partButton(page).click();
    assert.equal(await assertOutputs(page, canonical, "p2-clear"), original);
    assert.equal(await timeButton(page).getAttribute("aria-pressed"), "false");
  } finally { await context.close(); }
  const failed = await openFixture(browser, bundle, { coverFailed: true, targetDelay: 300 });
  try {
    const page = failed.page;
    await page.getByRole("button", { name: "生成海报", exact: true }).click();
    await ready(page);
    await timeButton(page).click();
    assert.equal(await page.getByRole("button", { name: "重试", exact: true }).isDisabled(), true, "retry must not race a pending target change");
    for (const button of await exportButtons(page).all()) assert.equal(await button.isDisabled(), true);
    await assertOutputs(page, canonical + "?p=2&t=83", "failed-cover-time");
    assert.equal(await page.getByRole("button", { name: "重试", exact: true }).isEnabled(), true);
    assert.deepEqual(failed.errors, []);
  } finally { await failed.context.close(); }
  for (const scenario of [
    { name: "p1-time", overrides: { part: 1 }, marker: true, target: canonical + "?t=83" },
    { name: "below-one-second", overrides: { part: 1, time: 0.9 }, unavailable: true, target: canonical },
    { name: "unknown-part", overrides: { unknownPart: true }, unavailable: true, target: canonical },
    { name: "valid-short", overrides: { shortLink: true }, target: "https://b23.tv/BspDemo" },
    { name: "wrong-bvid", overrides: { shortLink: true, resolvedUrl: "https://www.bilibili.com/video/BV1xx411c7mD/" }, target: canonical },
    { name: "short-loses-time", overrides: { shortLink: true, resolvedUrl: canonical + "?p=2" }, marker: true, target: canonical + "?p=2&t=83" },
    { name: "short-loses-part", overrides: { shortLink: true, resolvedUrl: canonical + "?t=83" }, marker: true, target: canonical + "?p=2&t=83" },
    { name: "short-keeps-markers", overrides: { shortLink: true, resolvedUrl: canonical + "?p=2&t=83" }, marker: true, target: "https://b23.tv/BspDemo" },
  ]) {
    const fixture = await openFixture(browser, bundle, scenario.overrides);
    const page = fixture.page;
    try {
      await installClipboardRecorder(page);
      await page.getByRole("button", { name: "生成海报", exact: true }).click();
      await ready(page);
      if (scenario.marker) { await timeButton(page).click(); await ready(page); }
      if (scenario.unavailable) assert.equal(await timeButton(page).isDisabled(), true);
      if (scenario.overrides.unknownPart) {
        assert.equal(await partButton(page).isDisabled(), true);
        assert.ok((await page.getByRole("dialog").innerText()).includes("当前分P无法识别"));
      }
      if (scenario.overrides.part === 1) assert.equal(await partButton(page).getAttribute("aria-pressed"), "false");
      await assertOutputs(page, scenario.target, scenario.name);
      const fallback = await page.getByRole("status").allTextContents();
      assert.equal(fallback.includes("已使用完整链接"), scenario.target !== "https://b23.tv/BspDemo");
      assert.deepEqual(fixture.errors, []);
      if (scenario.name === "p1-time") {
        await page.getByRole("button", { name: "关闭分享面板", exact: true }).click();
        await page.getByRole("dialog").waitFor({ state: "detached" });
        await page.getByRole("button", { name: "生成海报", exact: true }).click();
        await ready(page);
        assert.equal(await timeButton(page).getAttribute("aria-pressed"), "false");
        assert.equal(await partButton(page).getAttribute("aria-pressed"), "false");
        assert.ok((await page.getByRole("dialog").getByLabel("分享文案预览", { exact: true }).textContent()).endsWith(canonical));
        results.push({ scenario: "reopen resets markers", passed: true });
      }
    } finally { await fixture.context.close(); }
  }
} finally {
  await writeFile(`${output}/report.json`, JSON.stringify({ browser: browser.version(), results }, null, 2));
  await browser.close();
}
