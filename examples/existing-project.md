# Example: Existing Project Migration

Assume a repository contains a large `CLAUDE.md`, 15 skills, no real agents, several persona-like skills and broad tool access.

## Current State

```text
Main Claude
├── huge CLAUDE.md
├── 'CTO' skill acting like a person
├── UX skill
├── marketing skill
└── broad shared permissions
```

## CPOA assessment

Evidence shows architecture/security decisions recur and benefit from separate read-only context. Marketing work is occasional and does not yet justify a specialist agent.

## Proposed State

```text
Main Claude
├── direct normal development
├── CTO / Architecture agent
│    └── architecture skills selected when relevant
└── reusable UX + marketing skills
```

The migration also updates legacy routing/idea templates so they do not continue treating skills as decision-makers.

## Verification

Establish Git status/fingerprint, test the CTO from a fresh session, confirm real delegation and allowed tools, confirm no writes, then compare the fingerprint. Only after this passes should another agent be considered.
