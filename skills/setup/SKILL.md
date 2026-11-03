---
name: setup
description: Apply CPOA to this project one approved step at a time. For an existing project it starts from an audit; for a new project it creates the smallest useful Claude Code setup.
disable-model-invocation: true
argument-hint: "[new | step number from the audit]"
---

# CPOA setup

## Purpose
Turn a CPOA proposal into real changes, one small step at a time, with the user's approval before each write and proof afterwards that nothing else changed.

## Inputs
- The CPOA standard: `${CLAUDE_PLUGIN_ROOT}/standard/CPOA.md`.
- An audit from `/cpoa:audit` in this conversation. If there is none and the project already has a Claude setup, run the audit method from `${CLAUDE_PLUGIN_ROOT}/skills/audit/SKILL.md` first.
- `$ARGUMENTS`: `new` for a project with no Claude setup yet, or the number of an audit finding to start with.
- Templates: `${CLAUDE_PLUGIN_ROOT}/templates/` (CLAUDE.md, agent, skill, workflow).

## Trigger
The user runs `/cpoa:setup`, usually after `/cpoa:audit`, or `/cpoa:setup new` for a project with no Claude setup yet. Claude does not start it on its own.

## Method
1. **Baseline.** Record `git status` and the measured token total. If the folder is not a Git repository, say so and recommend `git init` before changes, so every step can be undone.
2. **Plan.** List the steps in order of gain, each in one line: what changes, what the user notices, and roughly how many tokens it saves or what risk it removes. Ask which step to start with. Default: the first.
3. **One step at a time.** For each step:
   - Show exactly which files change and a short preview of the change.
   - Wait for an explicit yes. A yes covers this step only.
   - Make the change. Move content rather than delete it: text that leaves `CLAUDE.md` goes to a skill, a doc that is read on demand, or the backlog, so nothing is lost.
   - Re-run the measuring script and show before → after.
   - Show `git status` and confirm only the intended files changed.
4. **New agents.** Create an agent only for a stable, recurring question that no one else owns (standard section 6). Give it the fewest tools that do the job. If it must be read-only, enforce that with a hook or permission rule, not only with prompt text (standard section 11). After creating one, tell the user to verify it from a fresh session (standard section 16) and run the two-sided boundary test from section 17. Setup does not run these tests itself; it says what to test and how to read the result.
5. **New project (`new`).** Ask only what cannot be read from the folder. Create a short `CLAUDE.md` from the template and nothing else. Do not create agents up front (standard section 19).
6. **Stop and report.** Use the format below.

## Output
```text
CPOA SETUP: <project name>
Every session: ~<before> → ~<after> tokens
Changed: <files>
Moved, not deleted: <what went where>
Not done: <steps skipped or postponed, and why>
Check yourself: <one or two things the user can try in Claude Code to see the difference>
Undo: git checkout -- <files>, or revert the commit
```

## Source of truth
1. The user's decisions in this conversation.
2. The project's own files.
3. `standard/CPOA.md`.
4. This skill.

## Boundaries
- The approval gate is an instruction, backed by the user's own permission prompts. It is not a technical lock, so follow it strictly.
- No write without an explicit yes for that step. Never batch several steps under one approval.
- Do not commit, push or change remote services unless the user asks.
- Do not touch secrets or `.env` files. Do not weaken an existing hook, deny rule or permission limit.
- Do not change user-level files in `~/.claude/` without naming them and getting a separate yes, because they affect every project.
