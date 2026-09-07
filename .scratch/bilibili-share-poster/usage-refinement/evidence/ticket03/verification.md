# Ticket 03 verification

Status: passed; implementation 62a8024 plus review naming cleanup.

## Behavior and evidence

- Stable control elements survive detail and marker changes. Details only replace share-text contents; target changes prepare QR offscreen, then update QR/link together. Static cover/title/stat nodes stay attached. All image and text exports remain disabled until the latest target completes; option pills immediately reflect the latest desired state and remain operable during QR generation.
- Removed the serial 140ms exit wait. Late success or failure checks target version and current captured page. Closing clears snapshot/model/poster ownership and prevents later feedback or clipboard/download initiation.
- WeakMap PNG cache owns successful or pending encoding by poster identity; new cover/snapshot/layout creates a new poster, target updates explicitly invalidate, FontFaceSet completion/error invalidates font-dependent entries. Failed encoding removes only its own cache entry and can retry. Snapshot-owned blurred background reuse remains from ticket02.
- `races.json`: nine scenario groups, including intentionally reversed QR decode completion, immediate detail updates, export lock, target invalidation, exact PNG reuse, real FontFaceSet load, close, fresh snapshot, duplicate export dispatch, controlled encoding failure/retry, QR failure/resource retry, navigation and deliberately suspended SVG-image decode during export/close. Two actual exported PNGs decoded through Apple Vision and matched current targets.
- `targets/report.json`: ten canonical-target scenarios, six actual exported PNG QR decodes; all outputs agree. `lifecycle.txt`: all ten inherited lifecycle groups passed, including initial/retry/target navigation, immediate reopen, captured playback, replaced player and navigation during encoding/combined fallback. Target delay now uses the actual browser image decode boundary instead of removed short-link requests.
- `npm run check`, `npm test` (68 tests), `npm run build` passed. Final naming cleanup was typechecked and rebuilt. Browser performance and race scripts rerun after cache/button cleanup.

## Controlled before/after measurements

Chromium 151.0.7922.34, headless, 1280×900, unchanged poster/cover fixture and production entry bundle. Three samples per version; each metadata and cover GM callback waits 40ms (two requests per open). Before is ticket02 baseline92dc0dd; after is ticket03. Timings include Playwright interaction/readiness overhead and UI entrance animation. This is neither live Bilibili latency nor an installed Tampermonkey session; it establishes local work removed, not a real-world speed guarantee. Final timing run had no parallel test browser. No p95 estimate.

| Stage | Before, ms (3 samples) | After, ms (3 samples) |
| --- | --- | --- |
| open | 206.7 / 162.6 / 160.9 | 179.2 / 164.2 / 161.2 |
| details | 146.4 / 249.9 / 252 | 231.1 / 231.2 / 230.4 |
| marker | 173.3 / 189.6 / 174.8 | 33.7 / 35.3 / 37 |
| first-export | 111.5 / 110.2 / 109.8 | 103.7 / 103.6 / 103.3 |
| repeat-export | 91.9 / 76.8 / 76.1 | 25.5 / 26.6 / 26.8 |

Marker work decreased from seven image decode calls to one QR decode, with one QR canvas and zero requests in both runs. Details had zero canvas/decode/network work before and after, but now preserve every control element. Repeat export decreased from one PNG encoding/decode to zero; its bytes are reused exactly. Opening retains two network calls and two canvases, with no claim of network speedup. First export still requires PNG encoding.

Raw `before.json` and `after.json` include long-task and layout-shift observations. No long tasks were observed in these small samples; this is not proof none can occur. Both runs still report small recent-input layout shifts from existing UI behavior; feedback layout removal belongs to ticket06, and ticket03 does not claim zero total shifts.

## Standards

Hard documented-standard violations: 0. One low-priority heuristic naming suggestion: `rebuildPosterForOptions` no longer rebuilt the poster. Renamed to `updateShareTargetForOptions`. Stable controls/version checks/cache use the existing boundary; no general architecture layer added. The review did not rerun tests.

## Spec

No actionable findings. No missing ticket03 requirements, scope expansion or implementation errors found. The review confirmed controls/static content preservation, removal of serial delay, export consistency, version/close guards, PNG retry and font/target invalidation, and that measurements disclose controlled-environment limits. Tickets04–07 were not treated as ticket03 omissions. The review did not rerun tests.

Standards: 0 outstanding (1 naming suggestion resolved). Spec: 0 findings.
