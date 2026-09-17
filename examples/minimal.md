# Example: Minimal New Project

A new application does not need an executive team on day one.

Start with:

```text
CLAUDE.md
.claude/
  skills/       only when reusable methods emerge
  agents/       only when stable specialist ownership emerges
workflows/      only for recurring SOPs
```

Main Claude handles ordinary work directly. As the project develops, observe recurring questions. If architecture/security review repeatedly requires independent context and read-only permissions, create one architecture specialist. If not, keep the system minimal.

CPOA treats *not creating an agent* as a valid architecture decision.
