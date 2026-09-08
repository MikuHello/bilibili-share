# Issue tracker: Local Markdown

Issues and specs for this repository live as Markdown files in `.scratch/`.

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`.
- Unsettled input is `.scratch/<feature-slug>/idea.md`; it is not an approved spec.
- The approved spec is `.scratch/<feature-slug>/spec.md`.
- Implementation issues are one file per ticket at `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01`.
- Record workflow state as a `Status:` line near the top of each issue file.
- Append later discussion under a `## Comments` heading instead of rewriting its history.

## Generated artifacts and completed work

- Keep idea/spec/approval/issue records and one final acceptance summary per delivery. Put test inputs in `tests/fixtures/` with provenance; product documentation images belong in `docs/images/`.
- Write screenshots, temporary bundles, measurements and raw logs to ignored `artifacts/`. Do not keep multiple copies under historical tickets. Existing `.scratch/**/evidence/` output paths are also ignored; new acceptance summaries belong outside generated-output directories.
- On completion, retain resolved decisions and the final summary, then remove superseded prototypes, per-step reports and duplicate outputs from the working tree. Before removing a referenced file, migrate required fixtures and replace navigable historical references with links to a fixed Git commit. Keep the archive entry point in `.scratch/ARCHIVE.md`; do not rewrite Git history to perform routine cleanup.

## Skill operations

When a skill says "publish to the issue tracker", create or update the corresponding file under `.scratch/<feature-slug>/`.

When a skill says "fetch the relevant ticket", read the exact local path or issue number supplied by the owner.

For ticket dependencies, use a `Blocked by:` line containing ticket numbers. A ticket is ready only when every listed blocker is complete.

For externally supplied requests routed through `triage`, use the local fields and role mapping in [triage-labels.md](triage-labels.md). External PRs are not an automatic request surface in this local tracker; explicitly requested remote work must name its repository and scope.
