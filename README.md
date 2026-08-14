# Bilibili Share

A Tampermonkey userscript that adds a “生成海报” action beside Bilibili Web's official share control. Ticket 01 delivers the default A “报刊信息卡” path: pause the current standard video, capture one stable generation snapshot, preview a local poster, and download the same poster as a 1080×1440 PNG.

The current slice uses the canonical `https://www.bilibili.com/video/<BV>/` URL as the single share target. Short links, image copy, share text, part/timestamp targets, and theme B remain in later tickets under [`.scratch/bilibili-share-poster/issues/`](.scratch/bilibili-share-poster/issues/).

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
