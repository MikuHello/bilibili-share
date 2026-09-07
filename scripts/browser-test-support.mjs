import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { build } from "esbuild";

// External browser/GM boundaries only; production modules are bundled unchanged.
export async function browserRuntime() {
  const require = createRequire(import.meta.url);
  let modulePath = process.env.BSP_PLAYWRIGHT_MODULE;
  if (!modulePath) {
    try { modulePath = require.resolve("playwright"); }
    catch { throw new Error("Set BSP_PLAYWRIGHT_MODULE to the installed Playwright entry point."); }
  }
  return import(pathToFileURL(resolve(modulePath)).href);
}

export async function productionBundle() {
  const result = await build({ entryPoints: ["src/index.ts"], bundle: true, write: false, format: "iife", target: "es2022" });
  return result.outputFiles[0].text;
}

export async function openFixture(browser, bundle, overrides = {}) {
  const cover = await readFile(".scratch/bilibili-share-poster/redesign/prototype/cover.jpg");
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, ...overrides.context });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.route("https://www.bilibili.com/**", route => route.fulfill({ contentType: "text/html", body: `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;background:#f6f7f8;font-family:Arial,sans-serif}main{margin:80px}video{width:640px;height:360px}#arc_toolbar_report{display:flex;gap:24px}</style></head><body><main><h1>Production userscript integration fixture</h1><video></video><div id="arc_toolbar_report"><div class="toolbar-left-item-wrap"><div class="video-share-wrap">分享</div></div></div></main></body></html>` }));
  await page.goto(`https://www.bilibili.com/video/BV1TXoWBsEGc/?p=${overrides.part ?? 2}`);
  await page.evaluate(({ coverBase64, overrides }) => {
    window.fixture = {
      coverFailed: false, metadataFailed: false, clipboardFailed: false,
      combinedFailed: false, delay: 0,
      requests: [], copiedText: [], copiedTypes: [], preferences: {},
      paused: true, time: 83.9, playCount: 0, pauseCount: 0,
      title: "35min 正念冥想｜把身体作为方法｜从内耗到感受｜此时此地此身｜聆听身体｜回归当下",
      uploader: "妮卡的房间NiCalm", stats: { view: 178000, like: 2664, coin: 1285, favorite: 6657 },
      ...overrides,
    };
    const f = window.fixture;
    const player = document.querySelector("video");
    Object.defineProperties(player, {
      paused: { get: () => f.paused }, ended: { get: () => false },
      currentTime: { get: () => f.time, set: value => { f.time = value; } },
      pause: { value: () => { f.paused = true; f.pauseCount++; } },
      play: { value: async () => { f.paused = false; f.playCount++; } },
    });
    window.GM_getValue = (key, fallback) => f.preferences[key] ?? fallback;
    window.GM_setValue = (key, value) => { f.preferences[key] = value; };
    window.GM_registerMenuCommand = (_, callback) => { window.openFixturePanel = callback; };
    window.GM_xmlhttpRequest = details => {
      f.requests.push({ url: details.url, method: details.method });
      const url = new URL(details.url);
      const timer = setTimeout(() => {
        if (url.pathname === "/x/web-interface/view") {
          details.onload({ status: 200, responseText: JSON.stringify(f.metadataFailed ? { code: -1 } : { code: 0, data: {
            bvid: url.searchParams.get("bvid"), aid: 116422017488201,
            title: f.title, pic: "https://i0.hdslb.com/bfs/archive/fixture.jpg", owner: { name: f.uploader }, stat: f.stats,
            pages: f.unknownPart ? [] : [{ page: 1, part: "正片" }, { page: 2, part: "优化版" }],
          } }) });
        } else if (url.hostname.endsWith("hdslb.com")) {
          if (f.coverFailed) { details.onerror({ error: "Controlled cover failure" }); return; }
          const bytes = Uint8Array.from(atob(f.coverBase64 ?? coverBase64), c => c.charCodeAt(0));
          details.onload({ status: 200, response: new Blob([bytes], { type: f.coverMime ?? "image/jpeg" }) });
        } else { details.onerror({ error: "Unexpected fixture request" }); }
      }, f.delay);
      return { abort: () => clearTimeout(timer) };
    };
    if (!f.realClipboard) Object.defineProperty(navigator, "clipboard", { value: {
      writeText: async text => { if (f.clipboardFailed) throw Error("Controlled clipboard failure"); f.copiedText.push(text); },
      write: async items => {
        if (f.clipboardFailed || f.combinedFailed) throw Error("Controlled clipboard failure");
        f.copiedTypes.push(items.flatMap(item => item.types));
      },
    } });
  }, { coverBase64: cover.toString("base64"), overrides: { ...overrides, context: undefined } });
  await page.addScriptTag({ content: bundle });
  await page.getByRole("button", { name: "生成海报", exact: true }).waitFor();
  return { page, context, errors };
}
