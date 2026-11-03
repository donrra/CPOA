# CPOA - Claude Project Operating Architecture

**Is your Claude Code setup getting slower, pricier and harder to trust as the project grows?**

Most setups grow by accident. A `CLAUDE.md` that started at 20 lines is now 400. Skills and agents pile up, some doing the same job. Permissions you clicked "allow" on once stay forever. Every one of those costs tokens in every session, and some of them are risks.

CPOA measures that, tells you what to cut, and helps you keep only the setup you actually need.

## Try it in two minutes

In Claude Code:

```text
/plugin marketplace add donrra/CPOA
/plugin install cpoa@cpoa
```

Then, in any project:

```text
/cpoa:audit
```

The audit only reads your files. You get a one-screen report. An illustrative example, not real output:

```text
CPOA AUDIT: my-app

EVERY SESSION STARTS WITH ~21,900 TOKENS OF SETUP
  CLAUDE.md and imports      ~13,500
  Memory index                ~4,300
  Skill descriptions          ~3,400
  Achievable after fixes:     ~9,000 (59% less)

TOP FINDINGS (biggest gain first)
1. Release notes and status logs sit in CLAUDE.md and load every session
   Gain: ~4,800 tokens per session
2. Two agents have no tool limit and can edit any file
   Gain: risk removed
...
```

When you want to act on it, run `/cpoa:setup`. It applies one fix at a time, asks before every change and shows the before and after numbers.

Requirements: Node.js for the measuring script. Without it the audit still runs, but without measured numbers.

How safe is it? The audit is instructed to only read, and it is pre-approved only for reading. It does not switch off your own permission settings, so if you run Claude Code in a mode that allows edits without asking, the read-only promise rests on the instruction.

## The idea behind it

Use the smallest amount of context, delegation, authority and process that can solve the task reliably. CPOA turns that into five principles:

1. **Minimum Context** - load only what the current task needs.
2. **Minimum Delegation** - work directly unless delegation creates real value.
3. **Explicit Ownership** - every agent owns a distinct recurring question.
4. **Least Privilege** - every agent gets only the tools and access it needs.
5. **Evidence Before Consequential Decisions** - inspect the cheapest authoritative evidence before important recommendations.

## Mental model

- **Agent = who** - a specialist role with a mandate, context and permissions.
- **Skill = how** - reusable knowledge, methods and checklists.
- **Workflow = sequence** - a repeatable operating procedure.
- **Tool = action** - a concrete capability such as Read, Search, Bash or Edit.
- **MCP = external bridge** - a standard way to expose external context, data and tools to Claude.
- **CLAUDE.md = project constitution** - shared project rules, routing, governance and high-value context.

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
  └── MULTIPLE AGENTS, only when justified
```

Agents are a resource, not bureaucracy. CPOA does not assume that every project needs a leadership team or even a specialist agent.

## Without the plugin

CPOA is also a plain standard you can hand to Claude. See [QUICKSTART.md](QUICKSTART.md). The authoritative text is [standard/CPOA.md](standard/CPOA.md), and the onboarding design is [onboarding/GET-STARTED.md](onboarding/GET-STARTED.md).

## Repository structure

```text
standard/        authoritative CPOA standard
skills/          the /cpoa:audit and /cpoa:setup commands
.claude-plugin/  plugin and marketplace manifests
onboarding/      guided setup experience
templates/       reusable project templates
patterns/        optional organization patterns
examples/        worked examples
tests/           verification guidance
```

## Status

**v2.0 release candidate.** The framework grew out of hands-on Claude Code work with real subagents, skills, routing, permission guards, project governance, test isolation and context optimization.

## License

MIT.
