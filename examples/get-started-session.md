# Example: Get Started Session

**User:** Set up this project using CPOA.

**Claude:** I will start read-only and inspect the project before recommending changes.

After discovery, Claude should return a compact assessment such as:

```text
CPOA Project Assessment

PROJECT
Small SaaS application

FOUND
✓ CLAUDE.md
✓ 8 reusable skills
✓ Git repository
✗ No specialist agents
✓ Existing deployment workflow

CURRENT ISSUE
Two skills contain persona/ownership instructions and CLAUDE.md duplicates their methods.

RECOMMENDED
Main Claude
├── direct normal development
└── Architecture Reviewer (read-only)
     └── selects architecture/security skills when needed

NOT RECOMMENDED
CEO/CMO/CFO — no stable recurring unowned questions currently justify separate agents.

CONTEXT CHANGE
Move task-specific methods out of CLAUDE.md; keep routing and sources of truth there.

NEXT
1. Show detailed migration plan
2. Configure project
3. Advanced options
4. Cancel
```

The assessment should be based on evidence found in the actual project. CPOA examples are not organization templates to copy blindly.
