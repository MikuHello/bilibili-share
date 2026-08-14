import { build } from "esbuild";

const header = `// ==UserScript==
// @name         Bilibili 分享海报
// @namespace    https://github.com/mikuhello/bilibili-share
// @version      0.1.0
// @description  在 Bilibili 标准视频页生成使用已校验分享落点的 A 主题海报
// @match        https://www.bilibili.com/video/BV*
// @grant        GM_xmlhttpRequest
// @grant        window.onurlchange
// @connect      api.bilibili.com
// @connect      b23.tv
// @connect      *.hdslb.com
// @run-at       document-idle
// ==/UserScript==`;

await build({
  entryPoints: ["src/index.ts"],
  outfile: "dist/bilibili-share-poster.user.js",
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["chrome120", "edge120"],
  legalComments: "none",
  banner: { js: header },
  minify: false,
  sourcemap: false,
});
