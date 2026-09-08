# Bilibili Share

This file is the single project entry point for agents. Matt skills are the required engineering workflow; supporting tools operate within that workflow.

## Start here

1. For every engineering task, read `.agents/skills/ask-matt/SKILL.md` and route the request using `docs/agents/skills.md`.
2. Read `CONTRIBUTING.md` and `docs/development.md` before changes, builds or release work.
3. Before product behavior changes, read `CONTEXT.md`, relevant ADRs and the active local idea/spec/ticket. Domain layout: `docs/agents/domain.md`. Issue operations: `docs/agents/issue-tracker.md`.
4. Work from the current request and active ticket. Use `.scratch/` for active temporary work only; cleanup on completion follows `docs/agents/issue-tracker.md`.

## Skills ownership

Project skills under `.agents/skills/` are vendored upstream source. For installing or updating them, follow `docs/agents/skills.md` and `.agents/matt-skills.lock.json`; keep project adaptations outside the upstream copies. Skill updates do not replace the owner's decisions or existing approvals.
