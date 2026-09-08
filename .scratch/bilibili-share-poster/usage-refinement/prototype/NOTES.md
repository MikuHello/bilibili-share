# Throwaway visual prototype — cover-led editorial posters

Question: Which cover-driven palette and information hierarchy makes the poster feel like a considered editorial object, while the share panel and entry remain readable and familiar?

Run from the repository root:

```sh
python3 -m http.server 8771 --bind 127.0.0.1 --directory .scratch/bilibili-share-poster/usage-refinement
```

Open http://127.0.0.1:8771/prototype/?variant=A . One route, three structurally different variants; bottom arrows and keyboard left/right change the URL. State and derived palette are surfaced in the bottom prototype bar.

- A: enlarged blurred cover behind a restrained translucent layer; full-width cover leads, serif title follows.
- B: extracted cover palette; serif headline precedes image, footer sits on a sampled color field, full link is an inverted strip.
- C: deep sampled ink; sans-serif title and full uncropped cover sit side-by-side, with a larger footer below.

Design plan: the cover is the subject, creator credit and stats are the attribution. The page only helps share it. Panel colors are neutral white #ffffff / graphite #24272b with readable ink #232629 / #eef0f2 and link blue #007fac / #66d5ff. Poster colors are not fixed: dominant pixel bucket, saturated common bucket, derived light base, dark ink and soft field all come from the actual cover. Chinese Songti/SimSun is the editorial display role; PingFang/Microsoft YaHei is the information role; system monospace labels video identifiers and full URLs. A uses image atmosphere as signature; B a title-first masthead; C a compact image/text spread. No invented publication labels or decorative issue numbers.

Controls: independent light/dark panel toggle; mark sample P1 and 01:23 (immediate DOM update); detailed copy; in-memory local cover upload, never sent or persisted; restore cover; hide/open share panel from simulated toolbar. All copy/download actions show explicitly simulated floating feedback (120ms, reduced-motion supported); no clipboard writes, downloads or external mutations. Combination-copy button is present for layout comparison only and does not settle its feasibility.

Fixture: cover, official Bilibili logo and icons, identifiers, creator, historical statistics and QR assets reused from the previous redesign validation prototype. The same complete original title automatically wraps in all variants, with no manual headline/subtitle split. Each canvas has a fixed 3:4 aspect ratio; mark toggles affect only links and QR, never poster text. The page scroll area reserves a separate bottom dock so prototype controls cannot cover product actions. QR flags follow that prototype's original sample target: canonical https://www.bilibili.com/video/BV1TXoWBsEGc/ with optional p=1 / t=83. These QR assets are historical fixtures, not freshly decoded in this task. Uploaded cover changes only imagery/palette; all metadata and QR remain the labeled sample. No claim of current statistics. No new remote assets or font downloads.

Limits: visual exploration, not an approved spec or production implementation. Host toolbar is simulated, not injected into Bilibili. The dynamic color algorithm is a prototype and not a proven accessible production palette algorithm. Typeface availability differs by OS. PNG export fidelity and font-loading performance are not tested here. The initial cover is pale; upload warm/dark/saturated covers to challenge the designs. Archive on a throwaway branch through the root workflow; do not promote prototype implementation into production.
