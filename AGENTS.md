# Bilibili Share

## Agent skills

### Issue tracker

Track product work as local Markdown under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Domain docs

Use the single-context layout: root `CONTEXT.md` plus `docs/adr/`, created only when resolved vocabulary or durable decisions exist. See `docs/agents/domain.md`.

### Matt workflow

For a new idea, run `grill-with-docs`; use `handoff` and `prototype` only for a visual or runnable question; then run `to-spec`, `to-tickets`, and one fresh `implement` session per approved ticket. See `docs/agents/skills.md`.

The idea and visual spec are approved; implementation is tracked in `.scratch/bilibili-share-poster/issues/`. Read `idea.md`, `spec.md`, and the active ticket before discussing or changing behavior. Preserve the scope gate: a brief is not an approved spec, and visual styling changes still require an explicit design pass.
