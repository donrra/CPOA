# Claude Project Operating Architecture — CPOA v2.0

## 1. Purpose

CPOA is an operating standard for designing Claude Code projects that are reliable, understandable, secure, maintainable and context-efficient. The objective is not to create as many agents as possible. It is to use the minimum architecture needed to perform recurring work well.

## 2. Core model

- **Agent = who.** A specialist worker with a stable role, mandate, context, boundaries and permissions.
- **Skill = how.** Reusable knowledge, method, procedure or checklist.
- **Workflow = sequence.** A repeatable operating procedure across steps, roles or tools.
- **Tool = action.** A concrete capability available to Claude.
- **MCP = external bridge.** A standardized connection through which external systems can expose context, data and tools.
- **CLAUDE.md = project constitution.** High-value shared rules, routing, governance, sources of truth and context that should apply broadly.

These are not a fixed execution pipeline. An agent may use zero or more skills and tools as needed.

## 3. Five operating principles

### Minimum Context
Context is scarce. No information should automatically load at a higher level if it is needed only for a subset of tasks.

```text
ALWAYS             CLAUDE.md — small shared constitution
ROLE-SPECIFIC      agent definition
TASK-SPECIFIC      relevant skill/workflow
EVIDENCE-SPECIFIC  files, code, data, MCP, web
```

Every persistent instruction should justify why it must be loaded as often as it is.

### Minimum Delegation
Main Claude should solve simple work directly when delegation adds no meaningful value. Prefer direct work, then a relevant skill, then one specialist agent, then additional agents only when independent responsibilities materially matter. More perspectives alone do not justify a panel.

### Explicit Ownership
Create a new agent only when the role owns a stable, recurring question that no existing agent owns, and separate context, mandate or permissions provide real value. A large task alone does not justify an agent.

### Least Privilege
Each agent receives only the tools and access required for its mandate. Advisory/reviewer agents should normally be read-only. Prefer technical enforcement such as permission configuration and hooks over prompt-only warnings.

### Evidence Before Consequential Decisions
Before consequential recommendations, inspect the cheapest authoritative evidence reasonably available. Do not substitute assumptions for accessible data. Evidence effort should be proportional to decision importance.

## 4. Routing before organization

The normal entry point is Main Claude, not a CEO or another specialist.

```text
USER
  ↓
MAIN CLAUDE
  ↓
ROUTING DECISION
  ├── DIRECT
  ├── SKILL
  ├── ONE AGENT
  └── MULTIPLE AGENTS
```

If the user explicitly addresses a specialist, route directly when the request fits its mandate. If a specialist discovers another mandate is materially required, identify the missing question rather than answering for that role.

## 5. Project discovery — read-only first

Before restructuring an existing project, inspect read-only: `CLAUDE.md`, `.claude/agents/`, `.claude/skills/`, hooks and permissions, workflows, architecture/product documentation, relevant backlog/roadmap, decision logs, sources of truth, MCP/tool integrations and role/persona instructions elsewhere.

Classify relevant artifacts as project constitution/rule, agent, skill, workflow, tool/integration, source of truth or legacy/mixed responsibility. Then present **Current State → Proposed State** before structural changes.

Look for simulated roles, skills treated as people, agents that are really methods, duplication, stale skills, conflicting sources, excessive persistent context, broad permissions, unclear boundaries, unnecessary agents and missing stable ownership.

## 6. Agent versus skill test

- **Who should own this recurring question?** → agent candidate.
- **How should this work be performed?** → skill candidate.
- **What repeated sequence should be followed?** → workflow candidate.
- **What must broadly apply to the project?** → CLAUDE.md candidate.
- **What concrete capability performs an action?** → tool.
- **What external system exposes context/data/tools?** → integration/MCP.

## 7. Agent design

Keep agent definitions small. Include identity, stable responsibility, mandate, boundaries, relevant skills, allowed tools/permissions, escalation rules and expected output. Do not copy skill procedures into agent definitions. Agents should select only relevant skills and explain meaningful skips when tested.

Model choice is part of agent design. Use the least expensive model/configuration that reliably performs the role; do not hardcode model names into the standard.

## 8. Skill contract

A professional skill should make these clear:

