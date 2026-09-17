# Changelog

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
