# CPOA - Claude Project Operating Architecture

**Is your Claude Code setup getting slower, pricier and harder to trust as the project grows?**

Most setups grow by accident. A `CLAUDE.md` that started at 20 lines is now 400. Skills and agents pile up, some doing the same job. Permissions you clicked "allow" on once stay forever. Every one of those costs tokens in every session, and some of them are risks.

CPOA measures that, tells you what to cut, and helps you keep only the setup you actually need.

## Try it in five minutes

You need [Claude Code](https://claude.com/claude-code) and Node.js.

**1. Open Claude Code in a terminal, inside your project.**

```text
cd path/to/your-project
claude
```

The commands below are typed into Claude Code, after the `>` prompt. They do not work in a plain terminal such as PowerShell or bash, and the plugin commands are not available in the VS Code chat panel.

**2. Install CPOA.**

```text
/plugin marketplace add donrra/CPOA
/plugin install cpoa@cpoa
```

If you are asked where to install, choose **Install for you (user scope)**. Then load it:

```text
/reload-plugins
```

Prefer a plain terminal? These do the same without starting Claude first: `claude plugin marketplace add donrra/CPOA` and `claude plugin install cpoa@cpoa`.

**3. Run the audit.**

```text
/cpoa:audit
```

It takes a few minutes and only reads your files. You get a one-screen report. An illustrative example, not real output:

```text
CPOA AUDIT: my-app

Every session starts with ~19,200 tokens (a token is about 4 characters of text) of setup.
Plus up to ~69,400 read because CLAUDE.md asks for the whole backlog at every start.
After fixes: ~13,200 (31% less, setup only) + ~3,000 still read by instruction. Biggest source: the backlog.

THIS PROJECT
1. A production key is saved in a settings file tracked by Git  [Claude fixes + You fix]
   .claude/settings.local.json - Claude untracks it; you replace the key in your host's dashboard.
2. Every session reads the whole 1,340-line backlog             [Claude fixes]
   CLAUDE.md:140 - read only the current sprint instead, saves up to ~66,000 tokens.

YOUR MACHINE (affects all your projects, fixed once)
1. 176 saved permission rules, 72 of them one-offs           [Claude fixes]
   ~/.claude/settings.json - includes read access to your whole disk without asking.

WORKING WELL
Your read-only agents are blocked by a guard, not just asked to behave.

Token counts are estimates (characters / 4).
2 smaller findings and the full current → proposed plan: ask "show details".

The most important step is the leaked key. I untrack the file, and you
get a short checklist for replacing the key. Shall we start?
```

**4. Answer the question.** Say yes, and CPOA takes you through the fixes in the same conversation, one approved step at a time. Before each change you see which files change and a preview, and nothing is written until you say yes to that step. Steps marked **Claude fixes** are file changes Claude makes this way. Steps marked **You fix** happen outside your Claude setup, such as replacing a key in a dashboard. Claude cannot see those systems, so you get a short checklist instead. Steps marked **Your choice** are trade-offs. At the end you see the before and after numbers.

Want to come back later? Run `/cpoa:setup` in a new conversation.

**Updating.** Run `claude plugin marketplace update cpoa` and `claude plugin update cpoa@cpoa` in a terminal, then restart Claude Code. `/clear` is not enough; `/reload-plugins` also works.

Without Node.js the audit still runs, but without measured numbers.

How safe is it? The audit is instructed to only read, and it is pre-approved only for reading. It does not switch off your own permission settings, so if you run Claude Code in a mode that allows edits without asking, the read-only promise rests on the instruction. Changes only start after you say yes to a specific step, and they still go through your normal permission prompts. Claude never shows your secrets and never opens `.env` files; it finds keys in your setup files by pattern and reports only file names.

What CPOA is not: a security scanner. It finds risks in your Claude setup: keys in permission rules, settings or MCP configuration, setup files tracked by Git, broad permissions and agents without tool limits. It does not check your application code, scan your Git history, or look into your hosting, database or CI, and it does not manage keys in other systems.

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
