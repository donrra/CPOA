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
- An audit from `/cpoa:audit` in this conversation. If there is none and the project already has a Claude setup, run the audit method from `${CLAUDE_PLUGIN_ROOT}/skills/audit/SKILL.md` first. Setup also starts here when the user answers yes at the end of an audit.
- `$ARGUMENTS`: `new` for a project with no Claude setup yet, or the number of an audit finding to start with.
- Templates: `${CLAUDE_PLUGIN_ROOT}/templates/` (CLAUDE.md, agent, skill, workflow).

## Trigger
The user runs `/cpoa:setup`, usually after `/cpoa:audit`, or `/cpoa:setup new` for a project with no Claude setup yet. Claude does not start it on its own.

## Method
1. **Baseline.** Record `git status` and the measured token total. If the folder is not a Git repository, say so and recommend `git init` before changes, so every step can be undone.
2. **Plan.** Take the steps from the audit in its order: risk first, then tokens, then confusion. If the user said yes at the end of an audit, go straight to the preview of the first step. That yes started setup; it does not approve any change. Otherwise list the steps in one line each and ask which to start with.
3. **One step at a time.** For each step:
   - Show exactly which files change and a short preview of the change.
   - Wait for an explicit yes. A yes covers this step only.
   - Make the change. Move content rather than delete it: text that leaves `CLAUDE.md` goes to a skill, a doc that is read on demand, or the backlog, so nothing is lost.
   - Re-run the measuring script and show before → after.
   - Show `git status` and confirm only the intended files changed.
   - Ask whether to continue with the next step. Say what it is and how long it takes.
4. **Steps the user does ("You fix").** Some fixes happen outside Claude Code, such as rotating a leaked key in a provider's dashboard. Give numbered steps in plain words: where to click, what to copy, where to paste it. One screen at a time. Wait for the user to say done, then check what you can from here without reading the secret, for example with `git grep -l` on the key's prefix to list files that still match. Remove a secret from files only after the new one works, so nothing breaks in between. If the secret was committed to Git, explain that deleting the file does not remove it from history and that rotating it is the real fix.
5. **New agents.** Create an agent only for a stable, recurring question that no one else owns (standard section 6). Give it the fewest tools that do the job. If it must be read-only, enforce that with a hook or permission rule, not only with prompt text (standard section 11). After creating one, tell the user to verify it from a fresh session (standard section 16) and run the two-sided boundary test from section 17. Setup does not run these tests itself; it says what to test and how to read the result.
6. **New project (`new`).** Ask only what cannot be read from the folder. Create a short `CLAUDE.md` from the template and nothing else. Do not create agents up front (standard section 19).
7. **Stop and report.** Use the format below. Lead with the progress, because that is what the user came for.

## Output
```text
CPOA SETUP: <project name>
Every session: ~<before> → ~<after> tokens (<percent> less)
Risks removed: <n>, <one line each>
Changed: <files>
Moved, not deleted: <what went where>
Still open: <steps skipped or postponed, who acts, and why>
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
- Never read, print or ask for a secret value. Locate secrets by file and pattern only. To remove one from a settings file, delete the matching lines or rules without displaying them. The user puts new secrets in place themselves, in the provider's dashboard or their own `.env` file.
- Do not open `.env` files. Do not weaken an existing hook, deny rule or permission limit.
- Do not change user-level files in `~/.claude/` without naming them and getting a separate yes, because they affect every project.
