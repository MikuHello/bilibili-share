import { build } from "esbuild";
import { readFile } from "node:fs/promises";

const { version } = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const license = await readFile(new URL("../LICENSE", import.meta.url), "utf8");
const thirdPartyNotices = await readFile(new URL("../THIRD_PARTY_NOTICES.md", import.meta.url), "utf8");

const args = process.argv.slice(2);
const development = args[0] === "--dev";
const revision = development && args.length === 1 ? "1" : args[1] === "--revision" ? args[2] : undefined;
if (args.length && !(development && (args.length === 1 || args.length === 3 && args[1] === "--revision") && /^[1-9]\d*$/.test(revision ?? "") && Number.isSafeInteger(Number(revision)))) {
  throw new Error("Use npm run build for a release, or npm run build:dev [-- --revision <positive integer>] for a development build (default: dev.1).");
}
if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version)) {
  throw new Error("package.json version must be the release base X.Y.Z; development revisions are passed separately.");
}
const scriptVersion = development ? `${version}-dev.${revision}` : version;

const header = `// ==UserScript==
// @name         Bilibili 分享海报${development ? " · 开发调试" : ""}
// @namespace    https://github.com/mikuhello/bilibili-share
// @version      ${scriptVersion}
// @license      MIT
// @author       MikuHello
// @homepageURL  https://github.com/MikuHello/bilibili-share
// @supportURL   https://github.com/MikuHello/bilibili-share/issues
// @description  ${development ? `开发构建 ${scriptVersion} · ` : ""}在 Bilibili 标准视频页生成默认主题分享海报，复制海报、普通文案与 Markdown
// @match        https://www.bilibili.com/video/BV*
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        window.onurlchange
// @connect      api.bilibili.com
// @connect      hdslb.com
// @run-at       document-idle
// ==/UserScript==`;

await build({
  entryPoints: [development ? "src/dev/index.ts" : "src/index.ts"],
  outfile: development ? "dist/bilibili-share-poster.dev.user.js" : "dist/bilibili-share-poster.user.js",
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["chrome120", "edge120"],
  legalComments: "none",
  banner: { js: `${header}\n/*!\n${license.trim()}\n\n${thirdPartyNotices.trim()}\n*/` },
  minify: false,
  sourcemap: false,
});
