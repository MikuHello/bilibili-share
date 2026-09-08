# Triage roles

Use upstream default role names for externally supplied requests. Local Markdown stores the category as `Category:` and the triage role as `Triage:`. Keep `Status:` for implementation progress.

| Upstream role | Local value | Meaning |
| --- | --- | --- |
| needs-triage | needs-triage | Awaiting evaluation |
| needs-info | needs-info | Awaiting information from the reporter |
| ready-for-agent | ready-for-agent | Specified sufficiently for agent work |
| ready-for-human | ready-for-human | Requires human implementation |
| wontfix | wontfix | Will not be implemented |

Categories use `bug` and `enhancement` unchanged. A triaged request has one category and one triage role. Generated, approved implementation tickets already have their readiness recorded and do not need another triage pass.
