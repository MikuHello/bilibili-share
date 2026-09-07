# Default poster maintenance

The panel continues to import `createPoster(model, snapshot)`, `updatePosterTarget(poster, target, isCurrent)` and `exportPosterPng(poster)` from `src/ui/posters.ts`.

- `src/domain.ts` prepares the poster model from the generation snapshot and the shared target. Text generation remains independent of cover availability.
- `src/ui/default-poster.ts` owns the default poster DOM, cover-derived appearance, offscreen text measurement, QR generation and target-node selectors. Its appearance promise cache belongs to each snapshot; rejected cover work is evicted. Styling and artwork remain in `poster-styles.ts` and `poster-assets.ts`.
- `src/ui/poster-png.ts` owns 1080×1440 PNG encoding and its per-element promise cache. It waits for fonts, invalidates on font-loading completion/error, and evicts failed encodings so exports can retry.
- `src/ui/posters.ts` coordinates target updates. The default layout prepares and decodes the QR offscreen, returning a synchronous DOM commit. The coordinator checks `isCurrent` after that work, then commits the QR/link and invalidates the PNG in the same synchronous step. A stale update changes neither the preview nor its cache.

Keep target-dependent DOM selectors in the default layout. Any additional preview mutation must invalidate the export cache when committed. Callers must keep exports disabled during target preparation and retain their generation/navigation guards around creation and clipboard/download completion, as the panel currently does. The export module encodes the already measured preview; it does not rebuild or remeasure the layout.

For behavior verification, use the public panel/export paths in `scripts/verify-update-races.mjs` (actual PNG QR decoding, cache reuse and invalidation, asynchronous races, failed cover recovery), `scripts/verify-update-performance.mjs` (preview stability and repeated export work), and `scripts/verify-b3-poster.mjs` (layout and image matrix). Set `BSP_EVIDENCE_DIR` to keep a separate evidence directory. `npm run test:browser` runs the complete delivery regression with the distributable bundle; controlled browser fixtures do not replace installation checks in a real userscript manager.