- **Purpose** — when it is useful.
- **Trigger** — what tasks make it relevant.
- **Inputs** — what must be known.
- **Method** — how the work is performed.
- **Source of truth** — what overrides the skill when facts conflict.
- **Output** — what the skill should produce.
- **Boundaries** — what it must not decide or do.

Skills are methods, not authorities. Current project contracts and authoritative evidence override stale skill content. Agents should report conflicts instead of silently following stale guidance. Review important skills periodically.

## 9. Responsibility model

Maintain one authoritative responsibility/boundary table in project governance. Do not duplicate ownership rules across many agent files. For cross-domain work, each specialist answers only its own question. Preserve disagreement rather than forcing consensus.

CEO/CTO/CMO is an optional leadership pattern, not a CPOA requirement.

## 10. Legacy governance migration

When roles change, also inspect old idea-intake rules, backlog fields, Definition of Done, templates, escalation rules, decision logs and routing instructions. Do not leave legacy rules that force one agent to fill assessments owned by several roles.

## 11. Permission enforcement

Permissions are role-specific even when enforcement code is shared. A shared guard may enforce different allowlists by active agent identity.

When an action is blocked, respect the block. An alternative is acceptable only when clearly within the same allowed mandate. Do not bypass restrictions through another tool, script, MCP, indirect command or equivalent path. If the task cannot be completed within permissions, report the block. Guards should fail closed when identity or policy cannot be determined safely.

## 12. Workflows

Workflows are repeatable SOPs. Governance defines what is allowed; agents define who owns questions; skills define how work is performed; workflows define how recurring multi-step work proceeds.

## 13. Multiple-agent threshold

Use multiple agents only when a task is materially cross-domain, expensive, high-risk, hard to reverse, strategically consequential, or explicitly requires independent mandates. Default to one relevant specialist otherwise.

The first meaningful multi-agent run in a project should record actual runtime, cost/token usage where available and operational issues such as timeouts, restarts or network interruptions. Use this measured baseline for later routing decisions rather than treating panels as free.

## 14. Observability

During agent establishment, major architecture changes, team tests or performance investigations, record useful telemetry where available: agent, task type, model/configuration, duration, cost/tokens, tools called, skills loaded, context/files inspected and outcome. Do not create heavy logging bureaucracy for ordinary trivial runs.

## 15. Test isolation

Tests are read-only by default. Before testing, record Git status and a known file baseline/fingerprint.

Governance or writing tests may intentionally create changes when mutation is the behavior being tested. In those cases: establish the baseline first, identify every test change, roll back all test artifacts afterward, and verify Git status/fingerprint returns to the expected baseline. Tests must not permanently pollute backlog, decision logs, memory or product files unless persistence itself is the explicit test objective and the user approves it.

## 16. Verify real delegation

Do not rely only on Claude saying an agent was used. For new/changed agents, test from a fresh session and use machine-readable/verbose execution evidence when available. Verify the specialist was actually delegated to, received separate context, selected relevant skills, used only allowed tools, respected boundaries/escalation and made no unauthorized changes.

When `.claude/agents/` is created for the first time, the current Claude Code session may not discover it immediately; restart or use a fresh session for verification.

## 17. Boundary tests

Every agent test must check both sides:

1. Does the agent perform work inside its mandate?
2. Does it refrain from answering or acting for neighboring mandates?

A role that gives good answers but ignores boundaries is not correctly configured.

## 18. Team test

After individual agents pass, use one realistic cross-domain case. Verify Main Claude delegates only to relevant agents, keeps assessments separate, exposes disagreement, does not let one role fill another role's fields, and synthesizes without erasing ownership. The human retains decisions outside explicit agent mandates.

## 19. New projects

Start minimal. Create only the project constitution and directories/configuration actually needed. Do not pre-create an executive team. Add agents when recurring work demonstrates stable ownership needs.

## 20. Existing projects

Migrate gradually: inspect → propose → migrate one role/concept → test → clean legacy governance → continue. Avoid large unverified rewrites of the entire Claude architecture.

## 21. Stop and report

After architecture work, report what changed, why, what was intentionally not created, ownership boundaries, permissions, verification evidence, unresolved conflicts/stale skills and expected context/token consequences.

## Final operating rule

> Use the smallest amount of context, delegation, authority and process that can solve the task reliably. Make ownership explicit, permissions enforceable and consequential recommendations evidence-based.
