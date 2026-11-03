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
4. **Split by owner of the fix.** Machine-wide findings (files in `~/.claude/`, a parent folder's `CLAUDE.md`, user settings) affect every project and are fixed once. Project findings live in this repository. Report them separately.
5. **Label each finding** with who acts:
   - **Claude fixes:** a file change Claude can make after a yes.
   - **You fix:** an action outside Claude Code, such as rotating a key in a provider's dashboard or changing an account setting. Claude guides it step by step.
   - **Your choice:** a trade-off with no single right answer. Give the trade-off in one sentence.
6. **Rank by gain.** Order by what the user gains: risk removed first, then tokens saved every session, then confusion removed. Put a number on each where you can.
7. **Pick the first step.** Usually the top finding. Estimate how long it takes.

## Output
Write for someone who is not a developer, in the language the user writes in. Use one language throughout, and translate the headings and the three labels too. Explain a technical word the first time you use it. The report must fit on one screen: about 35 lines.

```text
CPOA AUDIT: <project name>

Every session starts with ~<total> tokens of setup. After fixes: ~<n> (<percent> less).
<one line naming the biggest source>

THIS PROJECT
1. <plain-language problem>  [Claude fixes | You fix | Your choice]
   <evidence: file or measured number> - <gain>
2. ...

YOUR MACHINE (affects all your projects, fixed once)
1. <plain-language problem>  [label]
   <evidence: file or measured number> - <gain>

WORKING WELL
<one or two lines, what is kept>

Token counts are estimates (characters / 4).
<n> smaller findings and the full current → proposed plan: ask "show details".
```

Show at most three findings per section. Then end with a single question, not a command, for example:

> The most important step is <first step>. It takes about <time>, and <I make the change | I guide you through it>. Shall we start?

Keep the details (all findings, current → proposed, what you would not add, what the script does not measure) ready for when the user asks. Always say in one line that token counts are estimates.

## After the report
- **Yes:** continue in this conversation with `${CLAUDE_PLUGIN_ROOT}/skills/setup/SKILL.md`, starting from its Baseline step and using this audit. Do not audit again. This yes only starts setup. The first step still shows its files and preview and waits for its own yes.
- **Show details:** give the full findings, current → proposed and not recommended, then ask the same question again.
- **No or later:** say that `/cpoa:setup` in a later conversation runs the audit again first, and stop.

## Source of truth
1. The project's own files and the measured numbers.
2. `standard/CPOA.md`.
3. This skill.

## Boundaries
- The audit itself is read-only by instruction. The skill pre-approves only reads, `git status` and the measuring script, so anything else would trigger the user's normal permission prompt. It does not technically block writes in permissive modes, so this rule must be followed, not relied on.
- If Node.js is missing and the script cannot run, say so, tell the user to install Node.js, and offer a manual audit without measured numbers. Do not invent numbers.
- Until the user says yes, do not edit, create or delete files or change settings, even if a fix is trivial.
- Do not open secret files such as `.env`. Report that a secret appears to be in a tracked file without printing it.
- Do not decide for the user. Recommend; every change needs the user's yes through the setup method.
