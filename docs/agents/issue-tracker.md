# Issue tracker: Local Markdown

Issues and specs for this repository live as Markdown files in `.scratch/`.

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`.
- Unsettled input is `.scratch/<feature-slug>/idea.md`; it is not an approved spec.
- The approved spec is `.scratch/<feature-slug>/spec.md`.
- Implementation issues are one file per ticket at `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01`.
- Record workflow state as a `Status:` line near the top of each issue file.
- Append later discussion under a `## Comments` heading instead of rewriting its history.

## Skill operations

When a skill says "publish to the issue tracker", create or update the corresponding file under `.scratch/<feature-slug>/`.

When a skill says "fetch the relevant ticket", read the exact local path or issue number supplied by the owner.

For ticket dependencies, use a `Blocked by:` line containing ticket numbers. A ticket is ready only when every listed blocker is complete.

For externally supplied requests routed through `triage`, use the local fields and role mapping in [triage-labels.md](triage-labels.md). External PRs are not an automatic request surface in this local tracker; explicitly requested remote work must name its repository and scope.
