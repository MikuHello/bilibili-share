import { build } from "esbuild";

const development = process.argv.includes("--dev");

const header = `// ==UserScript==
// @name         Bilibili 分享海报${development ? " · 开发调试" : ""}
// @namespace    https://github.com/mikuhello/bilibili-share
// @version      0.1.0
// @description  在 Bilibili 标准视频页生成 A/B 主题分享海报、复制分享文案与组合剪贴板内容
// @match        https://www.bilibili.com/video/BV*
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        window.onurlchange
// @connect      api.bilibili.com
// @connect      b23.tv
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
  banner: { js: header },
  minify: false,
  sourcemap: false,
});
