# Matt skills workflow

## Installed source

- Repository: `mattpocock/skills`
- Upstream commit: `8b78b531ab965735c5dc74f6f7a219e1e37326df`
- Plugin version at that commit: `1.2.3`
- Scope: project-local `.agents/skills/`

The selected directories are copied from upstream and should not be edited in place. Put project adaptations in `AGENTS.md` or `docs/agents/` so a later upstream refresh cannot erase them.

## Main flow

1. `grill-with-docs`: settle the idea as a decision tree and record only resolved vocabulary or durable decisions.
2. `handoff` + `prototype`: optional detour when a visual or runnable artifact is required to answer one question. The first poster-style exploration belongs here.
3. `to-spec`: synthesize the approved conversation into `.scratch/<feature>/spec.md`.
4. `to-tickets`: split the approved spec into one dependency-aware Markdown file per tracer-bullet slice.
5. `implement`: execute one approved ticket in a fresh context using `tdd`, then run `code-review`.

Use `ask-matt` when the next workflow step is unclear. `domain-modeling`, `codebase-design`, and `diagnosing-bugs` provide supporting vocabulary or focused diagnosis.

## Installed skills

- `setup-matt-pocock-skills`
- `ask-matt`
- `grill-with-docs`
- `grilling`
- `handoff`
- `writing-for-agents`
- `prototype`
- `to-spec`
- `to-tickets`
- `implement`
- `tdd`
- `code-review`
- `domain-modeling`
- `codebase-design`
- `diagnosing-bugs`

## Project gates

- `.scratch/**/idea.md` captures input and open decisions; it never authorizes implementation.
- Publish a `spec.md` only after the owner confirms the grilling frontier is empty.
- Publish tickets only after the owner approves the spec and the ticket breakdown.
- Treat visual styling as its own prototype/design pass; do not silently turn an exploratory mockup into production UI.
