# Pattern: Solo Developer

For many small projects the correct CPOA architecture is intentionally small.

```text
User
  ↓
Main Claude
  ├── direct implementation
  ├── focused skills as needed
  └── optional specialist reviewer only when recurring need is proven
```

Do not manufacture an organization chart for a one-person project. Add a specialist only when it repeatedly improves ownership, context isolation, permissions or review quality.

A solo project may still use strong workflows, skills, sources of truth and technical permission guards without having multiple agents.
