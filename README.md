# Bilibili Share

A Tampermonkey userscript that adds a “分享海报” action beside Bilibili Web's official share control. It pauses the current standard video, captures one stable generation snapshot, derives a canonical share target, and previews the approved B3 poster with a blurred background derived from its cover. Export actions cover copy poster, download 1080×1440 PNG, separate plain-text and Markdown copy. Combined copy has been removed after actual QQ paste testing produced only an image; copy the poster and text separately.

The poster, QR code, and visible link always use one share target. All outputs use the canonical `https://www.bilibili.com/video/<BV>/` URL, with no short-link requests. “标记当前分P” and “标记当前时间” build `?p=` and `?t=` targets from the same snapshot. They change the poster QR code and visible link; poster content remains unchanged. “详细信息” is remembered, while Markdown is a separate copy action. The panel follows the actual page light/dark mode; the poster keeps its own palette.

If the cover fails, valid plain text and Markdown remain available with a retry action; image exports stay disabled. Current ticket state lives in [the refinement plan](.scratch/bilibili-share-poster/usage-refinement/ticket-breakdown.md).

## Install

1. Install Tampermonkey in a supported Chrome or Edge release.
2. Open [`dist/bilibili-share-poster.user.js`](dist/bilibili-share-poster.user.js) and install it manually in Tampermonkey.
3. Visit a standard Bilibili video URL shaped like `https://www.bilibili.com/video/BV.../`.
4. Use “分享海报” to open the poster preview and download the PNG.

The userscript deliberately declares no remote update or download URL.

## Develop

Requires Node.js 20 or newer.

```sh
npm install
npm test
npm run check
npm run build
```

- Maintained TypeScript source: [`src/`](src/)
- Node behavior tests: [`tests/`](tests/)
- Directly installable build: [`dist/bilibili-share-poster.user.js`](dist/bilibili-share-poster.user.js)
- Product source: [refinement idea](.scratch/bilibili-share-poster/usage-refinement/idea.md)
- Approved implementation spec: [refinement spec](.scratch/bilibili-share-poster/usage-refinement/spec.md)
- Matt workflow: [`docs/agents/skills.md`](docs/agents/skills.md)

## Browser verification

Install Playwright separately in the test environment, or set `BSP_PLAYWRIGHT_MODULE` to an existing Playwright module entry point, then run `npm run test:browser`. The runner builds and exercises the exact distributable bundle with controlled GM/network and player boundaries; clipboard success checks additionally use the actual Chromium clipboard. They do not substitute for Tampermonkey installation verification. On macOS, the QR checks use the native Vision decoder.

Release 0.3.5: [Video honor bookmarks, floating explanations and verified delivery](.scratch/bilibili-share-poster/video-honors/evidence/final/verification.md).
