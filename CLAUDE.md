# CPOA repository constitution

This repository holds CPOA, a public operating standard for Claude Code projects. CPOA is also applied to this repository itself.

## Project
Documentation only: no application code and no build step. Public under MIT. Readers are Claude Code users who adopt CPOA, so every file must make sense without private context.

## Sources of truth
1. `standard/CPOA.md` - the authoritative standard.
2. `onboarding/`, `templates/`, `patterns/`, `QUICKSTART.md` - what users follow or copy. Must agree with 1.
3. `README.md`, `examples/`, `tests/` - explain and illustrate 1 and 2.

When a lower source conflicts with a higher one, fix the lower one or surface the conflict.

## Routing
Main Claude works directly by default: README, examples, changelog, typos and formatting.

Specialists:
- `standards-reviewer` (read-only) - owns: *Is this change consistent with CPOA's own principles, without adding unnecessary context, delegation, permissions or governance?* Delegate to it before committing any change to `standard/`, `onboarding/`, `templates/`, `patterns/` or `QUICKSTART.md`.

Why this agent exists: the session that writes a change should not be the only one that approves it. A separate context gives an independent reading, and read-only access keeps the review from turning into editing. It is the first agent added by applying CPOA to itself. Remove it if it stops catching real problems.

## Responsibility boundaries
| Area | Owner | Question owned |
|---|---|---|
| Consistency of framework changes | `standards-reviewer` | Does this change follow CPOA's own principles? |
| Writing and editing files | Main Claude | How should the text say it? |
| Principle changes, releases, publishing | Maintainer | Should CPOA change, and should this ship? |

Agents do not fill another owner's assessment. Preserve meaningful disagreement.

## Permissions
`standards-reviewer` can read files and run read-only git commands, nothing else. The limit is enforced by `.claude/hooks/standards-reviewer-guard.mjs`, registered in `.claude/settings.json`, not by the prompt. The guard needs Node.js. Hooks in an agent's own frontmatter did not run when tested, so do not move the guard there. Respect blocked actions; do not bypass them through another tool, script, MCP or indirect route.

## Writing rules
- English, short plain sentences.
- No em dashes or en dashes. Use a hyphen with spaces, a comma or two sentences.
- Changes to the standard update `CHANGELOG.md` (see `CONTRIBUTING.md`).

## Git
- Branch and pull request for changes to framework files. Typo fixes may go straight to `main`.
- Never force-push.

## Human decisions
- Changing a principle, releasing a version, tagging and publishing.
- Adding another agent, skill or hook to this repository.
