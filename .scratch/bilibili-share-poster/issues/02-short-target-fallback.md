# 02 — 使用已校验短链并诚实降级

**What to build:** 默认分享链路优先使用经过落点校验的 `b23.tv` 短链；短链不可用、不可信或与 generation snapshot 不一致时，观看者仍能用同一规范长链接生成海报，并清楚看到降级原因。

**Blocked by:** 01 — 生成并下载默认 A 主题海报

**Status:** complete

- [x] 打开分享面板时通过集中式适配器获取当前公开视频信息和匿名短链，并同时校验 HTTP 状态、业务状态及必需字段。
- [x] 生成的短链在使用前被解析并校验为预期 BVID 与当前启用的分P/时间参数；重定向加入的跟踪参数不改变目标身份判断。
- [x] 短链请求失败、响应无效或落点不符时，海报、二维码、可见链接和 share text 全部统一使用同一规范长链接。
- [x] 降级时面板在预览与文案区域之间显示明确提示，不把长链接伪装成短链，也不阻止仍然有效的导出路径。
- [x] 重试保留原始 BVID、分P和播放位置，只重新获取元数据、封面和短链；重试不得悄悄改用新的播放位置。
- [x] userscript 在打开、复制或下载时不调用 Bilibili 分享计数接口。
- [x] 适配器的业务错误、缺字段、短链解析不匹配和规范长链接降级均有自动化测试；真实端点验证不依赖或记录登录凭据。

## Comments

### 2026-08-14 — implementation evidence

- TDD seam: public video-response parsing and share-target selection are pure TypeScript boundaries. Red was observed for business errors, missing required fields, opaque short-link parsing, redirect mismatch, invalid landing, canonical fallback, and the poster's validated-short-target path. Final `npm test` passes 32 assertions; `npm run check`, `npm run build`, and `git diff --check` pass.
- Runtime loading now goes through one `fetchGenerationResources` adapter. Metadata, cover, short-link POST, and redirect HEAD requests explicitly set `anonymous: true`; no login cookie, token, or personal identifier is read or persisted.
- A credential-free live check for `BV1xx411c7mD` returned metadata HTTP 200/business code 0 with every essential field present, then short-link HTTP 200/business code 0 and an opaque `b23.tv` URL. Its HEAD response was HTTP 302 to the expected BVID; unrelated tracking parameters were present and correctly excluded from identity comparison. The short token and redirect parameter values were not recorded.
- The userscript contains `x/share/click` only for anonymous short-link generation and contains no call to the share-count endpoint `x/web-interface/share/add`. Opening and retrying perform the network workflow; download performs no Bilibili request.
- A short-link failure is a ready-state fallback, not a generation blocker: preview, QR generation, visible link, and PNG download consume the same canonical target, while the panel labels it as a fallback and displays the reason. Ticket 04 owns creation/preview/copy of share text and is required to consume this same selected target rather than introduce a second destination.
- Retry continues to reuse the original `PlaybackCapture`; it refetches metadata, cover, and short link without reading a new playback position.

### 2026-08-14 — final code-review

- Spec axis: no remaining Ticket 02 findings after adapter-test and output-consistency remediation.
- Standards axis: no documented-standard violations. Review removed the forbidden separate `qrTarget` vocabulary, renamed a misleading validated-target variable, and centralized canonical-video identity parsing.
- Two low-priority judgement-call refactoring candidates remain for later pressure: consolidate the typed GM transport wrappers, and consider branded URL types if canonical/short/resolved target roles multiply.
