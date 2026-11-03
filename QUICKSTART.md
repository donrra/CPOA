# CPOA Quick Start

You do not need to understand agents, skills, hooks or MCP before using CPOA.

## Fastest: the plugin

Start Claude Code in a terminal inside your project (`claude`), then type these after the `>` prompt. They do not work in a plain terminal or in the VS Code chat panel.

```text
/plugin marketplace add donrra/CPOA
/plugin install cpoa@cpoa
/reload-plugins
```

If asked where to install, choose **Install for you (user scope)**.

Then run `/cpoa:audit` for a read-only report. It ends with a question about the most important fix; say yes to be guided through the fixes one approved step at a time. `/cpoa:setup` does the same in a later conversation. Use `/cpoa:setup new` for a project with no Claude setup yet.

Without the plugin, the prompts below give a similar assessment, but without measured numbers or step-by-step before and after checks.

## Existing project

Place the CPOA standard where Claude can read it, then start Claude Code in the project and use this instruction:

> Read the CPOA standard and assess this project using it. Start read-only. Inspect the current Claude/project architecture, then show me **Current State → Proposed State** before making changes. Use the minimum architecture that solves the project's real recurring needs.

Claude should first inspect the project, not immediately create agents.

Expected flow:

1. Discover the project and its existing Claude setup.
2. Classify existing instructions as project rules, agents, skills or workflows.
3. Identify duplication, stale instructions, unclear ownership and excessive permissions/context.
4. Recommend the smallest useful target architecture.
5. Explain what it would change and why.
6. Wait for approval before setup changes.
7. Implement incrementally.
8. Verify delegation, boundaries, permissions and file isolation.

## New project

Use:

> Read the CPOA standard. Help me create the minimum professional Claude architecture for this new project. Ask only for information you cannot reasonably infer. Do not create specialist agents unless a stable recurring responsibility justifies them.

## Audit only

Use:

> Audit this project's Claude architecture against CPOA. Make no changes. Show findings, evidence, risks and a proposed target architecture ordered by impact.

## Important

CPOA does not optimize for the largest organization. It optimizes for the **smallest architecture that reliably handles the work**.
