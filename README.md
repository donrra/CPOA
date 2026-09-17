# CPOA — Claude Project Operating Architecture

CPOA is a practical, token-efficient operating architecture for professional Claude Code projects.

It helps a project decide when Claude should work directly, use a reusable skill, delegate to one specialist agent, or involve multiple agents — while keeping context, permissions and process as small as the task allows.

## Five principles

1. **Minimum Context** — load only what the current task needs.
2. **Minimum Delegation** — work directly unless delegation creates real value.
3. **Explicit Ownership** — every agent owns a distinct recurring question.
4. **Least Privilege** — every agent gets only the tools and access it needs.
5. **Evidence Before Consequential Decisions** — inspect the cheapest authoritative evidence before important recommendations.

## Mental model

- **Agent = who** — a specialist role with a mandate, context and permissions.
- **Skill = how** — reusable knowledge, methods and checklists.
- **Workflow = sequence** — a repeatable operating procedure.
- **Tool = action** — a concrete capability such as Read, Search, Bash or Edit.
- **MCP = external bridge** — a standardized way to expose external context, data and tools to Claude.
- **CLAUDE.md = project constitution** — shared project rules, routing, governance and high-value context.

## Get started

New to CPOA? Start with [QUICKSTART.md](QUICKSTART.md).

The authoritative operating standard is [standard/CPOA.md](standard/CPOA.md).

The guided onboarding specification is [onboarding/GET-STARTED.md](onboarding/GET-STARTED.md).

## Default routing model

```text
USER
  ↓
MAIN CLAUDE
  ↓
ROUTING DECISION
  ├── DIRECT WORK
  ├── SKILL
  ├── ONE SPECIALIST AGENT
  └── MULTIPLE AGENTS — only when justified
```

Agents are a resource, not bureaucracy. CPOA does not assume that every project needs a leadership team or even a specialist agent.

## Repository structure

```text
standard/     authoritative CPOA standard
onboarding/   guided setup experience
templates/    reusable project templates
patterns/     optional organization patterns
examples/     worked examples
tests/        verification guidance
```

## Status

**v2.0 release candidate**

The framework grew out of hands-on Claude Code architecture work involving real subagents, skills, routing, permission guards, project governance, test isolation and context optimization.

## License

MIT.
