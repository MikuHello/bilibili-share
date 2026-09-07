import assert from "node:assert/strict";
import { browserRuntime, productionBundle, openFixture } from "./browser-test-support.mjs";

// Approved seam: unchanged production bundle driven through user actions,
// with only GM/network, player and clipboard browser boundaries controlled.
const { chromium } = await browserRuntime();
const browser = await chromium.launch({ headless: true });
try {
  const bundle = await productionBundle();
  const { page, context, errors } = await openFixture(browser, bundle, { coverFailed: true });
  const diagnostics = [];
  page.on("console", message => { if (message.type() === "warning") diagnostics.push(message.text()); });
  await page.getByRole("button", { name: "分享海报", exact: true }).click();
  await page.getByText("封面暂时无法加载", { exact: true }).waitFor({ timeout: 10000 });
  const plain = page.getByRole("button", { name: "复制文案", exact: true });
  const markdown = page.getByRole("button", { name: "复制 Markdown", exact: true });
  assert.ok(diagnostics.some(message => message.includes("network-error")), "cover failure has a safe diagnostic stage");
  assert.equal(await plain.isEnabled(), true, "valid text survives cover failure");
  assert.equal(await markdown.isEnabled(), true, "Markdown survives cover failure");
  assert.equal(await page.getByRole("button", { name: "复制海报", exact: true }).isEnabled(), false);
  assert.equal(await page.getByRole("button", { name: "下载海报 PNG", exact: true }).isEnabled(), false);
  assert.equal(await page.getByText("COVER UNAVAILABLE", { exact: true }).count(), 0);
  await plain.click();
  assert.equal(await page.evaluate(() => window.fixture.copiedText.at(-1)),
    "35min 正念冥想｜把身体作为方法｜从内耗到感受｜此时此地此身｜聆听身体｜回归当下（UP主：妮卡的房间NiCalm）\nhttps://www.bilibili.com/video/BV1TXoWBsEGc/");
  await page.getByRole("button", { name: "标记当前时间", exact: true }).click();
  await plain.waitFor();
  await page.waitForFunction(() => !document.querySelector('[aria-label="复制文案"]').disabled);
  await page.getByRole("checkbox", { name: "详细信息", exact: true }).click();
  await plain.click();
  const markedText = await page.evaluate(() => window.fixture.copiedText.at(-1));
  assert.match(markedText, /时间：01:23/);
  assert.match(markedText, /播放：178,000/);
  assert.ok(markedText.endsWith("?p=2&t=83"));
  await page.evaluate(() => { window.fixture.coverFailed = false; window.fixture.time = 999; });
  await page.getByRole("button", { name: "重试", exact: true }).click();
  await page.getByRole("button", { name: "复制海报", exact: true }).waitFor();
  await page.waitForFunction(() => !document.querySelector('[aria-label="复制海报"]').disabled);
  await plain.click();
  assert.equal(await page.evaluate(() => window.fixture.copiedText.at(-1)), markedText,
    "retry keeps original captured position and current options");
  assert.deepEqual(errors, []);
  await page.getByRole("button", { name: "关闭分享面板", exact: true }).click();
  await page.getByRole("dialog").waitFor({ state: "detached" });
  await page.getByRole("button", { name: "分享海报", exact: true }).click();
  await page.getByRole("checkbox", { name: "详细信息", exact: true }).waitFor();
  assert.equal(await page.getByRole("checkbox", { name: "详细信息", exact: true }).isChecked(), true);
  await plain.click();
  assert.match(await page.evaluate(() => window.fixture.copiedText.at(-1)), /播放：178,000/);
  await context.close();
  console.log("PASS: cover failure preserves text; retry restores images with same capture/options");
  const special = await openFixture(browser, bundle, {
    title: "标题 [甲] *乙* <b>", uploader: "UP_名字[丙]",
    preferences: { "bsp-panel-preferences": { theme: "B", markdownText: true, detailedText: false } },
  });
  const specialPage = special.page;
  await specialPage.getByRole("button", { name: "分享海报", exact: true }).click();
  await specialPage.getByRole("button", { name: "复制文案", exact: true }).click();
  const originalPlain = await specialPage.evaluate(() => window.fixture.copiedText.at(-1));
  assert.equal(originalPlain, "标题 [甲] *乙* <b>（UP主：UP_名字[丙]）\nhttps://www.bilibili.com/video/BV1TXoWBsEGc/");
  await specialPage.getByRole("button", { name: "复制 Markdown", exact: true }).click();
  const copiedMarkdown = await specialPage.evaluate(() => window.fixture.copiedText.at(-1));
  assert.ok(copiedMarkdown.includes(String.raw`\[甲\] \*乙\* &lt;b&gt;`), "Markdown escapes source punctuation and HTML");
  assert.ok(copiedMarkdown.includes(String.raw`UP\_名字\[丙\]`), "compact Markdown preserves uploader");
  assert.equal(await specialPage.getByLabel("分享文案预览", { exact: true }).textContent(), originalPlain);
  await specialPage.evaluate(() => { window.fixture.clipboardFailed = true; });
  await specialPage.getByRole("button", { name: "复制 Markdown", exact: true }).click();
  assert.equal(await specialPage.getByRole("textbox", { name: "手动复制 Markdown", exact: true }).inputValue(), copiedMarkdown);
  await special.context.close();
  console.log("PASS: independent Markdown preserves escaped information and ignores legacy mode");
  const blocked = await openFixture(browser, bundle, { metadataFailed: true });
  await blocked.page.getByRole("button", { name: "分享海报", exact: true }).click();
  await blocked.page.getByRole("button", { name: "重试", exact: true }).waitFor();
  assert.equal(await blocked.page.getByRole("button", { name: /^复制/ }).count(), 0, "invalid identity exposes no copy action");
  assert.equal(await blocked.page.getByRole("button", { name: "下载海报 PNG", exact: true }).count(), 0);
  await blocked.context.close();
  console.log("PASS: metadata failure blocks all exports");
} finally {
  await browser.close();
}
