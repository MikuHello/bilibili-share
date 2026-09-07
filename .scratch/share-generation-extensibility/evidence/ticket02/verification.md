# Ticket 02 verification

Baseline: 8ba8bdd. Implementation: 09befc0.

- Red: `npm test -- tests/share-text.test.ts` failed the new independent Markdown compact override assertion (24 passed, 1 failed). Old output was the fixed title link; expected output used the configured bold title, link label and zero-stat condition.
- Green: same file passed 25/25 after shared-template integration; expanded regression file passed 27/27.
- `npm run check`: passed.
- `npm test`: all 7 files / 95 tests passed.
- `BSP_PLAYWRIGHT_MODULE=/Users/mikuhello/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs node scripts/verify-markdown-templates.mjs`: passed 12 scenarios; results in markdown-report.json.
- `BSP_EVIDENCE_DIR=.scratch/share-generation-extensibility/evidence/ticket02/plain-regression BSP_PLAYWRIGHT_MODULE=/Users/mikuhello/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs node scripts/verify-share-text-templates.mjs`: passed 18 scenarios; results in plain-regression/template-report.json.
- Browser script initially used an incorrect expected timestamp of 00:01:23 for 83 seconds; corrected to the established 01:23 display. This was a test expectation correction, not a product defect.
- Both scripts compile real production entry points with developer configuration replacements through esbuild; dist/version updates are deferred to the final batch build.
- Parallel Standards review: no documented violation, one optional minor Duplicated Code suggestion for the shared configuration-injection build snippet. No blocking finding.
- Parallel Spec review: no actionable spec mismatch or scope expansion.

Fixtures control external Bilibili page/API, GM and clipboard boundaries. Actual PNG encoding and clipboard-boundary payload were exercised. No live userscript-manager claim.
