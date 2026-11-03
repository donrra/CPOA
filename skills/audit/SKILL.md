---
name: audit
description: Read-only CPOA audit of this project's Claude Code setup. Measures what loads into every session, checks agents, skills, permissions and hooks against the five CPOA principles, and proposes the smallest better setup.
disable-model-invocation: true
argument-hint: "[project folder, default: current folder]"
allowed-tools: Read, Grep, Glob, Bash(node *measure.mjs*), Bash(git status*)
---

# CPOA audit

## Purpose
Show the user, in five minutes, what their Claude Code setup costs them every session, where it is unsafe or confusing, and the smallest change that would fix it. The audit is designed to change nothing.

## Trigger
The user runs `/cpoa:audit`. Useful before changing a Claude Code setup, when sessions feel slow or expensive, or when nobody is sure what the agents and skills do any more. Claude does not start it on its own.

## Inputs
- Project folder: `$ARGUMENTS`, or the current folder if empty.
- The CPOA standard: `${CLAUDE_PLUGIN_ROOT}/standard/CPOA.md`. Read it once before judging.

## Method
1. **Measure.** Run:
   `node "${CLAUDE_PLUGIN_ROOT}/skills/audit/scripts/measure.mjs" "<project folder>"`
   Add `--json` if you need the full detail. These numbers are the evidence. Do not estimate what the script measured.
2. **Read the high-value files.** Read the project `CLAUDE.md` and its imports, every agent file and the memory index. For skills, read the frontmatter and skim the body only when a finding depends on it. Do not read the whole codebase.
3. **Check against the principles.** Look for:
   - *Minimum Context:* always-loaded text that only some tasks need. Typical cases: long procedures, status logs, changelogs, backlog content or domain detail in `CLAUDE.md`; a memory index with long entries; many skills that could be user-invoked only.
   - *Minimum Delegation:* rules that send routine work to agents or panels by default.
   - *Explicit Ownership:* agents that are really methods (should be skills), skills that act like people (should be agents or merged), two roles answering the same question, ownership rules copied into several files.
   - *Least Privilege:* agents with no `tools` field (they inherit everything), reviewer or advisory agents that can write, broad or one-off allow rules piling up in settings, secrets in tracked files, limits written only as prompt text with no hook or permission enforcing them.
   - *Evidence:* rules that let agents recommend without looking at available data.
   - *Staleness and conflict:* instructions that contradict each other across layers, references to files, tools or people that no longer exist.
4. **Rank by impact.** Order findings by what the user gains: tokens saved every session, risk removed, confusion removed. Put a number on each where you can.
5. **Propose the smallest fix.** Current State → Proposed State. Say what you would deliberately not add.

## Output
Write for someone who is not a developer. Explain a technical word the first time you use it. Keep it to one screen where possible.

```text
CPOA AUDIT: <project name>

EVERY SESSION STARTS WITH ~<total> TOKENS OF SETUP
  <biggest source>   ~<n>
  <next source>      ~<n>
  ...
  Achievable after fixes: ~<n> (<percent> less)

TOP FINDINGS (biggest gain first)
1. <plain-language problem>
   Evidence: <file:line or measured number>
   Gain: <tokens per session, risk removed or confusion removed>
   Fix: <one sentence>
2. ...

WORKING WELL
- <what already follows CPOA, so it is kept>

CURRENT → PROPOSED
  <short before/after of the setup: CLAUDE.md, agents, skills, permissions>

NOT RECOMMENDED
- <what you considered and would not add, and why>

NEXT
Run /cpoa:setup to apply these one step at a time. Nothing has been changed.
```

Limit to the five most valuable findings. Mention the rest in one line. Say which numbers are estimates (token counts are characters divided by 4) and what the script does not measure.

## Source of truth
1. The project's own files and the measured numbers.
2. `standard/CPOA.md`.
3. This skill.

## Boundaries
- Read-only by instruction. The skill pre-approves only reads, `git status` and the measuring script, so anything else would trigger the user's normal permission prompt. It does not technically block writes in permissive modes, so this rule must be followed, not relied on.
- If Node.js is missing and the script cannot run, say so, tell the user to install Node.js, and offer a manual audit without measured numbers. Do not invent numbers.
- Read-only. Do not edit, create or delete files, and do not change settings, even if a fix is trivial.
- Do not open secret files such as `.env`. Report that a secret appears to be in a tracked file without printing it.
- Do not decide for the user. Recommend; the user approves changes through `/cpoa:setup`.
