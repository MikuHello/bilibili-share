# Bilibili Share

A Tampermonkey userscript that adds a “生成海报” action beside Bilibili Web's official share control. It pauses the current standard video, captures one stable generation snapshot, validates an anonymous `b23.tv` short-link redirect, and previews a local A “报刊信息卡” or B “沉浸封面” poster. Export actions cover copy poster, download 1080×1440 PNG, copy share text, and best-effort combined poster-and-text clipboard copy.

The poster, QR code, and visible link always use one share target. A validated `b23.tv` URL is preferred; any request, response, or redirect mismatch falls back visibly to the canonical `https://www.bilibili.com/video/<BV>/` URL without blocking preview or download. Part sharing and timestamp sharing build `?p=` and `?t=` targets from the same snapshot; detailed and Markdown share text are independent options and are remembered between panels. Current ticket state lives in [`.scratch/bilibili-share-poster/issues/`](.scratch/bilibili-share-poster/issues/).

## Install

1. Install Tampermonkey in a supported Chrome or Edge release.
2. Open [`dist/bilibili-share-poster.user.js`](dist/bilibili-share-poster.user.js) and install it manually in Tampermonkey.
3. Visit a standard Bilibili video URL shaped like `https://www.bilibili.com/video/BV.../`.
4. Use “生成海报” to open the poster preview and download the PNG.

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
- Product source: [`.scratch/bilibili-share-poster/idea.md`](.scratch/bilibili-share-poster/idea.md)
- Approved visual spec: [`.scratch/bilibili-share-poster/spec.md`](.scratch/bilibili-share-poster/spec.md)
- Matt workflow: [`docs/agents/skills.md`](docs/agents/skills.md)
