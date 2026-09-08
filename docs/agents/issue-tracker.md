# Issue tracker: Local Markdown

Active issues and specs live as temporary Markdown files in `.scratch/` (Git-ignored). The current explicit maintenance request can serve as the work item when it already defines the scope and acceptance criteria.

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`.
- Unsettled input is `.scratch/<feature-slug>/idea.md`; it is not an approved spec.
- The approved spec is `.scratch/<feature-slug>/spec.md`.
- Implementation issues are one file per ticket at `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01`.
- Record workflow state as a `Status:` line near the top of each issue file.
- Append later discussion under a `## Comments` heading instead of rewriting its history.

## Generated artifacts and completed work

- Keep only active working notes under `.scratch/`. On completion, remove temporary ideas, specs, tickets, acceptance notes and historical archives; do not create an archive index or replacement archive directory.
- Keep durable product decisions in `CONTEXT.md` or ADRs when needed. Put release changes and verification results in the commit or release description.
- Test inputs belong in `tests/fixtures/` with provenance; product documentation images belong in `docs/images/`.
- Screenshots, temporary bundles, measurements and raw logs belong in ignored `artifacts/`; remove obsolete generated output at completion.
- Remove stale documentation links when deleting temporary files. Routine cleanup does not rewrite Git history.

## Skill operations

When a skill says "publish to the issue tracker", create or update the corresponding file under `.scratch/<feature-slug>/`.

When a skill says "fetch the relevant ticket", read the exact local path or issue number supplied by the owner.

For ticket dependencies, use a `Blocked by:` line containing ticket numbers. A ticket is ready only when every listed blocker is complete.

For externally supplied requests routed through `triage`, use the local fields and role mapping in [triage-labels.md](triage-labels.md). External PRs are not an automatic request surface in this local tracker; explicitly requested remote work must name its repository and scope.
