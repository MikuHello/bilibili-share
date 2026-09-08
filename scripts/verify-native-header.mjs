import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { browserRuntime, productionBundle, openFixture } from "./browser-test-support.mjs";

const { chromium } = await browserRuntime();
const browser = await chromium.launch({ headless: true });
try {
  const bundle = await productionBundle();
  const header = await readFile("tests/fixtures/page/native-header.html", "utf8");
  const { page, context, errors } = await openFixture(browser, bundle, { pageHeader: header, serverRendered: true });
  // A separately mounted header is already present while the video app hydrates.
  // Vue 2 mirrors the native video app's SSR reconciliation boundary.
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await page.addScriptTag({ path: "node_modules/vue/dist/vue.js" });
  await page.evaluate(() => {
    const template = document.createElement("template");
    template.innerHTML = window.fixture.pageTemplate;
    const renderNode = (h, node) => {
      if (node.nodeType === Node.TEXT_NODE) return node.textContent;
      if (node.nodeType === Node.COMMENT_NODE) return null;
      const attrs = Object.fromEntries([...node.attributes].map(attr => [attr.name, attr.value]));
      return h(node.tagName.toLowerCase(), { attrs }, node.id === "biliMainHeader" ? undefined : [...node.childNodes].map(child => renderNode(h, child)));
    };
    new window.Vue({ render: h => renderNode(h, template.content.firstChild) }).$mount("#app");
  });
  await page.getByRole("button", { name: "分享海报", exact: true }).waitFor();
  for (const name of ["首页", "消息"]) {
    assert.equal(await page.getByRole("link", { name, exact: true }).isVisible(), true, `native ${name} remains visible with userscript enabled`);
    await page.getByRole("link", { name, exact: true }).click({ trial: true });
  }
  await page.getByRole("button", { name: "分享海报", exact: true }).click();
  await page.getByRole("button", { name: "复制文案", exact: true }).waitFor();
  await page.getByRole("button", { name: "关闭分享面板", exact: true }).click();
  await page.getByRole("dialog").waitFor({ state: "detached" });
  for (const name of ["首页", "消息"]) {
    assert.equal(await page.getByRole("link", { name, exact: true }).isVisible(), true);
    await page.getByRole("link", { name, exact: true }).click({ trial: true });
  }
  assert.deepEqual(errors, []);
  await context.close();
  console.log("PASS: native navigation remains visible and actionable before and after sharing");
} finally { await browser.close(); }
