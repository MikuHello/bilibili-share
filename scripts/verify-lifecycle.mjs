import assert from "node:assert/strict";
import { browserRuntime, productionBundle, openFixture } from "./browser-test-support.mjs";

// Approved seam: production bundle; external GM menu/player/browser ports only.
const { chromium } = await browserRuntime();
const browser = await chromium.launch({ headless: true });
try {
  const bundle = await productionBundle();
  const { page, context, errors } = await openFixture(browser, bundle, { paused: false, delay: 100 });
  await page.getByRole("button", { name: "分享海报", exact: true }).click();
  await page.getByRole("dialog").waitFor();
  await page.evaluate(() => window.openFixturePanel());
  assert.equal(await page.getByRole("dialog").count(), 1);
  assert.equal(await page.evaluate(() => window.fixture.pauseCount), 1, "repeat entry preserves capture");
  await page.getByRole("button", { name: "复制文案", exact: true }).waitFor();
  assert.equal(await page.evaluate(() => window.fixture.requests.filter(x => x.url.includes("/x/web-interface/view")).length), 1);
  // Close then immediately reopen via the real registered menu callback. This
  // occurs within the exit animation and must open a fresh, live panel.
  await page.evaluate(() => {
    document.querySelector('[aria-label="关闭分享面板"]').click();
    window.openFixturePanel();
  });
  await page.waitForTimeout(350);
  assert.equal(await page.getByRole("dialog").count(), 1, "reopening during close animation keeps the new panel open");
  assert.equal(await page.evaluate(() => window.fixture.pauseCount), 2, "reopen takes a fresh capture");
  assert.equal(await page.evaluate(() => window.fixture.paused), true, "old close callback cannot resume under the new panel");
  assert.equal(await page.getByRole("dialog").evaluate(dialog => dialog.contains(document.activeElement)), true, "old close cannot steal the new panel focus");
  await page.keyboard.press("Escape");
  await page.getByRole("dialog").waitFor({ state: "detached" });
  assert.equal(await page.evaluate(() => window.fixture.paused), false, "final close restores playback");
  assert.deepEqual(errors, []);
  await context.close();
  console.log("PASS: duplicate entry and immediate reopen preserve one live captured panel");
  const failed = await openFixture(browser, bundle);
  await failed.page.evaluate(() => document.querySelector("video").remove());
  await failed.page.getByRole("button", { name: "分享海报", exact: true }).click();
  await failed.page.getByRole("button", { name: "重试", exact: true }).waitFor();
  await failed.page.evaluate(() => {
    history.pushState({}, "", "/video/BV1xx411c7mD/?p=1");
    window.dispatchEvent(new Event("urlchange"));
  });
  await failed.page.waitForTimeout(350);
  assert.equal(await failed.page.getByRole("dialog").count(), 0, "navigation closes even a failed capture");
  assert.equal(await failed.page.evaluate(() => window.fixture.playCount), 0);
  await failed.context.close();
  console.log("PASS: failed capture navigation discards the old panel without playback");
  for (const phase of ["initial", "retry", "target"]) {
    const late = await openFixture(browser, bundle, { paused: false, coverFailed: phase === "retry", delay: phase === "initial" ? 200 : 0 });
    const p = late.page;
    await p.getByRole("button", { name: "分享海报", exact: true }).click();
    if (phase === "retry") {
      await p.getByRole("button", { name: "重试", exact: true }).waitFor();
      await p.evaluate(() => { window.fixture.delay = 200; window.fixture.coverFailed = false; });
      await p.getByRole("button", { name: "重试", exact: true }).click();
    } else if (phase === "target") {
      await p.getByRole("button", { name: "复制文案", exact: true }).waitFor();
      await p.evaluate(() => {
        const decode = HTMLImageElement.prototype.decode;
        HTMLImageElement.prototype.decode = async function () {
          await decode.call(this);
          if (this.alt.startsWith("二维码：")) await new Promise(resolve => setTimeout(resolve, 500));
        };
      });
      await p.getByRole("button", { name: "标记当前时间", exact: true }).click();
    }
    await p.evaluate(() => {
      history.pushState({}, "", "/video/BV1xx411c7mD/?p=1");
      window.dispatchEvent(new Event("urlchange"));
      window.fixture.title = "新视频快照";
      window.fixture.time = 12;
      window.openFixturePanel();
    });
    await p.waitForTimeout(1200);
    assert.equal(await p.getByRole("dialog").count(), 1, phase + " old result cannot revive an old panel");
    assert.equal(await p.evaluate(() => window.fixture.playCount), 0, "navigation must not resume another video");
    await p.getByRole("button", { name: "复制文案", exact: true }).click();
    const text = await p.evaluate(() => window.fixture.copiedText.at(-1));
    assert.ok(text.startsWith("新视频快照"));
    assert.ok(text.endsWith("https://www.bilibili.com/video/BV1xx411c7mD/"));
    assert.equal(await p.getByRole("button", { name: "标记当前时间", exact: true }).getAttribute("aria-pressed"), "false");
    assert.deepEqual(late.errors, []);
    await late.context.close();
  }
  console.log("PASS: navigation during initial/retry/target requests cannot resurrect old results");
  const early = await openFixture(browser, bundle, { paused: false });
  await early.page.getByRole("button", { name: "分享海报", exact: true }).click();
  await early.page.getByRole("button", { name: "复制文案", exact: true }).waitFor();
  await early.page.evaluate(() => {
    history.pushState({}, "", "/video/BV1TXoWBsEGc/?p=1");
    // A GM menu click can precede the manager URL event and DOM refresh.
    window.openFixturePanel();
  });
  await early.page.waitForTimeout(500);
  assert.equal(await early.page.evaluate(() => window.fixture.pauseCount), 2, "entry immediately captures changed part before navigation observer runs");
  assert.equal(await early.page.getByRole("dialog").count(), 1);
  assert.equal(await early.page.evaluate(() => window.fixture.playCount), 0);
  await early.context.close();
  console.log("PASS: entry checks navigation synchronously before reusing a panel");
  const stale = await openFixture(browser, bundle, { paused: false });
  await stale.page.getByRole("button", { name: "分享海报", exact: true }).click();
  await stale.page.getByRole("button", { name: "复制文案", exact: true }).waitFor();
  await stale.page.evaluate(() => {
    history.pushState({}, "", "/video/BV1TXoWBsEGc/?p=1");
    document.querySelector('[aria-label="复制文案"]').click();
  });
  assert.equal(await stale.page.evaluate(() => window.fixture.copiedText.length), 0, "navigation invalidates an export before the manager event");
  await stale.page.waitForTimeout(350);
  assert.equal(await stale.page.getByRole("dialog").count(), 0);
  await stale.context.close();
  console.log("PASS: export rejects stale capture before navigation event delivery");
  const retryStale = await openFixture(browser, bundle, { coverFailed: true });
  await retryStale.page.getByRole("button", { name: "分享海报", exact: true }).click();
  await retryStale.page.getByRole("button", { name: "重试", exact: true }).waitFor();
  const beforeRetry = await retryStale.page.evaluate(() => window.fixture.requests.length);
  await retryStale.page.evaluate(() => {
    history.pushState({}, "", "/video/BV1TXoWBsEGc/?p=1");
    Array.from(document.querySelectorAll("button")).find(button => button.textContent === "重试").click();
  });
  assert.equal(await retryStale.page.evaluate(() => window.fixture.requests.length), beforeRetry, "stale retry never requests old capture resources");
  await retryStale.page.waitForTimeout(350);
  assert.equal(await retryStale.page.getByRole("dialog").count(), 0);
  await retryStale.context.close();
  console.log("PASS: retry rejects a capture invalidated before navigation event delivery");
  for (const paused of [true, false]) {
    for (const closing of ["button", "escape", "backdrop"]) {
      const closed = await openFixture(browser, bundle, { paused, coverFailed: true });
      const p = closed.page;
      await p.getByRole("button", { name: "分享海报", exact: true }).click();
      await p.getByRole("button", { name: "重试", exact: true }).waitFor();
      await p.evaluate(() => { window.fixture.delay = 150; window.fixture.coverFailed = false; });
      await p.getByRole("button", { name: "重试", exact: true }).click();
      if (closing === "button") await p.getByRole("button", { name: "关闭分享面板", exact: true }).click();
      else if (closing === "escape") await p.keyboard.press("Escape");
      else await p.getByRole("presentation").click({ position: { x: 2, y: 2 } });
      await p.waitForTimeout(700);
      assert.equal(await p.getByRole("dialog").count(), 0, "late retry cannot revive a closed panel");
      assert.equal(await p.evaluate(() => window.fixture.playCount), paused ? 0 : 1, closing + " restores only previously playing capture");
      assert.equal(await p.evaluate(() => window.fixture.paused), paused);
      assert.equal(await p.getByRole("button", { name: "分享海报", exact: true }).evaluate(button => button === document.activeElement), true);
      assert.deepEqual(closed.errors, []);
      await closed.context.close();
    }
  }
  console.log("PASS: all close paths preserve paused/playing state and discard late retry");
  const staleMarker = await openFixture(browser, bundle);
  await staleMarker.page.getByRole("button", { name: "分享海报", exact: true }).click();
  await staleMarker.page.getByRole("button", { name: "复制文案", exact: true }).waitFor();
  const beforeMarker = await staleMarker.page.evaluate(() => window.fixture.requests.length);
  await staleMarker.page.evaluate(() => {
    history.pushState({}, "", "/video/BV1TXoWBsEGc/?p=1");
    Array.from(document.querySelectorAll("button")).find(button => button.textContent === "标记当前时间").click();
  });
  assert.equal(await staleMarker.page.evaluate(() => window.fixture.requests.length), beforeMarker, "marker cannot validate a stale capture target");
  await staleMarker.page.waitForTimeout(350);
  assert.equal(await staleMarker.page.getByRole("dialog").count(), 0);
  await staleMarker.context.close();
  const replaced = await openFixture(browser, bundle, { paused: false });
  await replaced.page.getByRole("button", { name: "分享海报", exact: true }).click();
  await replaced.page.getByRole("button", { name: "复制文案", exact: true }).waitFor();
  await replaced.page.evaluate(() => {
    const replacement = document.createElement("video");
    replacement.play = async () => { window.fixture.replacementPlays = (window.fixture.replacementPlays ?? 0) + 1; };
    document.querySelector("video").replaceWith(replacement);
  });
  await replaced.page.getByRole("button", { name: "关闭分享面板", exact: true }).click();
  await replaced.page.getByRole("dialog").waitFor({ state: "detached" });
  assert.equal(await replaced.page.evaluate(() => window.fixture.playCount), 0);
  assert.equal(await replaced.page.evaluate(() => window.fixture.replacementPlays ?? 0), 0, "closing never resumes a replacement player");
  await replaced.context.close();
  console.log("PASS: stale marker requests rejected and replacement player never resumed");
  // Navigation may occur after an action starts but before its PNG is ready,
  // with the manager URL event still pending. Exercise the browser canvas
  // boundary, never the panel's private methods or state.
  for (const action of ["复制海报", "下载海报 PNG"]) {
    const encoded = await openFixture(browser, bundle, { paused: false });
    const p = encoded.page;
    let downloads = 0;
    p.on("download", () => { downloads++; });
    await p.getByRole("button", { name: "分享海报", exact: true }).click();
    await p.getByRole("button", { name: action, exact: true }).waitFor();
    await p.evaluate(() => {
      const original = HTMLCanvasElement.prototype.toDataURL;
      HTMLCanvasElement.prototype.toDataURL = function (...args) {
        const result = original.apply(this, args);
        if (this.width === 1080 && this.height === 1440) {
          history.pushState({}, "", "/video/BV1xx411c7mD/?p=1");
          window.fixture.encodingNavigated = true;
        }
        return result;
      };
    });
    await p.getByRole("button", { name: action, exact: true }).click();
    await p.waitForFunction(() => window.fixture.encodingNavigated === true);
    await p.getByRole("dialog").waitFor({ state: "detached" });
    assert.equal(await p.evaluate(() => window.fixture.copiedTypes.length), 0, action + " cannot write an encoded poster after navigation");
    assert.equal(await p.evaluate(() => window.fixture.copiedText.length), 0, action + " cannot fall back to stale share text after navigation");
    assert.equal(downloads, 0, action + " cannot download an encoded poster after navigation");
    assert.equal(await p.evaluate(() => window.fixture.playCount), 0, action + " does not restore playback for a new video");
    assert.deepEqual(encoded.errors, []);
    await encoded.context.close();
  }
  console.log("PASS: navigation at PNG completion blocks stale copy and download");

} finally {
  await browser.close();
}
