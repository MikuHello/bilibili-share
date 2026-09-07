# Ticket 01 verification

- Production base: eb8cdcc; implementation: 6fcd8db.
- TDD observed failures before changes: short URL accepted by poster; noncanonical identities accepted; P2 timestamp without part; uppercase av labels; browser preview link margin 14px rather than 0px. Each corresponding slice then passed.
- Unit suite: 64 passed (one obsolete duplicate short/fallback text test removed). TypeScript and production build pass.
- Chromium 151.0.7922.34: unchanged production entry/panel with controlled external GM and clipboard boundaries. Ten scenarios passed (report.json), including default, P2/time, clearing markers, P1/time, below-one-second, unknown part, cover failure, in-flight export and reopening.
- Six actual generated PNGs decoded by Apple Vision using verify-poster-qr.swift; all match their expected full targets. Text, Markdown and combined payload match those targets. Real clipboard paste is not proven by this recorder (Ticket 05).
- No short-link requests at generation or marked update. Preview link margin is zero. Host remains a controlled integration fixture, not an installed Tampermonkey acceptance run.
- Obsolete tests that depended on delayed short-link requests were removed; completion and snapshot assertions remain. Ticket 03 covers pending render/version consistency after stable updates are introduced.

## Standards

No documented-standard violations or actionable smells. AGENTS.md, CONTEXT.md, docs/agents/{skills,issue-tracker,domain}.md checked; no ADR directory. Approved preview spacing change respects the visual scope gate. Removed short-link wrappers simplify responsibilities.

## Spec

No missing Ticket 01 requirements, scope creep or implementation errors found. Canonical target flows into poster/QR/text/Markdown/combined representation; lowercase av, single line separation, required identity validation and option reset remain. Later tickets excluded. Reviewers inspected code without rerunning tests.

Findings: Standards 0 (none); Spec 0 (none).
