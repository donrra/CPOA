# CPOA Get Started

This specification defines the beginner-friendly onboarding experience. The interface may be implemented as a Claude Code command, skill, plugin, prompt or future UI; CPOA does not depend on one entry mechanism.

## First screen

```text
CPOA — Get Started

I'll help configure Claude for this project.

1. Set up this project
   Analyse the project and recommend the right architecture.

2. Audit existing setup
   Review agents, skills, workflows, context and permissions.

3. Start a new project
   Create a minimal Claude-ready architecture.

4. Learn how CPOA works
   Explain the architecture before changing anything.
```

Do not require a beginner to understand agents, skills, hooks or MCP before proceeding.

## Setup flow

For an existing project:

1. Start read-only.
2. Discover project type and existing Claude architecture.
3. Inspect high-value governance and sources of truth.
4. Classify agents, skills, workflows, rules and integrations.
5. Identify mixed responsibilities, stale guidance, excess context and broad permissions.
6. Recommend the minimum target architecture.
7. Show **Current State → Proposed State**.
8. Explain what is *not* recommended and why.
9. Show expected files changed/new agents/skills reused where practical.
10. Ask for approval before structural writes.
11. Implement incrementally.
12. Verify from a fresh session.

## Example assessment

```text
CPOA Project Assessment

FOUND
✓ CLAUDE.md
✓ Git repository
✓ 9 skills
✓ Supabase
✗ No specialist agents
✗ No permission guard

RECOMMENDED
Main Claude
  ├── direct work for normal development
  └── CTO / Architecture specialist
       ├── architecture
       ├── data
       └── security review

NOT RECOMMENDED YET
CEO — no recurring strategic workflow identified
CMO — no recurring marketing workflow identified
CFO — no separate recurring financial responsibility identified

WHY
Most recurring specialist work is technical. Additional agents would add context, cost and complexity without clear ownership value.

NEXT
[Show detailed plan]
[Configure project]
[Advanced options]
[Cancel]
```

The actual recommendation must come from project evidence; never copy the example organization mechanically.

## Beginner behavior

Ask only questions that cannot reasonably be inferred from the repository or safely deferred. Explain technical terms only when needed for a decision. Prefer concrete recommendations over configuration dumps.

## Advanced options

Advanced users may inspect or override agent boundaries, model/configuration, permissions, MCP/tool access, context budget, skill routing and verification depth. Overrides should be explicit and should not silently weaken safety boundaries.

## Success condition

A new user should be able to obtain a sensible CPOA proposal without first learning Claude Code architecture. The resulting project, however, should remain transparent enough for an expert to inspect every role, permission and routing decision.
