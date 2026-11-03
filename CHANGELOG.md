# Changelog

## [Unreleased]

### Added
- Claude Code plugin. Install with `/plugin marketplace add donrra/CPOA` and `/plugin install cpoa@cpoa`.
- `/cpoa:audit`: read-only audit that measures what loads into every session and ranks findings by gain.
- `/cpoa:setup`: applies an audit one approved step at a time and shows before and after numbers.
- Measuring script `skills/audit/scripts/measure.mjs` (Node.js, no dependencies).

### Changed
- README leads with the problem CPOA solves and the plugin install, including where to type the commands, the install scope and `/reload-plugins`.
- The audit report fits on one screen, separates project findings from machine-wide findings, labels each finding Claude fixes, You fix or Your choice, and ends with a question that continues straight into setup.
- Setup guides the user through fixes outside Claude Code, such as rotating a key, and ends with a before and after summary.
- The repository constitution now notes that the repository is a plugin and holds one script, and the standards reviewer covers `skills/` and `.claude-plugin/`.

## [2.0.0-rc.1] — 2026-09-17

Initial public release candidate of Claude Project Operating Architecture (CPOA).

### Added
- Five core principles: Minimum Context, Minimum Delegation, Explicit Ownership, Least Privilege and Evidence Before Consequential Decisions.
- Routing model where Main Claude can work directly, use a skill, delegate to one agent or use multiple agents only when justified.
- Agent/skill/workflow/tool/MCP/CLAUDE.md classification model.
- Read-only-first project discovery and Current State → Proposed State migration flow.
- Agent creation criterion based on stable recurring unowned questions.
- Skill contract and stale-skill/source-of-truth handling.
- Role-specific permission model and fail-closed guard guidance.
- Legacy governance migration requirements.
- Test isolation, file fingerprinting and rollback requirements.
- Fresh-session and machine-readable delegation verification guidance.
- Multi-agent cost/runtime baseline guidance.
- Beginner-oriented Get Started specification.
- Minimal, specialist-team and leadership-team patterns.
