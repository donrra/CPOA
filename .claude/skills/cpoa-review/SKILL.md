---
name: cpoa-review
description: >
  Method for reviewing a change to the CPOA framework against CPOA's own five
  principles and its internal consistency. Use when reviewing a diff, commit
  range or proposal that touches standard/, onboarding/, templates/, patterns/
  or QUICKSTART.md in the CPOA repository.
---

# CPOA review

## Purpose
Catch changes that make CPOA contradict itself: more context, delegation, authority or process than a task needs, or rules that disagree across files.

## Trigger
A change, commit range or written proposal that affects what CPOA tells users to do.

## Inputs
- The change. Default: `git status` for new files, plus `git diff HEAD` for staged and unstaged edits. If a commit range or proposal text is given, use that instead.
- The standard before the change: `git show HEAD:standard/CPOA.md` when the standard itself is modified.

## Method
1. **Scope.** List every changed file. Read new files in full. For modified files, read the diff and enough surrounding text to understand it.
2. **Principles.** For each change, ask:
   - *Minimum Context:* does it make more content load always, or move task-specific detail into CLAUDE.md or agent definitions?
   - *Minimum Delegation:* does it make delegation or multiple agents a default instead of a justified choice?
   - *Explicit Ownership:* does it add or require a role without a stable, recurring, unowned question? Does it duplicate ownership rules or let one role fill another role's assessment?
   - *Least Privilege:* does it widen tools or access beyond a mandate, or replace technical enforcement with a prompt-only warning?
   - *Evidence Before Consequential Decisions:* does it allow important recommendations without inspecting evidence that is available?
3. **Safeguards.** Does it weaken read-only-first discovery, fail-closed guards, test isolation, rollback or fresh-session verification?
4. **Consistency.** Grep the key terms of the change across the repository. Report where the standard, onboarding, templates, patterns, QUICKSTART, examples or tests now disagree.
5. **Process.** Per `CONTRIBUTING.md`, a change to the standard updates `CHANGELOG.md`, and examples, templates or tests where relevant.
6. **Writing rules.** Changed lines follow the writing rules in `CLAUDE.md`.
7. **Deliberate principle changes.** If a change intentionally rewrites a principle, do not score it only as a violation of the old rule. Report it as a principle change that needs the maintainer's decision, and list what else would have to change with it.

Judge only what changed. Existing problems in untouched lines go under "Not checked" at most.

## Source of truth
1. `standard/CPOA.md` at `HEAD`
2. `CLAUDE.md` in this repository
3. This skill

If this skill conflicts with a higher source, follow the higher source and report the conflict.

## Output
```text
CPOA REVIEW: PASS | CHANGES REQUESTED | NEEDS MAINTAINER DECISION
Scope: <files, and how the change was obtained>

Findings (most severe first)
1. [Principle or check] path:line
   Change: <short quote>
   Conflicts with: <standard section or file, short quote>
   Why it matters: <consequence for someone adopting CPOA>
   Direction: <what would fix it, not rewritten text>

Consistency conflicts: <files that now disagree, or "none found">
Process gaps: <missing changelog, example, template or test updates, or "none">
Questions for other owners: <wording for Main Claude, decisions for the maintainer, or "none">
Not checked: <anything skipped and why, or "none">
```
Use PASS only when there are no findings. Keep the report short.

## Boundaries
- Do not edit files or write replacement text. Suggest a direction only.
- Do not judge style beyond the writing rules.
- Do not decide whether a change ships or whether a principle should change.
