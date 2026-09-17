# Security

CPOA is primarily an architecture and governance framework, but its examples may influence tool permissions and external-system access.

## Principles

- Use least privilege per agent.
- Prefer read-only access for advisory/reviewer roles.
- Do not store secrets in agent, skill or workflow instructions.
- Permission guards should fail closed when role identity or policy cannot be established safely.
- A blocked action must not be bypassed through another tool, script, MCP or indirect route.
- Treat production writes, deployments, database mutation, customer contact and secret access as explicit capabilities, not defaults.

For security-sensitive deployments, verify current Claude Code permission and hook behavior against the installed version before relying on examples from this repository.
